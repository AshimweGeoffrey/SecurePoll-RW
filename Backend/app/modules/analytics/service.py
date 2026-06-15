"""Analytics service — all breakdowns use single aggregated SQL queries (no N+1)."""
from sqlalchemy.orm import Session
from sqlalchemy import select, func, case
from app.db.models.voter import Voter
from app.db.models.verification import VerificationAttempt
from app.db.models.geography import District, PollingStation
from app.db.models.fraud import AnomalySignal, FraudCase, DuplicateMatch
from app.db.models.biometric import BiometricTemplate
from app.core.enums import VoterStatus, VerifyResult, Sex, FraudType, RiskLevel, CaseResolution


def get_turnout_stats(db: Session) -> dict:
    """Return turnout figures using a single aggregated query per breakdown."""
    total_registered = db.execute(select(func.count(Voter.id))).scalar() or 0
    total_voted = db.execute(
        select(func.count(Voter.id)).where(Voter.status == VoterStatus.voted)
    ).scalar() or 0
    total_verified = db.execute(
        select(func.count(Voter.id)).where(Voter.last_verified_at.is_not(None))
    ).scalar() or 0

    rows = db.execute(
        select(
            PollingStation.id,
            PollingStation.name,
            func.count(Voter.id).label("registered"),
            func.sum(
                case((Voter.status == VoterStatus.voted, 1), else_=0)
            ).label("voted"),
        )
        .outerjoin(Voter, Voter.polling_station_id == PollingStation.id)
        .group_by(PollingStation.id, PollingStation.name)
    ).all()

    by_station = []
    for row in rows:
        reg = row.registered or 0
        voted = int(row.voted or 0)
        by_station.append({
            "station_id": str(row.id),
            "station_name": row.name,
            "registered": reg,
            "voted": voted,
            "turnout_pct": round(voted / reg * 100, 1) if reg else 0,
        })

    return {
        "total_registered": total_registered,
        "total_verified": total_verified,
        "total_voted": total_voted,
        "turnout_rate": round(total_voted / total_registered * 100, 2) if total_registered else 0,
        "by_station": by_station,
    }


def get_demographics(db: Session) -> dict:
    """Return demographic breakdown using aggregated GROUP BY queries."""
    male = db.execute(
        select(func.count(Voter.id)).where(Voter.sex == Sex.male)
    ).scalar() or 0
    female = db.execute(
        select(func.count(Voter.id)).where(Voter.sex == Sex.female)
    ).scalar() or 0

    rows = db.execute(
        select(
            District.name,
            func.count(Voter.id).label("registered"),
        )
        .outerjoin(Voter, Voter.district_id == District.id)
        .group_by(District.id, District.name)
        .order_by(District.name)
    ).all()

    by_district = [{"district": r.name, "registered": r.registered or 0} for r in rows]

    return {
        "by_sex": {"male": male, "female": female},
        "by_district": by_district,
    }


def get_verification_stats(db: Session) -> dict:
    """Return verification stats using a single GROUP BY + AVG query."""
    rows = db.execute(
        select(
            VerificationAttempt.result,
            func.count(VerificationAttempt.id).label("cnt"),
        ).group_by(VerificationAttempt.result)
    ).all()

    counts = {str(r.result.value if hasattr(r.result, "value") else r.result): r.cnt for r in rows}
    total = sum(counts.values())
    approved = counts.get("approved", 0)
    manual_review = counts.get("manual_review", 0)
    rejected = counts.get("rejected", 0)

    avg_conf = db.execute(select(func.avg(VerificationAttempt.confidence))).scalar()

    return {
        "total_attempts": total,
        "approved": approved,
        "manual_review": manual_review,
        "rejected": rejected,
        "average_confidence": round(float(avg_conf), 4) if avg_conf else 0.0,
        "approval_rate": round(approved / total * 100, 2) if total else 0,
    }


def get_live_dashboard(db: Session) -> dict:
    """Combined dashboard: turnout + verification stats + active anomaly count."""
    turnout = get_turnout_stats(db)
    verification = get_verification_stats(db)
    active_anomalies = db.execute(
        select(func.count(AnomalySignal.id)).where(
            AnomalySignal.is_live == True  # noqa: E712
        )
    ).scalar() or 0

    return {
        "turnout": turnout,
        "verification": verification,
        "active_anomalies": active_anomalies,
    }


def get_enrollment_stats(db: Session) -> dict:
    """Return biometric enrollment rates using aggregated GROUP BY queries."""
    total_voters = db.execute(select(func.count(Voter.id))).scalar() or 0
    enrolled = db.execute(select(func.count(BiometricTemplate.id))).scalar() or 0
    not_enrolled = max(0, total_voters - enrolled)
    enrollment_rate = round(enrolled / total_voters * 100, 2) if total_voters else 0.0

    rows = db.execute(
        select(
            District.name,
            func.count(Voter.id).label("registered"),
            func.count(BiometricTemplate.id).label("enrolled"),
        )
        .outerjoin(Voter, Voter.district_id == District.id)
        .outerjoin(BiometricTemplate, BiometricTemplate.voter_id == Voter.id)
        .group_by(District.id, District.name)
        .order_by(District.name)
    ).all()

    by_district = [
        {
            "district": r.name,
            "registered": r.registered or 0,
            "enrolled": r.enrolled or 0,
            "rate": round((r.enrolled or 0) / r.registered * 100, 1) if r.registered else 0,
        }
        for r in rows
    ]

    return {
        "total_voters": total_voters,
        "enrolled": enrolled,
        "not_enrolled": not_enrolled,
        "enrollment_rate": enrollment_rate,
        "by_district": by_district,
    }


def get_fraud_stats(db: Session) -> dict:
    """Return fraud case counts, risk level breakdown, open vs resolved, and active anomalies."""
    total_cases = db.execute(select(func.count(FraudCase.id))).scalar() or 0

    by_type = {}
    for ft in FraudType:
        cnt = db.execute(
            select(func.count(FraudCase.id)).where(FraudCase.type == ft)
        ).scalar() or 0
        by_type[ft.value] = cnt

    by_risk = {}
    for rl in RiskLevel:
        cnt = db.execute(
            select(func.count(FraudCase.id)).where(FraudCase.risk_level == rl)
        ).scalar() or 0
        by_risk[rl.value] = cnt

    open_cases = db.execute(
        select(func.count(FraudCase.id)).where(FraudCase.resolution.is_(None))
    ).scalar() or 0
    resolved_cases = total_cases - open_cases

    total_duplicates = db.execute(select(func.count(DuplicateMatch.id))).scalar() or 0
    active_anomalies = db.execute(
        select(func.count(AnomalySignal.id)).where(AnomalySignal.is_live == True)  # noqa: E712
    ).scalar() or 0

    return {
        "total_cases": total_cases,
        "open_cases": open_cases,
        "resolved_cases": resolved_cases,
        "by_type": by_type,
        "by_risk_level": by_risk,
        "total_duplicates": total_duplicates,
        "active_anomalies": active_anomalies,
    }
