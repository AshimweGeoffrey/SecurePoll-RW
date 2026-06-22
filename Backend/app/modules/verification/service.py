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


# NOTE: the verification decision (face_score + liveness -> result/confidence) lives
# in app.modules.verification.__init__._build_decision, which is the single source of
# truth used by POST /verifications. A duplicate implementation previously lived here
# and was removed to avoid drift.


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
