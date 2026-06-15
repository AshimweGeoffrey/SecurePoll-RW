"""Fraud case business logic."""
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from typing import Optional
from datetime import datetime, timezone
from app.db.models.fraud import FraudCase, DuplicateMatch, AnomalySignal
from app.db.models.voter import Voter
from app.core.enums import (
    CaseResolution, FraudType, RiskLevel, DuplicateStatus, AuditAction, ActorType, VoterStatus
)
from app.core.audit import write_audit
import uuid


def list_fraud_cases(db: Session, skip: int = 0, limit: int = 50) -> tuple:
    """Paginated list of fraud cases. Returns (items, total)."""
    total = db.execute(select(func.count(FraudCase.id))).scalar() or 0
    items = db.execute(select(FraudCase).offset(skip).limit(limit)).scalars().all()
    return list(items), total


def get_fraud_case(db: Session, case_id: str) -> Optional[FraudCase]:
    """Return a single FraudCase by string ID, or None."""
    return db.execute(
        select(FraudCase).where(FraudCase.id == case_id)
    ).scalar_one_or_none()


def resolve_case(db: Session, case: FraudCase, resolution: CaseResolution,
                 resolved_by_id: str) -> FraudCase:
    """Set resolution + resolved_at + write audit."""
    case.resolution = resolution
    case.resolved_at = datetime.now(timezone.utc)
    write_audit(
        db,
        action=AuditAction.PERMISSION_CHANGED,
        actor_type=ActorType.user,
        actor_id=resolved_by_id,
        service="Fraud",
        detail=f"Case {case.id} resolved: {resolution.value}",
    )
    db.commit()
    db.refresh(case)
    return case


def fraud_summary(db: Session) -> dict:
    """Return total_cases and by_type breakdown."""
    total = db.execute(select(func.count(FraudCase.id))).scalar() or 0
    by_type = {}
    for ft in FraudType:
        count = db.execute(
            select(func.count(FraudCase.id)).where(FraudCase.type == ft)
        ).scalar() or 0
        by_type[ft.value] = count
    return {"total_cases": total, "by_type": by_type}


def list_duplicates(db: Session, skip: int = 0, limit: int = 50, status: str = "") -> tuple:
    """Paginated list of duplicate matches. Returns (items, total)."""
    query = select(DuplicateMatch)
    if status:
        query = query.where(DuplicateMatch.status == status)
    total = db.execute(select(func.count(DuplicateMatch.id))).scalar() or 0
    items = db.execute(query.offset(skip).limit(limit)).scalars().all()
    return list(items), total


def get_duplicate(db: Session, match_id: uuid.UUID) -> Optional[DuplicateMatch]:
    """Return a single DuplicateMatch by UUID, or None."""
    return db.execute(
        select(DuplicateMatch).where(DuplicateMatch.id == match_id)
    ).scalar_one_or_none()


def merge_duplicates(db: Session, match: DuplicateMatch, survivor_id: uuid.UUID,
                     resolved_by_id: str) -> dict:
    """Archive loser voter, mark match merged, write audit. Return result dict."""
    loser_id = match.record_b_id if match.record_a_id == survivor_id else match.record_a_id

    loser = db.execute(select(Voter).where(Voter.id == loser_id)).scalar_one_or_none()
    if loser:
        loser.status = VoterStatus.archived

    match.merged_into_id = survivor_id
    match.status = DuplicateStatus.merged
    match.resolved_by_user_id = uuid.UUID(resolved_by_id) if isinstance(resolved_by_id, str) else resolved_by_id
    match.resolved_at = datetime.now(timezone.utc)

    write_audit(
        db,
        action=AuditAction.RECORD_MERGED,
        actor_type=ActorType.user,
        actor_id=resolved_by_id,
        service="Fraud",
        detail=f"Merged {loser_id} -> {survivor_id}",
    )
    db.commit()
    return {
        "status": "merged",
        "survivor_id": str(survivor_id),
        "archived_id": str(loser_id),
    }


def list_anomalies(db: Session, skip: int = 0, limit: int = 50) -> tuple:
    """Paginated list of anomaly signals. Returns (items, total)."""
    total = db.execute(select(func.count(AnomalySignal.id))).scalar() or 0
    items = db.execute(select(AnomalySignal).offset(skip).limit(limit)).scalars().all()
    return list(items), total


def get_anomaly(db: Session, anomaly_id: str) -> Optional[AnomalySignal]:
    """Return a single AnomalySignal by string ID, or None."""
    return db.execute(
        select(AnomalySignal).where(AnomalySignal.id == anomaly_id)
    ).scalar_one_or_none()


def set_anomaly_status(db: Session, anomaly: AnomalySignal, status: str) -> AnomalySignal:
    """Set status (acknowledged/muted). If muted, set is_live=False."""
    anomaly.status = status
    if status == "muted":
        anomaly.is_live = False
    db.commit()
    db.refresh(anomaly)
    return anomaly


def create_fraud_case(
    db: Session,
    case_id: str,
    fraud_type: FraudType,
    title: str,
    risk_level: RiskLevel,
    actor_id: str,
    **kwargs,
) -> FraudCase:
    """Manually create a fraud case with audit entry."""
    from app.core.enums import AuditAction as AA
    case = FraudCase(
        id=case_id,
        type=fraud_type,
        title=title,
        risk_level=risk_level,
        opened_at=datetime.now(timezone.utc),
        **kwargs,
    )
    db.add(case)
    write_audit(
        db,
        action=AA.CASE_CREATED,
        actor_type=ActorType.user,
        actor_id=actor_id,
        service="Fraud",
        detail=f"Manual case created: {case_id} — {title}",
    )
    db.commit()
    db.refresh(case)
    return case


def create_anomaly(
    db: Session,
    anomaly_id: str,
    severity,
    title: str,
    actor_id: str,
    **kwargs,
) -> AnomalySignal:
    """Manually create an anomaly signal with audit entry."""
    from app.core.enums import AuditAction as AA
    anomaly = AnomalySignal(
        id=anomaly_id,
        severity=severity,
        title=title,
        detected_at=datetime.now(timezone.utc),
        **kwargs,
    )
    db.add(anomaly)
    write_audit(
        db,
        action=AA.ANOMALY_CREATED,
        actor_type=ActorType.user,
        actor_id=actor_id,
        service="Fraud",
        detail=f"Manual anomaly created: {anomaly_id} — {title}",
    )
    db.commit()
    db.refresh(anomaly)
    return anomaly


def delete_anomaly(db: Session, anomaly: AnomalySignal, actor_id: str) -> None:
    """Hard-delete an anomaly signal with audit."""
    from app.core.enums import AuditAction as AA
    write_audit(
        db,
        action=AA.ANOMALY_RESOLVED,
        actor_type=ActorType.user,
        actor_id=actor_id,
        service="Fraud",
        detail=f"Anomaly deleted: {anomaly.id}",
    )
    db.delete(anomaly)
    db.commit()
