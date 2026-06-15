"""Audit service."""
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from typing import Optional
from app.db.models.audit import AuditEntry
from app.core.audit import verify_chain


def list_entries(db: Session, skip: int = 0, limit: int = 100,
                 action: str = "", actor_id: str = "", service: str = "") -> tuple:
    """Paginated, filtered audit entry list. Returns (items, total)."""
    query = select(AuditEntry).order_by(AuditEntry.sequence.desc())

    if action:
        query = query.where(AuditEntry.action == action)
    if actor_id:
        query = query.where(AuditEntry.actor_id == actor_id)
    if service:
        query = query.where(AuditEntry.service == service)

    total = db.execute(select(func.count(AuditEntry.id))).scalar() or 0
    entries = db.execute(query.offset(skip).limit(limit)).scalars().all()
    return list(entries), total


def get_entry(db: Session, entry_id) -> Optional[AuditEntry]:
    """Return a single AuditEntry by UUID, or None."""
    return db.execute(
        select(AuditEntry).where(AuditEntry.id == entry_id)
    ).scalar_one_or_none()


def run_chain_verify(db: Session) -> dict:
    """Call verify_chain() and return result dict with entries_walked, breaks_found,
    first_break_sequence, verified_at."""
    return verify_chain(db)


def export_entries(db: Session) -> list:
    """Return all entries ordered by sequence asc for CSV export."""
    entries = db.execute(
        select(AuditEntry).order_by(AuditEntry.sequence.asc())
    ).scalars().all()
    return list(entries)
