"""Biometrics module - enrollment and template management."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from datetime import datetime, timezone
import base64
import numpy as np
import uuid
from app.core.db import get_db
from app.core.audit import write_audit
from app.core.crypto import encrypt_template
from app.core.enums import AuditAction, ActorType, Modality
from app.db.models.biometric import BiometricTemplate
from app.db.models.voter import Voter
from app.schemas import EnrollmentRequest, EnrollmentResponse
import ml.inference as inference

router = APIRouter(prefix="/biometrics", tags=["biometrics"])


@router.post("/enroll", response_model=EnrollmentResponse)
async def enroll_face(req: EnrollmentRequest, user_id: str, db: Session = Depends(get_db)):
    """
    Enroll a voter's face biometric.
    
    1. Decode image
    2. Extract face embedding
    3. Check liveness
    4. Encrypt template
    5. Add to FAISS for 1:N dedup
    6. Store in DB
    """
    # Verify voter exists
    voter = db.execute(select(Voter).where(Voter.id == req.voter_id)).scalar_one_or_none()
    if not voter:
        raise HTTPException(status_code=404, detail="Voter not found")
    
    try:
        # Decode base64 image
        image_bytes = base64.b64decode(req.face_image) if isinstance(req.face_image, str) else req.face_image
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image encoding: {e}")
    
    try:
        # Extract face embedding
        embedding = inference.embed_face(image_bytes)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    # Check liveness
    liveness_result, liveness_confidence = inference.check_liveness(image_bytes)
    liveness_passed = liveness_result == "live"
    
    if not liveness_passed:
        raise HTTPException(
            status_code=400,
            detail=f"Liveness check failed: {liveness_result}",
        )
    
    # Encrypt template
    quality_score = 0.95  # Stub: extract from model
    template_blob, nonce = encrypt_template(embedding.tobytes())
    
    # Add to FAISS
    faiss_id = inference.faiss_add(embedding)
    
    # Create template record
    template = BiometricTemplate(
        voter_id=req.voter_id,
        modality=Modality.face,
        template_blob=template_blob,  # encrypted
        quality_score=quality_score,
        liveness_passed=liveness_passed,
        captured_at=datetime.now(timezone.utc),
        device_id=None,
        key_id=None,
        faiss_id=faiss_id,
    )
    
    write_audit(
        db,
        action=AuditAction.BIOMETRIC_LINKED,
        actor_type=ActorType.user,
        actor_id=user_id,
        service="Biometrics",
        detail=f"Face enrolled for voter {voter.registration_ref}",
    )
    
    db.add(template)
    db.commit()
    db.refresh(template)
    
    # Persist FAISS to disk
    inference.faiss_save()
    
    return EnrollmentResponse(
        voter_id=template.voter_id,
        modality=template.modality,
        quality_score=template.quality_score,
        liveness_passed=template.liveness_passed,
        captured_at=template.captured_at,
    )


@router.get("/quality/{voter_id}")
async def get_template_quality(voter_id: uuid.UUID, db: Session = Depends(get_db)):
    """Get biometric template quality for a voter."""
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
