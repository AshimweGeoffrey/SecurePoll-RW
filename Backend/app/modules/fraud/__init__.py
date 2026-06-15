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
from app.schemas import FraudCaseResponse, DuplicateMatchResponse, MergeRequest, FraudCaseCreate, AnomalyCreate

router = APIRouter(tags=["fraud"])


# ---------------------------------------------------------------------------
# Fraud cases
# ---------------------------------------------------------------------------

@router.get(
    "/fraud/cases",
    summary="List fraud cases with pagination",
    description=(
        "Returns a paginated list of all fraud cases in the system.  \n\n"
        "Fraud cases are auto-created by the 1:N biometric deduplication pipeline at enrolment time, "
        "or can be raised manually by supervisors.  "
        "Use `skip` and `limit` for pagination."
    ),
    response_description="Paginated fraud case list with total count.",
    responses={
        401: {"description": "Not authenticated."},
    },
)
async def list_fraud_cases(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    total = db.execute(select(func.count(FraudCase.id))).scalar()
    cases = db.execute(select(FraudCase).offset(skip).limit(limit)).scalars().all()
    return {"total": total, "items": [FraudCaseResponse.model_validate(c) for c in cases]}


@router.get(
    "/fraud/cases/{case_id}",
    response_model=FraudCaseResponse,
    summary="Get a single fraud case by ID",
    description=(
        "Retrieve the full details of a single fraud case by its string ID (e.g. `FR-A1B2C3`).  "
        "Returns **404** if the case does not exist."
    ),
    response_description="Full fraud case object.",
    responses={
        401: {"description": "Not authenticated."},
        404: {"description": "Case not found."},
    },
)
async def get_fraud_case(case_id: str, db: Session = Depends(get_db),
                          current_user: AdminUser = Depends(get_current_user)):
    case = db.execute(select(FraudCase).where(FraudCase.id == case_id)).scalar_one_or_none()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return case


@router.post(
    "/fraud/cases/{case_id}:dismiss",
    summary="Dismiss a fraud case",
    description=(
        "Mark a fraud case as `dismissed` — indicating an investigator has reviewed it and "
        "determined it is not a genuine fraud.  "
        "Sets `resolution = dismissed` and records `resolved_at`.  "
        "An audit entry is written."
    ),
    response_description="Confirmation that the case was dismissed.",
    responses={
        401: {"description": "Not authenticated."},
        404: {"description": "Case not found."},
    },
)
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


@router.post(
    "/fraud/cases/{case_id}:escalate",
    summary="Escalate a fraud case",
    description=(
        "Mark a fraud case as `escalated` — forwarding it to a higher authority for further action.  "
        "Sets `resolution = escalated` and records `resolved_at`.  "
        "An audit entry is written."
    ),
    response_description="Confirmation that the case was escalated.",
    responses={
        401: {"description": "Not authenticated."},
        404: {"description": "Case not found."},
    },
)
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


@router.get(
    "/fraud/summary",
    summary="Fraud case count summary by type",
    description=(
        "Returns the total number of fraud cases and a breakdown by `FraudType`.  "
        "Useful as a top-level dashboard metric."
    ),
    response_description="Total case count and per-type breakdown.",
    responses={
        401: {"description": "Not authenticated."},
    },
)
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

@router.get(
    "/duplicates",
    summary="List duplicate biometric matches with pagination",
    description=(
        "Returns a paginated list of `DuplicateMatch` records produced by the 1:N FAISS "
        "deduplication scan run at enrolment time.  \n\n"
        "Filter by `status` to see only pending, merged, or dismissed matches.  "
        "Each match links two voter IDs with a cosine similarity score."
    ),
    response_description="Paginated duplicate match list with total count.",
    responses={
        401: {"description": "Not authenticated."},
    },
)
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


@router.get(
    "/duplicates/{match_id}",
    response_model=DuplicateMatchResponse,
    summary="Get a single duplicate match by ID",
    description=(
        "Retrieve the full record of a single `DuplicateMatch` by its UUID.  "
        "Returns the two voter IDs, similarity score, status, and resolution metadata."
    ),
    response_description="Full duplicate match record.",
    responses={
        401: {"description": "Not authenticated."},
        404: {"description": "Duplicate match not found."},
    },
)
async def get_duplicate_match(
    match_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    match = db.execute(
        select(DuplicateMatch).where(DuplicateMatch.id == match_id)
    ).scalar_one_or_none()
    if not match:
        raise HTTPException(status_code=404, detail="Duplicate match not found")
    return match


@router.post(
    "/duplicates/{match_id}:merge",
    summary="Merge duplicate voter records",
    description=(
        "Resolve a duplicate match by designating one voter record as the **survivor** and "
        "archiving the other (the loser).  \n\n"
        "**Steps:**\n"
        "1. Identify loser: the voter in the match that is **not** `survivor_id`.\n"
        "2. Set loser's status to `archived`.\n"
        "3. Mark the `DuplicateMatch` as `merged` and record resolution metadata.\n"
        "4. Write an audit entry.\n\n"
        "The `survivor_id` must be one of the two voter IDs in the match."
    ),
    response_description="Merge confirmation with survivor and archived voter IDs.",
    responses={
        401: {"description": "Not authenticated."},
        404: {"description": "Duplicate match not found."},
    },
)
async def merge_duplicates(
    match_id: uuid.UUID,
    req: MergeRequest,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
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

@router.get(
    "/anomalies",
    summary="List anomaly signals with pagination",
    description=(
        "Returns a paginated list of real-time anomaly signals detected by monitoring rules.  \n\n"
        "Signals include statistical deviations such as unexpected turnout spikes, "
        "rejection-rate anomalies, or unusually high duplicate rates.  "
        "Filter by `status` (e.g. `active`, `acknowledged`, `muted`)."
    ),
    response_description="Paginated anomaly signal list with total count.",
    responses={
        401: {"description": "Not authenticated."},
    },
)
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


@router.get(
    "/anomalies/{anomaly_id}",
    summary="Get a single anomaly signal by ID",
    description=(
        "Retrieve the full record of a single anomaly signal by its string ID.  "
        "Returns the same field set as the list endpoint but for one specific signal."
    ),
    response_description="Full anomaly signal record.",
    responses={
        401: {"description": "Not authenticated."},
        404: {"description": "Anomaly not found."},
    },
)
async def get_anomaly(
    anomaly_id: str,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    anomaly = db.execute(
        select(AnomalySignal).where(AnomalySignal.id == anomaly_id)
    ).scalar_one_or_none()
    if not anomaly:
        raise HTTPException(status_code=404, detail="Anomaly not found")
    return {
        "id": anomaly.id,
        "severity": anomaly.severity.value,
        "title": anomaly.title,
        "description": anomaly.description,
        "is_live": anomaly.is_live,
        "signal_name": anomaly.signal_name,
        "baseline": anomaly.baseline,
        "observed": anomaly.observed,
        "unit": anomaly.unit,
        "affected_entities": anomaly.affected_entities,
        "recommendation": anomaly.recommendation,
        "status": anomaly.status,
        "detected_at": anomaly.detected_at,
    }


@router.post(
    "/anomalies/{anomaly_id}:acknowledge",
    summary="Acknowledge an anomaly signal",
    description=(
        "Mark an anomaly signal as `acknowledged` — indicating that an operator has seen it "
        "and is investigating.  "
        "The signal remains visible (`is_live` unchanged) until explicitly muted or resolved."
    ),
    response_description="Confirmation that the anomaly was acknowledged.",
    responses={
        401: {"description": "Not authenticated."},
        404: {"description": "Anomaly not found."},
    },
)
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


@router.post(
    "/anomalies/{anomaly_id}:mute",
    summary="Mute an anomaly signal",
    description=(
        "Silence an anomaly signal by setting its status to `muted` and `is_live = false`.  "
        "Muted signals are hidden from live dashboards but remain in the database for audit purposes."
    ),
    response_description="Confirmation that the anomaly was muted.",
    responses={
        401: {"description": "Not authenticated."},
        404: {"description": "Anomaly not found."},
    },
)
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


@router.post(
    "/fraud/cases",
    response_model=FraudCaseResponse,
    status_code=201,
    summary="Manually create a fraud case",
    description=(
        "Raise a fraud case manually (as opposed to auto-creation by the deduplication pipeline).  \n\n"
        "A unique case ID is generated in the format `FR-XXXXXX` using a random hex suffix.  "
        "An audit entry is written with action `CASE_CREATED`."
    ),
    response_description="Newly created fraud case.",
    responses={
        401: {"description": "Not authenticated."},
        422: {"description": "Validation error."},
    },
)
async def create_fraud_case_endpoint(
    req: FraudCaseCreate,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    from app.modules.fraud.service import create_fraud_case
    import secrets
    case_id = f"FR-{secrets.token_hex(3).upper()}"
    case = create_fraud_case(
        db,
        case_id=case_id,
        fraud_type=req.type,
        title=req.title,
        risk_level=req.risk_level,
        actor_id=str(current_user.id),
        voter_id=req.voter_id,
        registration_ref=req.registration_ref,
        polling_station_id=req.polling_station_id,
        detected_by=req.detected_by,
        face_score=req.face_score,
        description=req.description,
    )
    db.commit()
    db.refresh(case)
    return case


@router.post(
    "/anomalies",
    status_code=201,
    summary="Manually create an anomaly signal",
    description=(
        "Create an anomaly signal manually (e.g. from an external monitoring rule or script).  \n\n"
        "A unique anomaly ID is generated in the format `ANO-XXXXXX`.  "
        "An audit entry is written with action `ANOMALY_CREATED`."
    ),
    response_description="Newly created anomaly signal.",
    responses={
        401: {"description": "Not authenticated."},
        422: {"description": "Validation error."},
    },
)
async def create_anomaly_endpoint(
    req: AnomalyCreate,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    from app.modules.fraud.service import create_anomaly
    import secrets
    anomaly_id = f"ANO-{secrets.token_hex(3).upper()}"
    anomaly = create_anomaly(
        db,
        anomaly_id=anomaly_id,
        severity=req.severity,
        title=req.title,
        actor_id=str(current_user.id),
        description=req.description,
        signal_name=req.signal_name,
        baseline=req.baseline,
        observed=req.observed,
        unit=req.unit,
        affected_entities=req.affected_entities,
        recommendation=req.recommendation,
    )
    db.commit()
    db.refresh(anomaly)
    return {
        "id": anomaly.id,
        "severity": anomaly.severity.value,
        "title": anomaly.title,
        "description": anomaly.description,
        "is_live": anomaly.is_live,
        "signal_name": anomaly.signal_name,
        "baseline": anomaly.baseline,
        "observed": anomaly.observed,
        "unit": anomaly.unit,
        "affected_entities": anomaly.affected_entities,
        "recommendation": anomaly.recommendation,
        "status": anomaly.status,
        "detected_at": anomaly.detected_at,
    }


@router.delete(
    "/anomalies/{anomaly_id}",
    status_code=204,
    summary="Delete (resolve) an anomaly signal",
    description=(
        "Permanently delete an anomaly signal.  An audit entry with action `ANOMALY_RESOLVED` "
        "is written before deletion.  Returns **204 No Content** on success."
    ),
    responses={
        401: {"description": "Not authenticated."},
        404: {"description": "Anomaly not found."},
    },
)
async def delete_anomaly_endpoint(
    anomaly_id: str,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    from app.modules.fraud.service import delete_anomaly
    anomaly = db.execute(
        select(AnomalySignal).where(AnomalySignal.id == anomaly_id)
    ).scalar_one_or_none()
    if not anomaly:
        raise HTTPException(status_code=404, detail="Anomaly not found")
    delete_anomaly(db, anomaly, actor_id=str(current_user.id))
    db.commit()
