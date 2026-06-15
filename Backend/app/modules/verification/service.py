"""Verification business logic."""
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from typing import Optional
from app.db.models.verification import VerificationAttempt
from app.core.enums import VerifyResult
from app.core.config import settings
import uuid


def list_verifications(db: Session, skip: int = 0, limit: int = 50,
                       station_id: Optional[uuid.UUID] = None) -> tuple:
    """Paginated list of verification attempts. Returns (items, total)."""
    query = select(VerificationAttempt).order_by(VerificationAttempt.created_at.desc())
    if station_id is not None:
        query = query.where(VerificationAttempt.polling_station_id == station_id)

    total = db.execute(select(func.count(VerificationAttempt.id))).scalar() or 0
    items = db.execute(query.offset(skip).limit(limit)).scalars().all()
    return list(items), total


def get_verification(db: Session, attempt_id: uuid.UUID) -> Optional[VerificationAttempt]:
    """Return a single VerificationAttempt by ID, or None."""
    return db.execute(
        select(VerificationAttempt).where(VerificationAttempt.id == attempt_id)
    ).scalar_one_or_none()


def build_decision(face_score: float, liveness_str: str,
                   face_threshold: float, review_floor: float) -> tuple:
    """
    Return (VerifyResult, confidence, decision_json dict).

    Liveness failure penalises confidence by -0.20.
    """
    liveness_pass = liveness_str == "live"
    confidence = face_score if liveness_pass else max(0.0, face_score - 0.20)

    if confidence >= face_threshold:
        result = VerifyResult.approved
    elif confidence >= review_floor:
        result = VerifyResult.manual_review
    else:
        result = VerifyResult.rejected

    flags = []
    if not liveness_pass:
        flags.append("LIVENESS_FAILED")
    if face_score < review_floor:
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
        "threshold": face_threshold,
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


def station_summary(db: Session, station_id: uuid.UUID) -> dict:
    """Return total/approved/manual_review/rejected counts for a station."""
    base = select(func.count(VerificationAttempt.id)).where(
        VerificationAttempt.polling_station_id == station_id
    )
    total = db.execute(base).scalar() or 0
    approved = db.execute(
        base.where(VerificationAttempt.result == VerifyResult.approved)
    ).scalar() or 0
    manual_review = db.execute(
        base.where(VerificationAttempt.result == VerifyResult.manual_review)
    ).scalar() or 0
    rejected = db.execute(
        base.where(VerificationAttempt.result == VerifyResult.rejected)
    ).scalar() or 0
    return {
        "station_id": str(station_id),
        "total": total,
        "approved": approved,
        "manual_review": manual_review,
        "rejected": rejected,
    }
