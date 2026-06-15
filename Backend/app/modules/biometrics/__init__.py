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


@router.post(
    "/enroll",
    response_model=EnrollmentResponse,
    summary="Enrol a voter's face biometric",
    description=(
        "Full biometric enrolment pipeline for a single voter:  \n\n"
        "1. Decode the Base64 face image.\n"
        "2. Run **ArcFace** inference to produce a 512-dimensional embedding.\n"
        "3. Perform **passive liveness detection** — rejects spoofed/printed photos.\n"
        "4. Encrypt the embedding with **AES-256-GCM** (random 96-bit nonce per template).\n"
        "5. Add the embedding to the **FAISS** flat-L2 index and record the `faiss_id`.\n"
        "6. Persist the `BiometricTemplate` row.\n"
        "7. Run **1:N deduplication** — if any existing template has cosine similarity "
        "above the configured threshold, a `DuplicateMatch` and `FraudCase` are auto-created.\n\n"
        "**Form fields:**  \n"
        "- `voter_id` — UUID of the voter to enrol.\n"
        "- `face_image` — Base64-encoded JPEG or PNG face image."
    ),
    response_description="Enrolment confirmation with quality score and liveness result.",
    responses={
        400: {
            "description": (
                "Voter not found, invalid Base64 image, no face detected in image, "
                "or liveness check failed (spoof detected)."
            )
        },
        401: {"description": "Not authenticated."},
    },
)
async def enroll_face(
    voter_id: uuid.UUID = Form(...),
    face_image: str = Form(..., description="Base64-encoded face image"),
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
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


@router.get(
    "/quality/{voter_id}",
    summary="Get biometric template quality for a voter",
    description=(
        "Returns the quality score, liveness result, and capture timestamp for the face "
        "biometric template enrolled for the given voter.  \n\n"
        "**Quality score** is a proxy derived from the L2 norm of the ArcFace embedding "
        "(well-normalised embeddings score close to 1.0).  "
        "Returns **404** if no template has been enrolled yet."
    ),
    response_description="Template quality metadata.",
    responses={
        401: {"description": "Not authenticated."},
        404: {"description": "No biometric template enrolled for this voter."},
    },
)
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


# ---------------------------------------------------------------------------
# Added endpoints
# ---------------------------------------------------------------------------

@router.get(
    "/templates",
    summary="List all biometric templates with pagination",
    description=(
        "Returns a paginated list of all enrolled biometric templates across all voters.  \n\n"
        "Each item includes the voter UUID, modality, quality score, liveness result, "
        "capture timestamp, FAISS index ID, and template UUID."
    ),
    response_description="Paginated template list with total count.",
    responses={
        401: {"description": "Not authenticated."},
    },
)
async def list_templates(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    """List all biometric templates paginated."""
    from sqlalchemy import func as sqlfunc
    total = db.execute(
        select(sqlfunc.count(BiometricTemplate.id))
    ).scalar() or 0
    items = db.execute(
        select(BiometricTemplate).offset(skip).limit(limit)
    ).scalars().all()
    return {
        "total": total,
        "items": [
            {
                "id": str(t.id),
                "voter_id": str(t.voter_id),
                "modality": t.modality.value,
                "quality_score": t.quality_score,
                "liveness_passed": t.liveness_passed,
                "captured_at": t.captured_at.isoformat() if t.captured_at else None,
                "faiss_id": t.faiss_id,
            }
            for t in items
        ],
    }


@router.delete(
    "/templates/{voter_id}",
    summary="Delete the biometric template for a voter",
    description=(
        "Permanently removes the face biometric template enrolled for the given voter.  \n\n"
        "**Warning:** this is a hard delete — the template cannot be recovered.  "
        "The voter will need to be re-enrolled before they can be biometrically verified.  "
        "An audit entry is written for every deletion."
    ),
    response_description="Confirmation that the template was deleted.",
    responses={
        401: {"description": "Not authenticated."},
        404: {"description": "No biometric template found for this voter."},
    },
)
async def delete_template(
    voter_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    """Delete the biometric template for a voter and write audit."""
    template = db.execute(
        select(BiometricTemplate).where(BiometricTemplate.voter_id == voter_id)
    ).scalar_one_or_none()
    if not template:
        raise HTTPException(status_code=404, detail="No biometric template found for this voter")

    write_audit(
        db,
        action=AuditAction.TEMPLATE_ACCESSED,
        actor_type=ActorType.user,
        actor_id=str(current_user.id),
        service="Biometrics",
        detail=f"Template deleted for voter: {voter_id}",
    )
    db.delete(template)
    db.commit()
    return {"status": "deleted", "voter_id": str(voter_id)}


@router.post(
    "/dedup-scan/{voter_id}",
    summary="Re-run 1:N deduplication scan for a voter",
    description=(
        "Re-runs the 1:N FAISS deduplication scan for a voter's existing enrolled template.  \n\n"
        "Retrieves the stored encrypted template, decrypts and re-embeds the raw bytes, then "
        "searches the FAISS index for near-duplicates above the configured `dedup_threshold`.  \n\n"
        "Any hits that are not already recorded as `DuplicateMatch` records will be created, "
        "together with associated `FraudCase` entries.  "
        "Returns the list of duplicate hits found."
    ),
    response_description="List of duplicate hit dicts, each with voter_id, similarity, and case_id.",
    responses={
        400: {"description": "No biometric template enrolled for this voter."},
        401: {"description": "Not authenticated."},
        500: {"description": "Template decryption error."},
    },
)
async def dedup_scan(
    voter_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    """Re-run 1:N dedup scan for a voter's existing enrolled template."""
    from app.core.crypto import decrypt_template
    from app.modules.biometrics.service import run_dedup_scan

    voter = db.execute(select(Voter).where(Voter.id == voter_id)).scalar_one_or_none()
    if not voter:
        raise HTTPException(status_code=404, detail="Voter not found")

    template = db.execute(
        select(BiometricTemplate).where(BiometricTemplate.voter_id == voter_id)
    ).scalar_one_or_none()
    if not template:
        raise HTTPException(status_code=400, detail="No biometric template enrolled for this voter")

    try:
        stored_bytes = decrypt_template(template.template_blob, b"")
        embedding = np.frombuffer(stored_bytes, dtype=np.float32)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Template decryption error: {e}")

    faiss_id = template.faiss_id if template.faiss_id is not None else -1
    hits = run_dedup_scan(db, voter, embedding, faiss_id, settings.dedup_threshold)

    return {
        "voter_id": str(voter_id),
        "hits_found": len(hits),
        "hits": hits,
    }
