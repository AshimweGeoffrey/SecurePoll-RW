"""Audit module - chain verification."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from app.core.db import get_db
from app.core.audit import verify_chain
from app.schemas import ChainVerificationResponse

router = APIRouter(prefix="/audit", tags=["audit"])


@router.post(":verify-chain", response_model=ChainVerificationResponse)
async def verify_audit_chain(db: Session = Depends(get_db)):
    """Verify the integrity of the audit chain."""
    result = verify_chain(db)
    
    return ChainVerificationResponse(
        entries_walked=result["entries_walked"],
        breaks_found=result["breaks_found"],
        first_break_sequence=result["first_break_sequence"],
        verified_at=result["verified_at"],
    )


@router.get("/entries")
async def list_audit_entries(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    """List audit entries."""
    # Stub
    return {"total": 0, "items": []}


@router.get("/entries/{entry_id}")
async def get_audit_entry(entry_id: str, db: Session = Depends(get_db)):
    """Get an audit entry."""
    # Stub
    return {}


@router.get(":export")
async def export_audit(format: str = "csv", db: Session = Depends(get_db)):
    """Export audit log."""
    # Stub
    return {"status": "export feature coming"}
