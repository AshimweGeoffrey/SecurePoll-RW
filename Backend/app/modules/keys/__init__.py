"""Keys module — encryption key lifecycle management and HSM health."""
import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.audit import write_audit
from app.core.deps import get_current_user
from app.core.enums import AuditAction, ActorType
from app.db.models.people import AdminUser
from app.schemas import EncryptionKeyCreate, EncryptionKeyResponse
from app.modules.keys.service import list_keys, create_key, get_key, rotate_key

router = APIRouter(tags=["keys"])


@router.get(
    "/keys/health",
    summary="HSM health check — list all key versions and algorithms",
    description=(
        "Returns a summary of every registered encryption key including its current version number "
        "and algorithm.  This endpoint simulates a Hardware Security Module (HSM) health probe.  \n\n"
        "An audit entry is written with action `HSM_HEALTHCHECK` so that health probes are "
        "traceable in the immutable audit log.  "
        "Use this endpoint from monitoring scripts to verify key availability and rotation state."
    ),
    response_description="List of keys with id, title, algorithm, current_version, and a healthy flag.",
    responses={
        401: {"description": "Not authenticated."},
    },
)
async def keys_health(
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    keys = list_keys(db)
    write_audit(
        db,
        action=AuditAction.HSM_HEALTHCHECK,
        actor_type=ActorType.user,
        actor_id=str(current_user.id),
        service="Keys",
        detail=f"HSM health check — {len(keys)} key(s) probed",
    )
    db.commit()
    return {
        "healthy": True,
        "key_count": len(keys),
        "keys": [
            {
                "id": str(k.id),
                "title": k.title,
                "algorithm": k.algorithm,
                "scope": k.scope,
                "current_version": k.current_version,
            }
            for k in keys
        ],
    }


@router.get(
    "/keys",
    summary="List all encryption key records",
    description=(
        "Returns all encryption key records registered in the system, ordered by creation date.  \n\n"
        "Each record stores key metadata only — the actual key material is managed by the HSM "
        "and never returned by this API.  "
        "Use `current_version` to track rotation history."
    ),
    response_description="List of all encryption key records.",
    responses={
        401: {"description": "Not authenticated."},
    },
)
async def list_keys_endpoint(
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    keys = list_keys(db)
    return {
        "total": len(keys),
        "items": [EncryptionKeyResponse.model_validate(k) for k in keys],
    }


@router.post(
    "/keys",
    response_model=EncryptionKeyResponse,
    status_code=201,
    summary="Register a new encryption key record",
    description=(
        "Create a metadata record for a new encryption key.  \n\n"
        "**Fields:**\n"
        "- `title` — human-readable label (e.g. `Biometric Template Key 2025`).\n"
        "- `algorithm` — cipher algorithm (default `AES-256-GCM`).\n"
        "- `scope` — optional scope string (e.g. `biometrics`, `backups`).\n\n"
        "The key is created at `current_version = 1`.  "
        "Call `:rotate` to increment the version when key material is rotated in the HSM."
    ),
    response_description="Newly created encryption key record.",
    responses={
        401: {"description": "Not authenticated."},
        422: {"description": "Validation error — missing required fields."},
    },
)
async def create_key_endpoint(
    req: EncryptionKeyCreate,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    key = create_key(db, req)
    db.commit()
    db.refresh(key)
    return key


@router.get(
    "/keys/{key_id}",
    response_model=EncryptionKeyResponse,
    summary="Get an encryption key record by UUID",
    description=(
        "Retrieve the metadata record for a single encryption key by its UUID primary key.  "
        "Returns **404** if the key record does not exist."
    ),
    response_description="Encryption key metadata record.",
    responses={
        401: {"description": "Not authenticated."},
        404: {"description": "Encryption key not found."},
    },
)
async def get_key_endpoint(
    key_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    key = get_key(db, key_id)
    if not key:
        raise HTTPException(status_code=404, detail="Encryption key not found")
    return key


@router.post(
    "/keys/{key_id}:rotate",
    response_model=EncryptionKeyResponse,
    summary="Rotate an encryption key — increment its version",
    description=(
        "Signal that the underlying key material for this record has been rotated in the HSM.  \n\n"
        "**Effect:**\n"
        "- Increments `current_version` by 1.\n"
        "- Updates `updated_at` to the current UTC timestamp.\n"
        "- Writes an audit entry with action `KEY_ROTATED`.\n\n"
        "Returns **404** if the key record does not exist."
    ),
    response_description="Updated encryption key record with incremented version.",
    responses={
        401: {"description": "Not authenticated."},
        404: {"description": "Encryption key not found."},
    },
)
async def rotate_key_endpoint(
    key_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    key = get_key(db, key_id)
    if not key:
        raise HTTPException(status_code=404, detail="Encryption key not found")

    old_version = key.current_version
    key = rotate_key(db, key)

    write_audit(
        db,
        action=AuditAction.KEY_ROTATED,
        actor_type=ActorType.user,
        actor_id=str(current_user.id),
        service="Keys",
        detail=f"Key rotated: {key.title} v{old_version} → v{key.current_version}",
    )
    db.commit()
    db.refresh(key)
    return key
