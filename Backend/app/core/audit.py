"""Audit logging with hash chaining."""
import hashlib
import json
from datetime import datetime, timezone
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.db.models.audit import AuditEntry
from app.core.enums import AuditAction, ActorType
from typing import Optional, Any


def _hash(payload: dict, prev_hash: str) -> str:
    """
    Compute SHA256 hash of canonical JSON payload + previous hash.
    """
    canonical = json.dumps(payload, sort_keys=True, separators=(",", ":"))
    full_input = canonical + prev_hash
    return hashlib.sha256(full_input.encode()).hexdigest()


def write_audit(
    db: Session,
    *,
    action: AuditAction,
    actor_type: ActorType,
    actor_id: Optional[str] = None,
    actor_role: Optional[str] = None,
    service: Optional[str] = None,
    station_id: Optional[Any] = None,
    ip: Optional[str] = None,
    geo: Optional[str] = None,
    detail: Optional[str] = None,
    change_diff: Optional[list] = None,
) -> AuditEntry:
    """
    Write an audit entry into the hash-chained log.
    
    This MUST be called within the same transaction as the action it logs.
    If the transaction rolls back, the audit entry rolls back too.
    """
    # Get the last entry to compute prev_hash
    last = db.execute(
        select(AuditEntry).order_by(AuditEntry.sequence.desc()).limit(1)
    ).scalar_one_or_none()
    
    prev_hash = last.entry_hash if last else "begin"
    occurred = datetime.now(timezone.utc)
    
    # Construct the canonical payload for hashing
    payload = {
        "occurred_at": occurred.isoformat(),
        "action": action.value,
        "actor_type": actor_type.value,
        "actor_id": actor_id,
        "service": service,
        "detail": detail,
        "change_diff": change_diff,
    }
    
    entry_hash = _hash(payload, prev_hash)
    
    # Create the audit entry
    entry = AuditEntry(
        occurred_at=occurred,
        action=action,
        actor_type=actor_type,
        actor_id=actor_id,
        actor_role=actor_role,
        service=service,
        polling_station_id=station_id,
        ip_address=ip,
        geo=geo,
        detail=detail,
        change_diff=change_diff,
        prev_hash=prev_hash,
        entry_hash=entry_hash,
    )
    
    db.add(entry)
    return entry


def verify_chain(db: Session) -> dict:
    """
    Verify the integrity of the audit chain.
    
    Returns: {
        "entries_walked": int,
        "breaks_found": int,
        "first_break_sequence": int | null,
        "verified_at": datetime,
    }
    """
    entries = db.execute(
        select(AuditEntry).order_by(AuditEntry.sequence.asc())
    ).scalars().all()
    
    start_time = datetime.now(timezone.utc)
    breaks_found = 0
    first_break = None
    
    prev_hash = "begin"
    
    for entry in entries:
        # Reconstruct the payload
        payload = {
            "occurred_at": entry.occurred_at.isoformat(),
            "action": entry.action.value,
            "actor_type": entry.actor_type.value,
            "actor_id": entry.actor_id,
            "service": entry.service,
            "detail": entry.detail,
            "change_diff": entry.change_diff,
        }
        
        computed_hash = _hash(payload, prev_hash)
        
        if computed_hash != entry.entry_hash:
            breaks_found += 1
            if first_break is None:
                first_break = entry.sequence
        
        prev_hash = entry.entry_hash
    
    return {
        "entries_walked": len(entries),
        "breaks_found": breaks_found,
        "first_break_sequence": first_break,
        "verified_at": start_time.isoformat(),
    }
