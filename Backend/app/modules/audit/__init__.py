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


@router.get(
    "/entries",
    summary="List audit log entries with filtering",
    description=(
        "Browse the append-only audit log.  Results are ordered newest-first (by sequence number).  \n\n"
        "**Query parameters:**\n"
        "- `skip` / `limit` — pagination (default 100 per page).\n"
        "- `action` — filter by `AuditAction` enum value (e.g. `LOGIN`, `VOTER_VERIFIED`).\n"
        "- `actor_id` — filter by the UUID or string ID of the actor.\n"
        "- `service` — filter by originating service name (e.g. `Auth`, `Verification`).\n\n"
        "Every write operation across the system (login, enrolment, vote, override, etc.) "
        "produces an immutable entry with a SHA-256 hash chaining it to the previous entry."
    ),
    response_description="Paginated audit entry list with total count.",
    responses={
        401: {"description": "Not authenticated."},
    },
)
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


@router.get(
    "/entries/{entry_id}",
    response_model=AuditEntryResponse,
    summary="Get a single audit entry by UUID",
    description=(
        "Retrieve one audit entry by its UUID primary key.  "
        "The entry includes its SHA-256 `entry_hash` and the `prev_hash` of the preceding entry, "
        "allowing manual chain verification."
    ),
    response_description="Full audit entry including hash chain fields.",
    responses={
        401: {"description": "Not authenticated."},
        404: {"description": "Audit entry not found."},
    },
)
async def get_audit_entry(entry_id: uuid.UUID, db: Session = Depends(get_db),
                           current_user: AdminUser = Depends(get_current_user)):
    entry = db.execute(
        select(AuditEntry).where(AuditEntry.id == entry_id)
    ).scalar_one_or_none()
    if not entry:
        raise HTTPException(status_code=404, detail="Audit entry not found")
    return entry


@router.post(
    ":verify-chain",
    response_model=ChainVerificationResponse,
    summary="Verify SHA-256 hash-chain integrity",
    description=(
        "Walk every entry in the audit log in sequence order and recompute each SHA-256 hash, "
        "checking it against the stored `entry_hash`.  \n\n"
        "**Tamper detection:**  "
        "If any database row has been modified (via direct SQL UPDATE or DELETE), "
        "the recomputed hash will differ from the stored value and a *break* is recorded.  \n\n"
        "Returns:\n"
        "- `entries_walked` — total rows checked.\n"
        "- `breaks_found` — number of hash mismatches.\n"
        "- `first_break_sequence` — sequence number of the earliest tampered entry (`null` if clean).\n"
        "- `duration_ms` — time taken for the full walk.\n\n"
        "This is a **read-only** operation — it does not modify any data."
    ),
    response_description="Chain verification result with tamper detection summary.",
    responses={
        401: {"description": "Not authenticated."},
    },
)
async def verify_audit_chain(db: Session = Depends(get_db),
                              current_user: AdminUser = Depends(get_current_user)):
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


@router.get(
    ":export",
    summary="Export audit log as CSV",
    description=(
        "Download the complete audit log as a CSV file ordered by sequence number (oldest first).  \n\n"
        "The CSV includes all fields needed for offline chain verification:  \n"
        "`sequence`, `occurred_at`, `action`, `actor_type`, `actor_id`, `actor_role`, "
        "`service`, `detail`, `entry_hash`, `prev_hash`."
    ),
    response_description="CSV file download (`Content-Disposition: attachment; filename=audit_log.csv`).",
    responses={
        401: {"description": "Not authenticated."},
    },
)
async def export_audit(
    format: str = "csv",
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
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
