"""Verification module - 1:1 face match on election day + vote cast."""
from fastapi import APIRouter, Depends, HTTPException, Form
from sqlalchemy.orm import Session
from sqlalchemy import select
from datetime import datetime, timezone
import base64
import uuid
import numpy as np
from app.core.db import get_db
from app.core.audit import write_audit
from app.core.crypto import decrypt_template
from app.core.config import settings
from app.core.deps import get_current_user
from app.core.enums import AuditAction, ActorType, VerifyResult, VoterStatus, Liveness
from app.db.models.voter import Voter
from app.db.models.biometric import BiometricTemplate
from app.db.models.verification import VerificationAttempt
from app.db.models.people import AdminUser
from app.schemas import VerificationRequest, VerificationResponse, VoteRequest, VoteResponse
import ml.inference as inference

router = APIRouter(tags=["verification"])


def _build_decision(face_score: float, liveness_str: str) -> tuple[VerifyResult, float, dict]:
    """Compute result, confidence, and DecisionPanel JSON."""
    liveness_pass = liveness_str == "live"
    confidence = face_score if liveness_pass else max(0.0, face_score - 0.20)

    if confidence >= settings.face_match_threshold:
        result = VerifyResult.approved
    elif confidence >= settings.review_floor:
        result = VerifyResult.manual_review
    else:
        result = VerifyResult.rejected

    flags = []
    if not liveness_pass:
        flags.append("LIVENESS_FAILED")
    if face_score < settings.review_floor:
        flags.append("LOW_FACE_SCORE")

    if result == VerifyResult.approved:
        explanation = f"Strong face match ({face_score:.2f}) with confirmed liveness."
    elif result == VerifyResult.manual_review:
        explanation = f"Borderline face match ({face_score:.2f}). Manual review required."
    else:
        explanation = f"Face match too low ({face_score:.2f}) or liveness failed."

    decision_json = {
        "decision": result.value,
        "confidence": round(confidence, 4),
        "threshold": settings.face_match_threshold,
        "breakdown": {
            "face_score": round(face_score, 4),
            "fingerprint_score": None,
            "liveness": liveness_str.upper(),
            "fusion_score": round(confidence, 4),
        },
        "flags": flags,
        "explanation": explanation,
        "review_required": result == VerifyResult.manual_review,
    }
    return result, confidence, decision_json


@router.post("/verifications", response_model=VerificationResponse)
async def verify_voter(
    req: VerificationRequest,
    db: Session = Depends(get_db),
):
    """
    Election-day 1:1 verification.
    Accepts voter_token + live face image; returns DecisionPanel JSON.
    Does not require an admin JWT (field officer endpoint).
    """
    voter = db.execute(
        select(Voter).where(Voter.voter_token == req.voter_token)
    ).scalar_one_or_none()
    if not voter:
        raise HTTPException(status_code=404, detail="Voter not found")

    if voter.status in (VoterStatus.blocked, VoterStatus.archived):
        raise HTTPException(status_code=400, detail=f"Voter not eligible: {voter.status.value}")

    template = db.execute(
        select(BiometricTemplate).where(BiometricTemplate.voter_id == voter.id)
    ).scalar_one_or_none()
    if not template:
        raise HTTPException(status_code=400, detail="No biometric template enrolled for voter")

    try:
        image_bytes = base64.b64decode(req.face_image) if isinstance(req.face_image, (str, bytes)) else req.face_image
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image: {e}")

    try:
        live_embedding = inference.embed_face(image_bytes)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Decrypt stored template (nonce prepended)
    try:
        stored_bytes = decrypt_template(template.template_blob, b"")
        stored_embedding = np.frombuffer(stored_bytes, dtype=np.float32)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Template error: {e}")

    face_score = float(np.dot(live_embedding, stored_embedding))
    liveness_str, _ = inference.check_liveness(image_bytes)

    result, confidence, decision_json = _build_decision(face_score, liveness_str)

    attempt = VerificationAttempt(
        voter_id=voter.id,
        polling_station_id=req.polling_station_id,
        officer_id=req.officer_id,
        result=result,
        confidence=confidence,
        face_score=face_score,
        fingerprint_score=None,
        liveness=Liveness.live if liveness_str == "live" else Liveness.spoof,
        review_required=result == VerifyResult.manual_review,
        explanation=decision_json["explanation"],
        flags=decision_json["flags"],
    )
    db.add(attempt)

    voter.last_verified_at = datetime.now(timezone.utc)
    voter.last_activity_at = datetime.now(timezone.utc)

    write_audit(db, action=AuditAction.VOTER_VERIFIED, actor_type=ActorType.officer,
                actor_id=str(req.officer_id), service="Verification",
                station_id=req.polling_station_id,
                detail=f"{voter.registration_ref} -> {result.value} ({confidence:.2f})")
    db.commit()
    db.refresh(attempt)

    return VerificationResponse(
        id=attempt.id,
        voter_id=attempt.voter_id,
        result=attempt.result,
        confidence=attempt.confidence,
        liveness=attempt.liveness,
        review_required=attempt.review_required,
        explanation=attempt.explanation,
        flags=attempt.flags,
        decision=decision_json,
        created_at=attempt.created_at,
    )


