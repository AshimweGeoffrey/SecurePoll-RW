"""Analytics module."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from app.core.db import get_db
from app.db.models.voter import Voter
from app.db.models.verification import VerificationAttempt
from app.core.enums import VoterStatus, VerifyResult

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/turnout")
async def get_turnout_stats(db: Session = Depends(get_db)):
    """Get turnout statistics."""
    total_registered = db.execute(select(func.count(Voter.id))).scalar()
    total_voted = db.execute(
        select(func.count(Voter.id)).where(Voter.status == VoterStatus.voted)
    ).scalar()
    total_verified = db.execute(
        select(func.count(Voter.id)).where(Voter.last_verified_at.is_not(None))
    ).scalar()
    
    return {
        "total_registered": total_registered,
        "total_verified": total_verified,
        "total_voted": total_voted,
        "turnout_rate": (total_voted / total_registered * 100) if total_registered else 0,
    }


@router.get("/verification")
async def get_verification_stats(db: Session = Depends(get_db)):
    """Get verification statistics."""
    total_attempts = db.execute(select(func.count(VerificationAttempt.id))).scalar()
    approved = db.execute(
        select(func.count(VerificationAttempt.id)).where(
            VerificationAttempt.result == VerifyResult.approved
        )
    ).scalar()
    manual_review = db.execute(
        select(func.count(VerificationAttempt.id)).where(
            VerificationAttempt.result == VerifyResult.manual_review
        )
    ).scalar()
    rejected = db.execute(
        select(func.count(VerificationAttempt.id)).where(
            VerificationAttempt.result == VerifyResult.rejected
        )
    ).scalar()
    
    avg_confidence = db.execute(
        select(func.avg(VerificationAttempt.confidence))
    ).scalar()
    
    return {
        "total_attempts": total_attempts,
        "approved": approved,
        "manual_review": manual_review,
        "rejected": rejected,
        "average_confidence": avg_confidence or 0,
    }


@router.get("/demographics")
async def get_demographics(db: Session = Depends(get_db)):
    """Get demographic statistics."""
    return {"by_sex": {}, "by_district": {}, "by_age": {}}
