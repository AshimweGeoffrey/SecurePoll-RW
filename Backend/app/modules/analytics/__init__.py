"""Analytics module - turnout, demographics, verification stats."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from app.core.db import get_db
from app.core.deps import get_current_user
from app.db.models.voter import Voter
from app.db.models.verification import VerificationAttempt
from app.db.models.geography import District, PollingStation
from app.db.models.people import AdminUser
from app.core.enums import VoterStatus, VerifyResult, Sex

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/turnout")
async def get_turnout(db: Session = Depends(get_db),
                       current_user: AdminUser = Depends(get_current_user)):
    total_registered = db.execute(select(func.count(Voter.id))).scalar() or 0
    total_voted = db.execute(
        select(func.count(Voter.id)).where(Voter.status == VoterStatus.voted)
    ).scalar() or 0
    total_verified = db.execute(
        select(func.count(Voter.id)).where(Voter.last_verified_at.is_not(None))
    ).scalar() or 0

    # Per-station breakdown
    stations = db.execute(select(PollingStation)).scalars().all()
    by_station = []
    for st in stations:
        voted_here = db.execute(
            select(func.count(Voter.id)).where(
                Voter.polling_station_id == st.id,
                Voter.status == VoterStatus.voted,
            )
        ).scalar() or 0
        registered_here = db.execute(
            select(func.count(Voter.id)).where(Voter.polling_station_id == st.id)
        ).scalar() or 0
        by_station.append({
            "station_id": str(st.id),
            "station_name": st.name,
            "registered": registered_here,
            "voted": voted_here,
            "turnout_pct": round(voted_here / registered_here * 100, 1) if registered_here else 0,
        })

    return {
        "total_registered": total_registered,
        "total_verified": total_verified,
        "total_voted": total_voted,
        "turnout_rate": round(total_voted / total_registered * 100, 2) if total_registered else 0,
        "by_station": by_station,
    }


@router.get("/demographics")
async def get_demographics(db: Session = Depends(get_db),
                            current_user: AdminUser = Depends(get_current_user)):
    male = db.execute(
        select(func.count(Voter.id)).where(Voter.sex == Sex.male)
    ).scalar() or 0
    female = db.execute(
        select(func.count(Voter.id)).where(Voter.sex == Sex.female)
    ).scalar() or 0

    districts = db.execute(select(District)).scalars().all()
    by_district = []
    for d in districts:
        count = db.execute(
            select(func.count(Voter.id)).where(Voter.district_id == d.id)
        ).scalar() or 0
        by_district.append({"district": d.name, "registered": count})

    return {
        "by_sex": {"male": male, "female": female},
        "by_district": by_district,
    }


@router.get("/verification")
async def get_verification_stats(db: Session = Depends(get_db),
                                   current_user: AdminUser = Depends(get_current_user)):
    total = db.execute(select(func.count(VerificationAttempt.id))).scalar() or 0
    approved = db.execute(
        select(func.count(VerificationAttempt.id)).where(
            VerificationAttempt.result == VerifyResult.approved)
    ).scalar() or 0
    manual_review = db.execute(
        select(func.count(VerificationAttempt.id)).where(
            VerificationAttempt.result == VerifyResult.manual_review)
    ).scalar() or 0
    rejected = db.execute(
        select(func.count(VerificationAttempt.id)).where(
            VerificationAttempt.result == VerifyResult.rejected)
    ).scalar() or 0
    avg_conf = db.execute(
        select(func.avg(VerificationAttempt.confidence))
    ).scalar()

    return {
        "total_attempts": total,
        "approved": approved,
        "manual_review": manual_review,
        "rejected": rejected,
        "average_confidence": round(float(avg_conf), 4) if avg_conf else 0.0,
        "approval_rate": round(approved / total * 100, 2) if total else 0,
    }
