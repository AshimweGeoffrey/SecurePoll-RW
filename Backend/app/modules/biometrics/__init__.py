"""Biometrics module - enrollment, template management, 1:N dedup trigger."""
from fastapi import APIRouter, Depends, HTTPException, Form
from sqlalchemy.orm import Session
from sqlalchemy import select
from datetime import datetime, timezone
import base64
import numpy as np
import uuid
from app.core.db import get_db
from app.core.audit import write_audit
from app.core.crypto import encrypt_template
from app.core.deps import get_current_user
from app.core.config import settings
from app.core.enums import AuditAction, ActorType, Modality, FraudType, RiskLevel, DuplicateStatus
from app.db.models.biometric import BiometricTemplate
from app.db.models.voter import Voter
from app.db.models.people import AdminUser
from app.db.models.fraud import FraudCase, DuplicateMatch
from app.schemas import EnrollmentResponse
import ml.inference as inference

router = APIRouter(prefix="/biometrics", tags=["biometrics"])


@router.post("/enroll", response_model=EnrollmentResponse)
async def enroll_face(
    voter_id: uuid.UUID = Form(...),
    face_image: str = Form(..., description="Base64-encoded face image"),
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    """
    Enroll a voter's face.
    1. Embed face -> 512-d vector
    2. Passive liveness check
    3. AES-256-GCM encrypt embedding
    4. Add to FAISS -> get faiss_id
    5. Store template
    6. 1:N dedup scan -> create DuplicateMatch/FraudCase if similarity >= threshold
    """
    voter = db.execute(select(Voter).where(Voter.id == voter_id)).scalar_one_or_none()
    if not voter:
        raise HTTPException(status_code=404, detail="Voter not found")

    try:
        image_bytes = base64.b64decode(face_image)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid base64 image: {e}")

    try:
        embedding = inference.embed_face(image_bytes)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    liveness_result, liveness_conf = inference.check_liveness(image_bytes)
    if liveness_result == "spoof":
        raise HTTPException(status_code=400, detail="Liveness check failed: spoof detected")

    quality_score = float(np.linalg.norm(embedding))  # proxy: well-normalized = ~1.0
    quality_score = min(quality_score, 1.0)

    template_blob = encrypt_template(embedding.tobytes())

    faiss_id = inference.faiss_add(embedding)

    template = BiometricTemplate(
        voter_id=voter_id,
        modality=Modality.face,
        template_blob=template_blob,
        quality_score=quality_score,
        liveness_passed=liveness_result == "live",
        captured_at=datetime.now(timezone.utc),
        faiss_id=faiss_id,
    )
    db.add(template)

    write_audit(db, action=AuditAction.BIOMETRIC_LINKED, actor_type=ActorType.user,
                actor_id=str(current_user.id), service="Biometrics",
                detail=f"Face enrolled for {voter.registration_ref}")
    db.commit()
    db.refresh(template)

    # 1:N dedup scan
    _run_dedup(db, voter, embedding, faiss_id)

    inference.faiss_save()

    return EnrollmentResponse(
        voter_id=template.voter_id,
        modality=template.modality,
        quality_score=template.quality_score,
        liveness_passed=template.liveness_passed,
        captured_at=template.captured_at,
    )


def _run_dedup(db: Session, new_voter: Voter, embedding: np.ndarray, new_faiss_id: int):
    """Search FAISS for near-duplicates and create fraud cases."""
    try:
        distances, indices = inference.faiss_search(embedding, k=10)
    except Exception:
        return

    threshold = settings.dedup_threshold

    for dist, idx in zip(distances, indices):
        if idx < 0 or idx == new_faiss_id:
            continue
        if float(dist) < threshold:
            continue

        # Find the template with this faiss_id
        other_template = db.execute(
            select(BiometricTemplate).where(BiometricTemplate.faiss_id == int(idx))
        ).scalar_one_or_none()
        if not other_template or other_template.voter_id == new_voter.id:
            continue

        # Create DuplicateMatch
        match = DuplicateMatch(
            record_a_id=new_voter.id,
            record_b_id=other_template.voter_id,
            similarity=float(dist),
            status=DuplicateStatus.pending,
        )
        db.add(match)

        # Create FraudCase
        import hashlib
        case_id = f"FR-{hashlib.md5(f'{new_voter.id}{other_template.voter_id}'.encode()).hexdigest()[:6].upper()}"
        existing_case = db.execute(
            select(FraudCase).where(FraudCase.id == case_id)
        ).scalar_one_or_none()
        if not existing_case:
            case = FraudCase(
                id=case_id,
                type=FraudType.duplicate,
                title=f"Duplicate biometric: {new_voter.registration_ref}",
                risk_level=RiskLevel.critical if float(dist) >= 0.95 else RiskLevel.review,
                voter_id=new_voter.id,
                registration_ref=new_voter.registration_ref,
                detected_by="1:N de-duplication",
                face_score=float(dist),
                opened_at=datetime.now(timezone.utc),
                similarity=float(dist),
            )
            db.add(case)

        write_audit(db, action=AuditAction.RECORD_CREATED, actor_type=ActorType.system,
                    service="Biometrics",
                    detail=f"Dedup hit: {new_voter.registration_ref} sim={dist:.3f}")

    db.commit()


@router.get("/quality/{voter_id}")
async def get_template_quality(voter_id: uuid.UUID, db: Session = Depends(get_db),
                                current_user: AdminUser = Depends(get_current_user)):
    template = db.execute(
        select(BiometricTemplate).where(
            BiometricTemplate.voter_id == voter_id,
            BiometricTemplate.modality == Modality.face,
        )
    ).scalar_one_or_none()
    if not template:
        raise HTTPException(status_code=404, detail="No biometric template found")
    return {
        "quality_score": template.quality_score,
        "liveness_passed": template.liveness_passed,
        "captured_at": template.captured_at,
    }
