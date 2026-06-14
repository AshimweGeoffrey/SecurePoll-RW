"""Verification module - 1:1 face match on election day + vote cast."""
from fastapi import APIRouter, Depends, HTTPException, Form
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from datetime import datetime, timezone
import base64
import uuid
from typing import Optional
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


def _build_decision(face_score: float, liveness_str: str) -> tuple:
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


@router.post(
    "/verifications",
    response_model=VerificationResponse,
    summary="Election-day 1:1 biometric verification",
    description=(
        "Core election-day endpoint — verifies a voter's identity by comparing a live face "
        "image against the stored ArcFace template.  \n\n"
        "**No JWT required** — this endpoint is called by field-officer devices using only "
        "a voter token and a live camera frame.\n\n"
        "**Decision pipeline:**\n"
        "1. Look up voter by `voter_token`.\n"
        "2. Check eligibility (blocked/archived voters are rejected).\n"
        "3. Retrieve and AES-256-GCM decrypt the stored embedding.\n"
        "4. Embed the live face with ArcFace and compute cosine similarity.\n"
        "5. Run liveness detection — liveness failure penalises confidence by −0.20.\n"
        "6. Apply thresholds: `approved` ≥ face_match_threshold, "
        "`manual_review` ≥ review_floor, otherwise `rejected`.\n"
        "7. Persist a `VerificationAttempt` row and write audit log.\n\n"
        "Returns a `DecisionPanel` JSON with full explainability breakdown."
    ),
    response_description="Verification decision with confidence score, liveness result, flags, and full DecisionPanel.",
    responses={
        400: {
            "description": (
                "Invalid image encoding, no face detected, no biometric template enrolled, "
                "or voter is ineligible (blocked/archived)."
            )
        },
        404: {"description": "Voter token not found."},
        500: {"description": "Stored template decryption error."},
    },
)
async def verify_voter(
    req: VerificationRequest,
    db: Session = Depends(get_db),
):
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


@router.get(
    "/verifications",
    summary="List verification attempts with pagination",
    description=(
        "Retrieve a paginated list of all verification attempts across all polling stations.  \n\n"
        "**Query parameters:**\n"
        "- `skip` / `limit` — pagination offset and page size (default 50).\n"
        "- `station_id` — optional UUID to filter attempts by polling station.\n\n"
        "Results are ordered newest-first."
    ),
    response_description="Paginated list of verification attempt records.",
    responses={
        401: {"description": "Not authenticated."},
    },
)
async def list_verifications(
    skip: int = 0,
    limit: int = 50,
    station_id: Optional[uuid.UUID] = None,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    query = select(VerificationAttempt).order_by(VerificationAttempt.created_at.desc())
    if station_id is not None:
        query = query.where(VerificationAttempt.polling_station_id == station_id)

    total = db.execute(
        select(func.count(VerificationAttempt.id))
    ).scalar() or 0
    items = db.execute(query.offset(skip).limit(limit)).scalars().all()

    return {
        "total": total,
        "items": [
            {
                "id": str(a.id),
                "voter_id": str(a.voter_id) if a.voter_id else None,
                "polling_station_id": str(a.polling_station_id) if a.polling_station_id else None,
                "officer_id": str(a.officer_id) if a.officer_id else None,
                "result": a.result.value,
                "confidence": a.confidence,
                "face_score": a.face_score,
                "liveness": a.liveness.value,
                "review_required": a.review_required,
                "explanation": a.explanation,
                "flags": a.flags,
                "created_at": a.created_at.isoformat() if a.created_at else None,
            }
            for a in items
        ],
    }


@router.get(
    "/verifications/{attempt_id}",
    summary="Get a single verification attempt by ID",
    description=(
        "Retrieve the full record of a single verification attempt by its UUID.  "
        "Returns the complete decision breakdown including face score, confidence, liveness, "
        "flags, and explanation."
    ),
    response_description="Full verification attempt record.",
    responses={
        401: {"description": "Not authenticated."},
        404: {"description": "Verification attempt not found."},
    },
)
async def get_verification(
    attempt_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    attempt = db.execute(
        select(VerificationAttempt).where(VerificationAttempt.id == attempt_id)
    ).scalar_one_or_none()
    if not attempt:
        raise HTTPException(status_code=404, detail="Verification attempt not found")

    return {
        "id": str(attempt.id),
        "voter_id": str(attempt.voter_id) if attempt.voter_id else None,
        "polling_station_id": str(attempt.polling_station_id) if attempt.polling_station_id else None,
        "officer_id": str(attempt.officer_id) if attempt.officer_id else None,
        "result": attempt.result.value,
        "confidence": attempt.confidence,
        "face_score": attempt.face_score,
        "fingerprint_score": attempt.fingerprint_score,
        "liveness": attempt.liveness.value,
        "review_required": attempt.review_required,
        "explanation": attempt.explanation,
        "flags": attempt.flags,
        "created_at": attempt.created_at.isoformat() if attempt.created_at else None,
    }


@router.post(
    "/votes",
    response_model=VoteResponse,
    summary="Cast a vote — atomically marks voter as voted",
    description=(
        "Atomically marks a voter as `voted` using a PostgreSQL `SELECT … FOR UPDATE` row-lock.  \n\n"
        "**Double-vote protection:**  \n"
        "If two concurrent requests arrive for the same voter, the second blocks on the lock, "
        "then detects `status == voted` and returns **409 Conflict** — the vote is not counted twice.  \n\n"
        "**Preconditions:**  \n"
        "- Voter must exist.\n"
        "- Status must be `registered` or `verified` — `blocked`, `flagged`, and `archived` are rejected.\n"
        "- `status == voted` returns 409 (double-vote attempt, also logged to audit).\n\n"
        "No JWT required — field officers call this directly after verification."
    ),
    response_description="Vote confirmation with voter ID, new status, and timestamp.",
    responses={
        400: {"description": "Voter is ineligible (blocked, flagged, or archived)."},
        404: {"description": "Voter not found."},
        409: {"description": "Voter has already voted (double-vote attempt)."},
    },
)
async def cast_vote(req: VoteRequest, db: Session = Depends(get_db)):
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


@router.post(
    "/verifications/{attempt_id}:override",
    summary="Override a verification decision (manual review)",
    description=(
        "Allows a supervisor to override the automated verification result of an attempt "
        "that was flagged for manual review.  \n\n"
        "**Parameters:**\n"
        "- `override_result` — new result string (`approved`, `rejected`, or `manual_review`).\n"
        "- `reason` — mandatory justification text written to the audit log.\n\n"
        "Sets `review_required` to `false` after override."
    ),
    response_description="Confirmation of the override with the new result value.",
    responses={
        400: {"description": "Invalid result string."},
        401: {"description": "Not authenticated."},
        404: {"description": "Verification attempt not found."},
    },
)
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


@router.get(
    "/verifications/station/{station_id}/log",
    summary="Get verification log for a polling station",
    description=(
        "Returns all verification attempts recorded at a specific polling station, "
        "ordered newest-first, together with an aggregate summary (approved / manual_review / rejected counts).  \n\n"
        "Useful for supervisors monitoring a station in real time."
    ),
    response_description="Station summary and list of verification attempts.",
    responses={
        401: {"description": "Not authenticated."},
    },
)
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