@router.post("/votes", response_model=VoteResponse)
async def cast_vote(req: VoteRequest, db: Session = Depends(get_db)):
    """
    Cast vote - atomically mark voter as voted using row-level lock.
    Row lock prevents concurrent double-vote: second concurrent call blocks,
    then sees status==voted and returns 409.
    """
    voter = db.execute(
        select(Voter).where(Voter.id == req.voter_id).with_for_update()
    ).scalar_one_or_none()

    if not voter:
        raise HTTPException(status_code=404, detail="Voter not found")

    if voter.status == VoterStatus.voted:
        write_audit(db, action=AuditAction.VOTER_VOTED, actor_type=ActorType.officer,
                    actor_id=str(req.officer_id), service="Verification",
                    station_id=req.polling_station_id,
                    detail=f"DOUBLE-VOTE ATTEMPT: {voter.registration_ref}")
        db.commit()
        raise HTTPException(status_code=409, detail="Voter has already voted")

    if voter.status in (VoterStatus.blocked, VoterStatus.flagged, VoterStatus.archived):
        raise HTTPException(status_code=400, detail=f"Voter not eligible: {voter.status.value}")

    voter.status = VoterStatus.voted
    voter.last_activity_at = datetime.now(timezone.utc)

    write_audit(db, action=AuditAction.VOTER_VOTED, actor_type=ActorType.officer,
                actor_id=str(req.officer_id), service="Verification",
                station_id=req.polling_station_id,
                detail=f"Vote cast: {voter.registration_ref}")
    db.commit()

    return VoteResponse(
        voter_id=voter.id,
        status=voter.status,
        voted_at=datetime.now(timezone.utc),
    )


@router.post("/verifications/{attempt_id}:override")
async def override_decision(
    attempt_id: uuid.UUID,
    override_result: str,
    reason: str,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    attempt = db.execute(
        select(VerificationAttempt).where(VerificationAttempt.id == attempt_id)
    ).scalar_one_or_none()
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")

    try:
        new_result = VerifyResult[override_result]
    except KeyError:
        raise HTTPException(status_code=400, detail=f"Invalid result: {override_result}")

    old_result = attempt.result.value
    attempt.result = new_result
    attempt.review_required = False

    write_audit(db, action=AuditAction.VOTER_VERIFIED, actor_type=ActorType.user,
                actor_id=str(current_user.id), service="Verification",
                detail=f"Override: {old_result} -> {override_result}. {reason}")
    db.commit()
    return {"status": "overridden", "new_result": override_result}


@router.get("/verifications/station/{station_id}/log")
async def station_log(station_id: uuid.UUID, db: Session = Depends(get_db),
                      current_user: AdminUser = Depends(get_current_user)):
    attempts = db.execute(
        select(VerificationAttempt).where(
            VerificationAttempt.polling_station_id == station_id
        ).order_by(VerificationAttempt.created_at.desc())
    ).scalars().all()

    from app.core.enums import VerifyResult as VR
    return {
        "station_id": str(station_id),
        "total": len(attempts),
        "approved": sum(1 for a in attempts if a.result == VR.approved),
        "manual_review": sum(1 for a in attempts if a.result == VR.manual_review),
        "rejected": sum(1 for a in attempts if a.result == VR.rejected),
        "attempts": [
            {
                "id": str(a.id),
                "voter_id": str(a.voter_id),
                "result": a.result.value,
                "confidence": a.confidence,
                "liveness": a.liveness.value,
                "review_required": a.review_required,
                "created_at": a.created_at.isoformat() if a.created_at else None,
            }
            for a in attempts
        ],
    }
