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


@router.get(
    "/turnout",
    summary="Real-time voter turnout statistics",
    description=(
        "Returns the current election-day turnout figures:  \n\n"
        "- `total_registered` — number of voters in the registry.\n"
        "- `total_verified` — voters who have been biometrically verified at least once today.\n"
        "- `total_voted` — voters whose status is `voted`.\n"
        "- `turnout_rate` — percentage of registered voters who have voted.\n"
        "- `by_station` — per-polling-station breakdown (registered, voted, turnout %).\n\n"
        "All figures are computed in real time from the database."
    ),
    response_description="Aggregate turnout metrics and per-station breakdown.",
    responses={
        401: {"description": "Not authenticated."},
    },
)
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


@router.get(
    "/demographics",
    summary="Voter demographic breakdown",
    description=(
        "Returns demographic distribution of the voter registry:  \n\n"
        "- `by_sex` — count of `male` and `female` voters.\n"
        "- `by_district` — per-district registered voter count.\n\n"
        "These figures reflect the registry at query time (not election-day snapshots)."
    ),
    response_description="Demographic breakdown by sex and district.",
    responses={
        401: {"description": "Not authenticated."},
    },
)
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


@router.get(
    "/live",
    summary="Live election-day dashboard",
    description=(
        "Combined real-time dashboard aggregating turnout, verification performance, "
        "and active anomaly count in a single response.  Intended for the supervisor "
        "dashboard displayed on election day.  All figures are computed live."
    ),
    response_description="Turnout stats, verification stats, and active anomaly count.",
    responses={
        401: {"description": "Not authenticated."},
    },
)
async def get_live_dashboard(db: Session = Depends(get_db),
                              current_user: AdminUser = Depends(get_current_user)):
    from app.modules.analytics.service import get_live_dashboard as _live
    return _live(db)


@router.get(
    "/verification",
    summary="Verification attempt statistics",
    description=(
        "Returns aggregate statistics across all verification attempts:  \n\n"
        "- `total_attempts` — total number of verification calls made.\n"
        "- `approved` / `manual_review` / `rejected` — counts by decision outcome.\n"
        "- `average_confidence` — mean confidence score across all attempts (0.0 – 1.0).\n"
        "- `approval_rate` — percentage of attempts that resulted in `approved`.\n\n"
        "Note: these counts include all attempts since system start, not just today."
    ),
    response_description="Verification performance metrics.",
    responses={
        401: {"description": "Not authenticated."},
    },
)
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
