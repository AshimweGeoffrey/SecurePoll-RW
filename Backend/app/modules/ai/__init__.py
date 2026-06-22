"""AI/ML module — model health, FAISS index stats, dedup triggers."""
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from datetime import datetime, timezone
from app.core.db import get_db
from app.core.deps import get_current_user
from app.core.config import settings
from app.core.audit import write_audit
from app.core.enums import AuditAction, ActorType
from app.db.models.biometric import BiometricTemplate
from app.db.models.people import AdminUser
from app.modules.ai.service import (
    get_model_status, get_thresholds, update_thresholds,
    rebuild_faiss_index, index_consistency,
)
from app.schemas import ThresholdUpdate
import ml.inference as inference

router = APIRouter(prefix="/ai", tags=["ai"])


@router.get(
    "/status",
    summary="AI model and FAISS index status",
    description=(
        "Returns the current status of the AI/ML subsystem:  \n\n"
        "- `model_loaded` — whether the ArcFace face embedding model is loaded in memory.\n"
        "- `faiss_index_size` — number of embeddings currently indexed in FAISS.\n"
        "- `face_match_threshold` — minimum cosine similarity to approve a verification.\n"
        "- `review_floor` — minimum confidence to flag for manual review instead of reject.\n"
        "- `dedup_threshold` — similarity above which two templates are considered duplicates.\n"
        "- `faiss_index_path` — path to the persisted FAISS index file on disk.\n\n"
        "Does not require authentication — safe to call from health-check scripts."
    ),
    response_description="AI subsystem status and threshold configuration.",
)
async def ai_status():
    """Return model health, FAISS index size, and threshold configuration."""
    return get_model_status()


@router.get(
    "/thresholds",
    summary="Current AI decision thresholds",
    description=(
        "Returns the three thresholds that drive the biometric decision pipeline:  \n\n"
        "- `face_match_threshold` — cosine similarity required for an `approved` decision.\n"
        "- `review_floor` — lower bound for `manual_review` (below → `rejected`).\n"
        "- `dedup_threshold` — similarity at which two enrolled templates are flagged as duplicates.\n\n"
        "All thresholds are sourced from application settings and can be overridden via environment variables."
    ),
    response_description="Current threshold values.",
    responses={
        401: {"description": "Not authenticated."},
    },
)
async def ai_thresholds(current_user: AdminUser = Depends(get_current_user)):
    """Return current threshold config from settings."""
    return get_thresholds()


@router.post(
    "/rebuild-index",
    summary="Rebuild FAISS index from stored templates",
    description=(
        "Rebuilds the FAISS 1:N index from the AES-256-GCM encrypted embeddings stored in the "
        "database (original images are not needed — only the embeddings are required, and they "
        "are persisted).  \n\n"
        "Each template's `faiss_id` is reassigned to its new index position, repairing any drift "
        "between the in-memory index and the database — the usual cause of broken 1:N "
        "de-duplication after a restart.  Use `GET /ai/status` to inspect index size."
    ),
    response_description="Count of templates indexed and the resulting index size.",
    responses={401: {"description": "Not authenticated."}},
)
# Sync `def` (not async) so FastAPI runs this CPU/DB-heavy rebuild in a worker
# thread — it must not block the event loop while it re-indexes every template.
def rebuild_index(db: Session = Depends(get_db),
                  current_user: AdminUser = Depends(get_current_user)):
    result = rebuild_faiss_index(db)
    write_audit(db, action=AuditAction.RECORD_CREATED, actor_type=ActorType.user,
                actor_id=str(current_user.id), service="AI",
                detail=f"FAISS index rebuilt: {result['templates_indexed']} templates")
    db.commit()
    return result


@router.post(
    "/healthcheck",
    summary="Ping AI model and report health",
    description=(
        "Performs a lightweight health check of the AI/ML subsystem and writes an audit entry.  \n\n"
        "Returns:  \n"
        "- `status` — `ok` if the face model is loaded and FAISS index is accessible; "
        "`degraded` otherwise.\n"
        "- `model_loaded` — whether the ArcFace model is in memory.\n"
        "- `index_size` — number of vectors in the FAISS index.\n"
        "- `checked_at` — ISO 8601 UTC timestamp of when the check was performed."
    ),
    response_description="Health check result with model and index status.",
    responses={
        401: {"description": "Not authenticated."},
    },
)
async def ai_healthcheck(
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    """Ping AI model and return health status, writing an audit entry."""
    try:
        model_loaded = inference._face_model is not None
    except AttributeError:
        model_loaded = False

    try:
        index_size = inference._faiss_index.ntotal if inference._faiss_index else 0
    except AttributeError:
        index_size = 0

    overall_status = "ok" if model_loaded else "degraded"
    checked_at = datetime.now(timezone.utc).isoformat()

    write_audit(
        db,
        action=AuditAction.HSM_HEALTHCHECK,
        actor_type=ActorType.user,
        actor_id=str(current_user.id),
        service="AI",
        detail=f"AI healthcheck: status={overall_status}, model_loaded={model_loaded}, index_size={index_size}",
    )
    db.commit()

    return {
        "status": overall_status,
        "model_loaded": model_loaded,
        "index_size": index_size,
        "checked_at": checked_at,
    }


@router.put(
    "/thresholds",
    summary="Update AI decision thresholds at runtime",
    description=(
        "Override one or more biometric decision thresholds for the current server process.  \n\n"
        "**Fields (all optional):**\n"
        "- `face_match_threshold` — minimum cosine similarity for an `approved` decision (0.0–1.0).\n"
        "- `review_floor` — lower bound for `manual_review`; scores below this are `rejected` (0.0–1.0).\n"
        "- `dedup_threshold` — similarity at which two templates are flagged as duplicates (0.0–1.0).\n\n"
        "**Warning:** changes are applied to the in-process `settings` object and take effect "
        "immediately but are **not persisted** — they reset to environment-variable defaults on "
        "server restart.  To persist thresholds, update the `.env` file or environment variables.  \n\n"
        "An audit entry is written recording old and new values."
    ),
    response_description="Current threshold values after the update.",
    responses={
        401: {"description": "Not authenticated."},
        422: {"description": "Validation error — values must be between 0.0 and 1.0."},
    },
)
async def update_thresholds_endpoint(
    req: ThresholdUpdate,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    old = get_thresholds()
    updated = update_thresholds(
        face_match_threshold=req.face_match_threshold,
        review_floor=req.review_floor,
        dedup_threshold=req.dedup_threshold,
    )
    write_audit(
        db,
        action=AuditAction.THRESHOLD_UPDATED,
        actor_type=ActorType.user,
        actor_id=str(current_user.id),
        service="AI",
        detail=f"Thresholds updated: {old} → {updated}",
    )
    db.commit()
    return updated
