"""Field officer business logic."""
from typing import Optional, Tuple, List
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from app.db.models.people import FieldOfficer
from app.db.models.verification import VerificationAttempt
from app.schemas import FieldOfficerCreate
import uuid


def list_officers(
    db: Session,
    district_id: Optional[uuid.UUID] = None,
    skip: int = 0,
    limit: int = 50,
) -> Tuple[List[FieldOfficer], int]:
    """Return a page of field officers and the total count."""
    query = select(FieldOfficer)
    if district_id is not None:
        query = query.where(FieldOfficer.assigned_district_id == district_id)
    total = db.execute(select(func.count()).select_from(query.subquery())).scalar()
    items = db.execute(query.offset(skip).limit(limit)).scalars().all()
    return items, total


def create_officer(db: Session, data: FieldOfficerCreate) -> FieldOfficer:
    """Persist a new FieldOfficer row."""
    officer = FieldOfficer(**data.model_dump())
    db.add(officer)
    db.flush()
    return officer


def get_officer(db: Session, officer_id: uuid.UUID) -> Optional[FieldOfficer]:
    """Fetch a single FieldOfficer by primary key. Returns None if not found."""
    return db.execute(
        select(FieldOfficer).where(FieldOfficer.id == officer_id)
    ).scalar_one_or_none()


def update_officer(db: Session, officer: FieldOfficer, **fields) -> FieldOfficer:
    """Apply keyword-argument field updates to a FieldOfficer and flush."""
    for key, value in fields.items():
        setattr(officer, key, value)
    db.flush()
    return officer


def delete_officer(db: Session, officer: FieldOfficer) -> None:
    """Hard-delete a FieldOfficer row."""
    db.delete(officer)
    db.flush()


def officer_stats(db: Session, officer_id: uuid.UUID) -> dict:
    """Return verification attempt counts grouped by result for one officer."""
    from app.core.enums import VerifyResult

    total = db.execute(
        select(func.count(VerificationAttempt.id)).where(
            VerificationAttempt.officer_id == officer_id
        )
    ).scalar() or 0

    approved = db.execute(
        select(func.count(VerificationAttempt.id)).where(
            VerificationAttempt.officer_id == officer_id,
            VerificationAttempt.result == VerifyResult.approved,
        )
    ).scalar() or 0

    manual_review = db.execute(
        select(func.count(VerificationAttempt.id)).where(
            VerificationAttempt.officer_id == officer_id,
            VerificationAttempt.result == VerifyResult.manual_review,
        )
    ).scalar() or 0

    rejected = db.execute(
        select(func.count(VerificationAttempt.id)).where(
            VerificationAttempt.officer_id == officer_id,
            VerificationAttempt.result == VerifyResult.rejected,
        )
    ).scalar() or 0

    return {
        "officer_id": str(officer_id),
        "total": total,
        "approved": approved,
        "manual_review": manual_review,
        "rejected": rejected,
    }
