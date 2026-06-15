"""Voter registry business logic."""
from sqlalchemy.orm import Session
from sqlalchemy import select, or_, func
from typing import Optional
from app.core.enums import VoterStatus, Sex, AuditAction, ActorType
from app.core.audit import write_audit
from app.db.models.voter import Voter
from app.schemas import VoterCreate, VoterUpdate
import uuid


def list_voters(db: Session, skip: int = 0, limit: int = 50, search: str = "",
                status: str = "", district: str = "") -> tuple:
    """Paginated filtered voter list. Returns (items, total)."""
    query = select(Voter)

    if search:
        query = query.where(
            or_(
                Voter.first_name.ilike(f"%{search}%"),
                Voter.last_name.ilike(f"%{search}%"),
                Voter.voter_token.ilike(f"%{search}%"),
                Voter.registration_ref.ilike(f"%{search}%"),
            )
        )
    if status:
        query = query.where(Voter.status == status)
    if district:
        query = query.where(Voter.district_id == district)

    count_q = select(func.count()).select_from(query.subquery())
    total = db.execute(count_q).scalar() or 0
    items = db.execute(query.offset(skip).limit(limit)).scalars().all()
    return list(items), total


def get_voter_by_id(db: Session, voter_id: uuid.UUID) -> Optional[Voter]:
    """Return voter by UUID, or None."""
    return db.execute(
        select(Voter).where(Voter.id == voter_id)
    ).scalar_one_or_none()


def get_voter_by_token(db: Session, voter_token: str) -> Optional[Voter]:
    """Return voter by voter_token, or None."""
    return db.execute(
        select(Voter).where(Voter.voter_token == voter_token)
    ).scalar_one_or_none()


def create_voter(db: Session, data: VoterCreate, created_by_id: str) -> Voter:
    """Create and persist a voter record with audit."""
    voter = Voter(**data.model_dump())
    db.add(voter)
    write_audit(
        db,
        action=AuditAction.RECORD_CREATED,
        actor_type=ActorType.user,
        actor_id=created_by_id,
        service="Voters",
        detail=f"Created: {data.registration_ref}",
    )
    db.commit()
    db.refresh(voter)
    return voter


def update_voter(db: Session, voter: Voter, data: VoterUpdate, updated_by_id: str) -> Voter:
    """Apply PATCH update with audit change_diff."""
    update_data = data.model_dump(exclude_unset=True)
    old_vals = {k: getattr(voter, k) for k in update_data}
    for k, v in update_data.items():
        setattr(voter, k, v)

    write_audit(
        db,
        action=AuditAction.ADDRESS_UPDATED,
        actor_type=ActorType.user,
        actor_id=updated_by_id,
        service="Voters",
        detail=f"Updated: {voter.registration_ref}",
        change_diff=[{"field": k, "old": str(old_vals[k]), "new": str(v)} for k, v in update_data.items()],
    )
    db.commit()
    db.refresh(voter)
    return voter


def set_voter_status(db: Session, voter: Voter, status: VoterStatus, actor_id: str,
                     reason: str = "") -> Voter:
    """Set voter status and write appropriate audit action."""
    voter.status = status

    if status == VoterStatus.blocked:
        action = AuditAction.RECORD_BLOCKED
        detail = f"Blocked {voter.registration_ref}: {reason}"
    elif status == VoterStatus.archived:
        action = AuditAction.RECORD_ARCHIVED
        detail = f"Archived: {voter.registration_ref}"
    elif status == VoterStatus.registered:
        action = AuditAction.STATUS_SYNCED
        detail = f"Restored: {voter.registration_ref}"
    else:
        action = AuditAction.STATUS_SYNCED
        detail = f"Status set to {status.value}: {voter.registration_ref}"

    write_audit(
        db,
        action=action,
        actor_type=ActorType.user,
        actor_id=actor_id,
        service="Voters",
        detail=detail,
    )
    db.commit()
    db.refresh(voter)
    return voter


def registry_stats(db: Session) -> dict:
    """Return count breakdown by status."""
    total = db.execute(select(func.count(Voter.id))).scalar() or 0
    breakdown = {}
    for vs in VoterStatus:
        count = db.execute(
            select(func.count(Voter.id)).where(Voter.status == vs)
        ).scalar() or 0
        breakdown[vs.value] = count
    return {"total": total, "by_status": breakdown}


def flag_voter(db: Session, voter: Voter, actor_id: str, reason: str = "") -> Voter:
    """Set voter status to flagged and write audit."""
    voter.status = VoterStatus.flagged
    from app.core.enums import AuditAction
    write_audit(
        db,
        action=AuditAction.VOTER_FLAGGED,
        actor_type=ActorType.user,
        actor_id=actor_id,
        service="Voters",
        detail=f"Flagged {voter.registration_ref}: {reason}",
    )
    db.commit()
    db.refresh(voter)
    return voter


def get_voter_verifications(db: Session, voter_id: uuid.UUID) -> list:
    """Return all verification attempts for a voter, newest first."""
    from app.db.models.verification import VerificationAttempt
    attempts = db.execute(
        select(VerificationAttempt)
        .where(VerificationAttempt.voter_id == voter_id)
        .order_by(VerificationAttempt.created_at.desc())
    ).scalars().all()
    return list(attempts)
