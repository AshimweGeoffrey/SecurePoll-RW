"""Analytics module - turnout, demographics, verification stats."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.core.deps import get_current_user
from app.db.models.people import AdminUser
from app.modules.analytics.service import (
    get_turnout_stats, get_demographics as _demographics,
    get_verification_stats, get_enrollment_stats,
    get_fraud_stats, get_live_dashboard as _live,
)

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
    return get_turnout_stats(db)


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
    return _demographics(db)


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
async def get_verification_stats_endpoint(db: Session = Depends(get_db),
                                           current_user: AdminUser = Depends(get_current_user)):
    return get_verification_stats(db)


@router.get(
    "/enrollment",
    summary="Biometric enrollment statistics",
    description=(
        "Returns enrollment coverage across the voter registry:  \n\n"
        "- `total_voters` — total voters registered.\n"
        "- `enrolled` — voters with at least one biometric template.\n"
        "- `not_enrolled` — voters pending biometric registration.\n"
        "- `enrollment_rate` — percentage enrolled.\n"
        "- `by_district` — per-district enrolled count and rate."
    ),
    response_description="Enrollment coverage statistics.",
    responses={401: {"description": "Not authenticated."}},
)
async def get_enrollment(db: Session = Depends(get_db),
                          current_user: AdminUser = Depends(get_current_user)):
    return get_enrollment_stats(db)


@router.get(
    "/fraud",
    summary="Fraud and anomaly analytics summary",
    description=(
        "Returns aggregate fraud metrics:  \n\n"
        "- `total_cases` — all fraud cases ever raised.\n"
        "- `open_cases` / `resolved_cases` — case status breakdown.\n"
        "- `by_type` — count per `FraudType`.\n"
        "- `by_risk_level` — count per `RiskLevel`.\n"
        "- `total_duplicates` — duplicate biometric matches.\n"
        "- `active_anomalies` — live anomaly signals."
    ),
    response_description="Fraud and anomaly aggregate metrics.",
    responses={401: {"description": "Not authenticated."}},
)
async def get_fraud_analytics(db: Session = Depends(get_db),
                               current_user: AdminUser = Depends(get_current_user)):
    return get_fraud_stats(db)
