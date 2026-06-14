"""Verification module - 1:1 face matching on election day."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from datetime import datetime, timezone
import base64
import uuid
from app.core.db import get_db
from app.core.audit import write_audit
from app.core.crypto import decrypt_template
from app.core.config import settings
from app.core.enums import (
    AuditAction, ActorType, VerifyResult, VoterStatus, Liveness
)
from app.db.models.voter import Voter
from app.db.models.biometric import BiometricTemplate
from app.db.models.verification import VerificationAttempt
from app.db.models.polling_stations import PollingStation
from app.schemas import VerificationRequest, VerificationResponse, VoteRequest, VoteResponse
import ml.inference as inference
import numpy as np

router = APIRouter(prefix="/verifications", tags=["verification"])


def _compute_decision(face_score: float, liveness: str) -> tuple[VerifyResult, float, dict]:
    """
    Compute verification decision and explainability JSON.
    
    Returns: (result, confidence, explainability_json)
    """
    # Fuse scores (face-only for now)
    confidence = face_score if liveness == "live" else 0.0
    
    # Decision logic
    if confidence >= settings.face_match_threshold:
        result = VerifyResult.approved
    elif confidence >= settings.review_floor:
        result = VerifyResult.manual_review
    else:
        result = VerifyResult.rejected
    
    # Explainability JSON (from Doc 1 §4 DecisionPanel)
    explanation_json = {
        "decision": result.value,
        "confidence": float(confidence),
        "threshold": settings.face_match_threshold,
        "breakdown": {
            "face_score": float(face_score),
            "fingerprint_score": None,
            "liveness": liveness.upper(),
            "fusion_score": float(confidence),
        },
        "flags": [],
        "explanation": f"Face match confidence {confidence:.2f}. Liveness: {liveness}.",
        "review_required": result == VerifyResult.manual_review,
    }
    
    return result, confidence, explanation_json


@router.post("/", response_model=VerificationResponse)
async def verify_voter(
    req: VerificationRequest,
    db: Session = Depends(get_db),
):
    """
    1:1 verification (election day check-in).
    
    1. Find voter by token
    2. Extract embedding from live image
    3. Decrypt stored template
    4. Compute cosine similarity
    5. Check liveness
    6. Compute decision + explainability
    7. Return attempt with JSON
    """
    # Find voter by token
    voter = db.execute(
        select(Voter).where(Voter.voter_token == req.voter_token)
    ).scalar_one_or_none()
    
    if not voter:
        raise HTTPException(status_code=404, detail="Voter not found")
    
    if voter.status == VoterStatus.voted:
        raise HTTPException(status_code=400, detail="Voter has already voted")
    
    if voter.status in (VoterStatus.blocked, VoterStatus.flagged, VoterStatus.archived):
        raise HTTPException(status_code=400, detail=f"Voter status: {voter.status.value}")
    
    # Find biometric template
    template = db.execute(
        select(BiometricTemplate).where(BiometricTemplate.voter_id == voter.id)
    ).scalar_one_or_none()
    
    if not template:
        raise HTTPException(status_code=400, detail="No biometric template for voter")
    
    try:
        image_bytes = base64.b64decode(req.face_image) if isinstance(req.face_image, str) else req.face_image
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image: {e}")
    
    # Extract live embedding
    try:
        live_embedding = inference.embed_face(image_bytes)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    # Decrypt stored template
    try:
        stored_embedding_bytes = decrypt_template(template.template_blob, b"")  # Nonce issue: need to store it
        stored_embedding = np.frombuffer(stored_embedding_bytes, dtype=np.float32)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Template decryption failed: {e}")
    
    # Compute cosine similarity (both already L2-normalized)
    face_score = float(np.dot(live_embedding, stored_embedding))
    
    # Check liveness
    liveness_result, _ = inference.check_liveness(image_bytes)
    
    # Compute decision
    result, confidence, explanation_json = _compute_decision(face_score, liveness_result)
    
    # Create attempt record
    attempt = VerificationAttempt(
        voter_id=voter.id,
        polling_station_id=req.polling_station_id,
        officer_id=req.officer_id,
        device_id=None,
        result=result,
        confidence=confidence,
        face_score=face_score,
        fingerprint_score=None,
        liveness=Liveness.live if liveness_result == "live" else Liveness.spoof,
        review_required=result == VerifyResult.manual_review,
        explanation=explanation_json.get("explanation"),
        flags=explanation_json.get("flags", []),
    )
    
    write_audit(
        db,
        action=AuditAction.VOTER_VERIFIED,
        actor_type=ActorType.officer,
        actor_id=str(req.officer_id),
        service="Verification",
        station_id=req.polling_station_id,
        detail=f"Verification: {voter.registration_ref} -> {result.value}",
    )
    
    db.add(attempt)
    db.commit()
    db.refresh(attempt)
    
    # Update voter
    voter.last_verified_at = datetime.now(timezone.utc)
    voter.last_activity_at = datetime.now(timezone.utc)
    db.commit()
    
    return VerificationResponse(
        id=attempt.id,
        voter_id=attempt.voter_id,
        result=attempt.result,
        confidence=attempt.confidence,
        liveness=attempt.liveness,
        review_required=attempt.review_required,
        explanation=attempt.explanation,
        flags=attempt.flags,
        decision=explanation_json,
        created_at=attempt.created_at,
    )


@router.post("/votes", response_model=VoteResponse)
async def cast_vote(
    req: VoteRequest,
    db: Session = Depends(get_db),
):
    """
    Cast a vote (atomically mark voter as voted).
    
    Uses row-level lock to prevent double-voting.
    """
    # Lock voter row
    voter = db.execute(
        select(Voter).where(Voter.id == req.voter_id).with_for_update()
    ).scalar_one_or_none()
    
    if not voter:
        raise HTTPException(status_code=404, detail="Voter not found")
    
    if voter.status == VoterStatus.voted:
        # Log fraud attempt
        write_audit(
            db,
            action=AuditAction.VOTER_VOTED,
            actor_type=ActorType.officer,
            actor_id=str(req.officer_id),
            service="Verification",
            station_id=req.polling_station_id,
            detail=f"DOUBLE-VOTE ATTEMPT: {voter.registration_ref}",
        )
        db.commit()
        raise HTTPException(status_code=400, detail="Voter has already voted")
    
    if voter.status in (VoterStatus.blocked, VoterStatus.flagged, VoterStatus.archived):
        raise HTTPException(status_code=400, detail=f"Voter not eligible: {voter.status.value}")
    
    # Mark voted
    voter.status = VoterStatus.voted
    voter.last_activity_at = datetime.now(timezone.utc)
    
    write_audit(
        db,
        action=AuditAction.VOTER_VOTED,
        actor_type=ActorType.officer,
        actor_id=str(req.officer_id),
        service="Verification",
        station_id=req.polling_station_id,
        detail=f"Vote cast: {voter.registration_ref}",
    )
    
    db.commit()
    db.refresh(voter)
    
    return VoteResponse(
        voter_id=voter.id,
        status=voter.status,
        voted_at=datetime.now(timezone.utc),
    )


@router.get("/station/{station_id}/log")
async def verification_log(
    station_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    """Get verification log for a polling station."""
    attempts = db.execute(
        select(VerificationAttempt).where(
            VerificationAttempt.polling_station_id == station_id
        ).order_by(VerificationAttempt.created_at.desc())
    ).scalars().all()
    
    return {
        "station_id": station_id,
        "total": len(attempts),
        "approved": sum(1 for a in attempts if a.result == VerifyResult.approved),
        "manual_review": sum(1 for a in attempts if a.result == VerifyResult.manual_review),
        "rejected": sum(1 for a in attempts if a.result == VerifyResult.rejected),
        "attempts": [
            {
                "id": str(a.id),
                "result": a.result.value,
                "confidence": a.confidence,
                "created_at": a.created_at.isoformat(),
            }
            for a in attempts
        ],
    }


@router.post("/{attempt_id}:override")
async def override_decision(
    attempt_id: uuid.UUID,
    override_result: str,
    reason: str,
    user_id: str,
    db: Session = Depends(get_db),
):
    """Supervisor override of verification decision."""
    attempt = db.execute(
        select(VerificationAttempt).where(VerificationAttempt.id == attempt_id)
    ).scalar_one_or_none()
    
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")
    
    old_result = attempt.result.value
    attempt.result = VerifyResult[override_result]
    attempt.review_required = False
    
    write_audit(
        db,
        action=AuditAction.VOTER_VERIFIED,
        actor_type=ActorType.user,
        actor_id=user_id,
        service="Verification",
        detail=f"Override: {old_result} -> {override_result}. Reason: {reason}",
    )
    
    db.commit()
    return {"status": "overridden"}
