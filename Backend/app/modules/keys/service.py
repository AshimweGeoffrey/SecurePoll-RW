"""Encryption key management business logic."""
from typing import Optional, List
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.db.models.biometric import EncryptionKey
from app.schemas import EncryptionKeyCreate
import uuid


def list_keys(db: Session) -> List[EncryptionKey]:
    """Return all encryption key records ordered by creation date."""
    return db.execute(
        select(EncryptionKey).order_by(EncryptionKey.created_at.asc())
    ).scalars().all()


def create_key(db: Session, data: EncryptionKeyCreate) -> EncryptionKey:
    """Persist a new EncryptionKey record."""
    key = EncryptionKey(**data.model_dump())
    db.add(key)
    db.flush()
    return key


def get_key(db: Session, key_id: uuid.UUID) -> Optional[EncryptionKey]:
    """Fetch a single EncryptionKey by primary key. Returns None if not found."""
    return db.execute(
        select(EncryptionKey).where(EncryptionKey.id == key_id)
    ).scalar_one_or_none()


def rotate_key(db: Session, key: EncryptionKey) -> EncryptionKey:
    """Increment current_version and update the updated_at timestamp."""
    key.current_version += 1
    key.updated_at = datetime.now(timezone.utc)
    db.flush()
    return key


def update_key(db: Session, key: EncryptionKey, **fields) -> EncryptionKey:
    """Update mutable metadata fields (title, scope) on a key record."""
    for k, v in fields.items():
        if v is not None:
            setattr(key, k, v)
    key.updated_at = datetime.now(timezone.utc)
    db.flush()
    return key


def delete_key(db: Session, key: EncryptionKey) -> None:
    """Hard-delete a key record (decommission)."""
    db.delete(key)
    db.flush()
