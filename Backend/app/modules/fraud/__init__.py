"""Fraud and duplicate detection module."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from datetime import datetime, timezone
import uuid
from app.core.db import get_db
from app.core.audit import write_audit
from app.core.config import settings
from app.core.enums import (
    AuditAction, ActorType, FraudType, RiskLevel, DuplicateStatus
)
from app.db.models.fraud import FraudCase, DuplicateMatch
from app.db.models.voter import Voter
from app.db.models.biometric import BiometricTemplate
from app.schemas import FraudCaseResponse, DuplicateMatchResponse, MergeRequest
import ml.inference as inference
import numpy as np

router = APIRouter(prefix="/fraud", tags=["fraud"])


@router.get("/cases")
async def list_fraud_cases(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    """List fraud cases."""
    cases = db.execute(
        select(FraudCase).offset(skip).limit(limit)
    ).scalars().all()
    
    return {
        "total": db.execute(select(FraudCase.__table__.columns[0]).select_from(FraudCase)).rowcount,
        "items": [FraudCaseResponse.from_orm(c) for c in cases],
    }


@router.get("/cases/{case_id}", response_model=FraudCaseResponse)
async def get_fraud_case(case_id: str, db: Session = Depends(get_db)):
    """Get a fraud case."""
    case = db.execute(
        select(FraudCase).where(FraudCase.id == case_id)
    ).scalar_one_or_none()
    
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    return FraudCaseResponse.from_orm(case)


@router.post("/cases/{case_id}:dismiss")
async def dismiss_case(case_id: str, user_id: str, db: Session = Depends(get_db)):
    """Dismiss a fraud case."""
    case = db.execute(
        select(FraudCase).where(FraudCase.id == case_id)
    ).scalar_one_or_none()
    
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    case.resolution = "dismissed"
    case.resolved_at = datetime.now(timezone.utc)
    
    write_audit(
        db,
        action=AuditAction.PERMISSION_CHANGED,
        actor_type=ActorType.user,
        actor_id=user_id,
        service="Fraud",
        detail=f"Case dismissed: {case_id}",
    )
    
    db.commit()
    return {"status": "dismissed"}


@router.post("/cases/{case_id}:escalate")
async def escalate_case(case_id: str, user_id: str, db: Session = Depends(get_db)):
    """Escalate a fraud case."""
    case = db.execute(
        select(FraudCase).where(FraudCase.id == case_id)
    ).scalar_one_or_none()
    
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    case.resolution = "escalated"
    case.resolved_at = datetime.now(timezone.utc)
    
    write_audit(
        db,
        action=AuditAction.PERMISSION_CHANGED,
        actor_type=ActorType.user,
        actor_id=user_id,
        service="Fraud",
        detail=f"Case escalated: {case_id}",
    )
    
    db.commit()
    return {"status": "escalated"}


@router.post("/duplicates/{match_id}:merge")
async def merge_duplicates(
    match_id: uuid.UUID,
    req: MergeRequest,
    user_id: str,
    db: Session = Depends(get_db),
):
    """Merge duplicate voter records."""
    match = db.execute(
        select(DuplicateMatch).where(DuplicateMatch.id == match_id)
    ).scalar_one_or_none()
    
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    # Mark the loser as archived
    loser_id = match.record_b_id if match.record_a_id == req.survivor_id else match.record_a_id
    loser = db.execute(select(Voter).where(Voter.id == loser_id)).scalar_one_or_none()
    if loser:
        loser.status = "archived"
    
    match.merged_into_id = req.survivor_id
    match.status = DuplicateStatus.merged
    match.resolved_by_user_id = user_id
    match.resolved_at = datetime.now(timezone.utc)
    
    # Create fraud case for record
    case_id = f"FR-{int(datetime.now(timezone.utc).timestamp())}"
    case = FraudCase(
        id=case_id,
        type=FraudType.duplicate,
        title=f"Merged duplicate records",
        risk_level=RiskLevel.review,
        voter_id=req.survivor_id,
        detected_by="Manual merge",
        resolution="merged",
        resolved_at=datetime.now(timezone.utc),
    )
    
    write_audit(
        db,
        action=AuditAction.RECORD_MERGED,
        actor_type=ActorType.user,
        actor_id=user_id,
        service="Fraud",
        detail=f"Merged records: {match.record_a_id} -> {req.survivor_id}",
    )
    
    db.add(case)
    db.commit()
    
    return {"status": "merged", "survivor_id": req.survivor_id}


@router.get("/summary")
async def fraud_summary(db: Session = Depends(get_db)):
    """Get fraud summary (heatmap data)."""
    # Stub
    return {
        "total_cases": 0,
        "by_type": {},
        "by_station": {},
    }


def run_dedup_scan(db: Session):
    """
    Run 1:N dedup scan after enrollment.
    
    For each enrolled voter:
    1. Search FAISS for neighbors
    2. Any above threshold -> create DuplicateMatch + FraudCase
    """
    templates = db.execute(select(BiometricTemplate)).scalars().all()
    
    for template in templates:
        if template.faiss_id is None:
            continue
        
        # Reconstruct embedding from encrypted blob (WARNING: inefficient, for demo only)
        # In production, keep embeddings in memory or cache
        
        # FAISS search
        try:
            # This is a stub; we need access to the original embedding
            # For now, skip actual dedup logic
            pass
        except Exception as e:
            print(f"Dedup error: {e}")
