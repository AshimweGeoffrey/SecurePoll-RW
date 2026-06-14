"""Fraud, duplicate detection, and anomaly module."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from datetime import datetime, timezone
import uuid
from app.core.db import get_db
from app.core.audit import write_audit
from app.core.deps import get_current_user
from app.core.enums import AuditAction, ActorType, FraudType, RiskLevel, DuplicateStatus, CaseResolution
from app.db.models.fraud import FraudCase, DuplicateMatch, AnomalySignal
from app.db.models.voter import Voter
from app.db.models.people import AdminUser
from app.schemas import FraudCaseResponse, DuplicateMatchResponse, MergeRequest

router = APIRouter(tags=["fraud"])


# ---------------------------------------------------------------------------
# Fraud cases
# ---------------------------------------------------------------------------

@router.get("/fraud/cases")
async def list_fraud_cases(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    total = db.execute(select(func.count(FraudCase.id))).scalar()
    cases = db.execute(select(FraudCase).offset(skip).limit(limit)).scalars().all()
    return {"total": total, "items": [FraudCaseResponse.model_validate(c) for c in cases]}


@router.get("/fraud/cases/{case_id}", response_model=FraudCaseResponse)
async def get_fraud_case(case_id: str, db: Session = Depends(get_db),
                          current_user: AdminUser = Depends(get_current_user)):
    case = db.execute(select(FraudCase).where(FraudCase.id == case_id)).scalar_one_or_none()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return case


@router.post("/fraud/cases/{case_id}:dismiss")
async def dismiss_case(case_id: str, db: Session = Depends(get_db),
                        current_user: AdminUser = Depends(get_current_user)):
    case = db.execute(select(FraudCase).where(FraudCase.id == case_id)).scalar_one_or_none()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    case.resolution = CaseResolution.dismissed
    case.resolved_at = datetime.now(timezone.utc)
    write_audit(db, action=AuditAction.PERMISSION_CHANGED, actor_type=ActorType.user,
                actor_id=str(current_user.id), service="Fraud",
                detail=f"Case dismissed: {case_id}")
    db.commit()
    return {"status": "dismissed"}


@router.post("/fraud/cases/{case_id}:escalate")
async def escalate_case(case_id: str, db: Session = Depends(get_db),
                         current_user: AdminUser = Depends(get_current_user)):
    case = db.execute(select(FraudCase).where(FraudCase.id == case_id)).scalar_one_or_none()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    case.resolution = CaseResolution.escalated
    case.resolved_at = datetime.now(timezone.utc)
    write_audit(db, action=AuditAction.PERMISSION_CHANGED, actor_type=ActorType.user,
                actor_id=str(current_user.id), service="Fraud",
                detail=f"Case escalated: {case_id}")
    db.commit()
    return {"status": "escalated"}


@router.get("/fraud/summary")
async def fraud_summary(db: Session = Depends(get_db),
                         current_user: AdminUser = Depends(get_current_user)):
    total = db.execute(select(func.count(FraudCase.id))).scalar()
    by_type = {}
    for ft in FraudType:
        count = db.execute(
            select(func.count(FraudCase.id)).where(FraudCase.type == ft)
        ).scalar()
        by_type[ft.value] = count
    return {"total_cases": total, "by_type": by_type}


# ---------------------------------------------------------------------------
# Duplicates
# ---------------------------------------------------------------------------

@router.get("/duplicates")
async def list_duplicates(
    skip: int = 0,
    limit: int = 50,
    status: str = "",
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    query = select(DuplicateMatch)
    if status:
        query = query.where(DuplicateMatch.status == status)
    total = db.execute(select(func.count(DuplicateMatch.id))).scalar()
    items = db.execute(query.offset(skip).limit(limit)).scalars().all()
    return {
        "total": total,
        "items": [DuplicateMatchResponse.model_validate(m) for m in items],
    }


@router.post("/duplicates/{match_id}:merge")
async def merge_duplicates(
    match_id: uuid.UUID,
    req: MergeRequest,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    """Merge duplicate voter records. Archives the loser, keeps the survivor."""
    match = db.execute(
        select(DuplicateMatch).where(DuplicateMatch.id == match_id)
    ).scalar_one_or_none()
    if not match:
        raise HTTPException(status_code=404, detail="Duplicate match not found")

    survivor_id = req.survivor_id
    loser_id = match.record_b_id if match.record_a_id == survivor_id else match.record_a_id

    loser = db.execute(select(Voter).where(Voter.id == loser_id)).scalar_one_or_none()
    if loser:
        from app.core.enums import VoterStatus
        loser.status = VoterStatus.archived

    match.merged_into_id = survivor_id
    match.status = DuplicateStatus.merged
    match.resolved_by_user_id = current_user.id
    match.resolved_at = datetime.now(timezone.utc)

    write_audit(db, action=AuditAction.RECORD_MERGED, actor_type=ActorType.user,
                actor_id=str(current_user.id), service="Fraud",
                detail=f"Merged {loser_id} -> {survivor_id}")
    db.commit()
    return {"status": "merged", "survivor_id": str(survivor_id), "archived_id": str(loser_id)}


# ---------------------------------------------------------------------------
# Anomaly signals
# ---------------------------------------------------------------------------

@router.get("/anomalies")
async def list_anomalies(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    total = db.execute(select(func.count(AnomalySignal.id))).scalar()
    items = db.execute(select(AnomalySignal).offset(skip).limit(limit)).scalars().all()
    return {
        "total": total,
        "items": [
            {
                "id": a.id,
                "severity": a.severity.value,
                "title": a.title,
                "description": a.description,
                "is_live": a.is_live,
                "signal_name": a.signal_name,
                "baseline": a.baseline,
                "observed": a.observed,
                "unit": a.unit,
                "affected_entities": a.affected_entities,
                "recommendation": a.recommendation,
                "status": a.status,
                "detected_at": a.detected_at,
            }
            for a in items
        ],
    }


@router.post("/anomalies/{anomaly_id}:acknowledge")
async def acknowledge_anomaly(anomaly_id: str, db: Session = Depends(get_db),
                               current_user: AdminUser = Depends(get_current_user)):
    anomaly = db.execute(
        select(AnomalySignal).where(AnomalySignal.id == anomaly_id)
    ).scalar_one_or_none()
    if not anomaly:
        raise HTTPException(status_code=404, detail="Anomaly not found")
    anomaly.status = "acknowledged"
    db.commit()
    return {"status": "acknowledged"}


@router.post("/anomalies/{anomaly_id}:mute")
async def mute_anomaly(anomaly_id: str, db: Session = Depends(get_db),
                        current_user: AdminUser = Depends(get_current_user)):
    anomaly = db.execute(
        select(AnomalySignal).where(AnomalySignal.id == anomaly_id)
    ).scalar_one_or_none()
    if not anomaly:
        raise HTTPException(status_code=404, detail="Anomaly not found")
    anomaly.status = "muted"
    anomaly.is_live = False
    db.commit()
    return {"status": "muted"}
