"""Audit module - hash-chained immutable log + chain verification."""
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import select, func
import csv
import io
from datetime import datetime, timezone
import uuid
from app.core.db import get_db
from app.core.audit import verify_chain
from app.core.deps import get_current_user
from app.db.models.audit import AuditEntry
from app.db.models.people import AdminUser
from app.schemas import AuditEntryResponse, ChainVerificationResponse

router = APIRouter(prefix="/audit", tags=["audit"])


@router.get("/entries")
async def list_audit_entries(
    skip: int = 0,
    limit: int = 100,
    action: str = "",
    actor_id: str = "",
    service: str = "",
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    query = select(AuditEntry).order_by(AuditEntry.sequence.desc())

    if action:
        query = query.where(AuditEntry.action == action)
    if actor_id:
        query = query.where(AuditEntry.actor_id == actor_id)
    if service:
        query = query.where(AuditEntry.service == service)

    total = db.execute(select(func.count(AuditEntry.id))).scalar()
    entries = db.execute(query.offset(skip).limit(limit)).scalars().all()

    return {
        "total": total,
        "items": [AuditEntryResponse.model_validate(e) for e in entries],
    }


@router.get("/entries/{entry_id}", response_model=AuditEntryResponse)
async def get_audit_entry(entry_id: uuid.UUID, db: Session = Depends(get_db),
                           current_user: AdminUser = Depends(get_current_user)):
    entry = db.execute(
        select(AuditEntry).where(AuditEntry.id == entry_id)
    ).scalar_one_or_none()
    if not entry:
        raise HTTPException(status_code=404, detail="Audit entry not found")
    return entry


@router.post(":verify-chain", response_model=ChainVerificationResponse)
async def verify_audit_chain(db: Session = Depends(get_db),
                              current_user: AdminUser = Depends(get_current_user)):
    """
    Walk the full audit chain and verify every entry_hash.
    Tamper any row in psql -> this endpoint reports the break.
    Returns: entries_walked, breaks_found, first_break_sequence, duration_ms.
    """
    start = datetime.now(timezone.utc)
    result = verify_chain(db)
    duration_ms = int((datetime.now(timezone.utc) - start).total_seconds() * 1000)

    return ChainVerificationResponse(
        entries_walked=result["entries_walked"],
        breaks_found=result["breaks_found"],
        first_break_sequence=result["first_break_sequence"],
        verified_at=result["verified_at"],
        duration_ms=duration_ms,
    )


@router.get(":export")
async def export_audit(
    format: str = "csv",
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    """Export audit log as CSV."""
    entries = db.execute(
        select(AuditEntry).order_by(AuditEntry.sequence.asc())
    ).scalars().all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "sequence", "occurred_at", "action", "actor_type", "actor_id",
        "actor_role", "service", "detail", "entry_hash", "prev_hash",
    ])
    for e in entries:
        writer.writerow([
            e.sequence, e.occurred_at, e.action.value, e.actor_type.value,
            e.actor_id, e.actor_role, e.service, e.detail,
            e.entry_hash, e.prev_hash,
        ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=audit_log.csv"},
    )
