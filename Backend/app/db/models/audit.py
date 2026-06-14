"""Audit entry model (hash-chained, append-only)."""
from typing import Optional, List
from datetime import datetime
from sqlalchemy import String, BigInteger, DateTime, ForeignKey, JSON, Sequence
from sqlalchemy.orm import Mapped, mapped_column
from app.db.models.base import Base, uuid_pk, val_enum
from app.core.enums import AuditAction, ActorType
import uuid


class AuditEntry(Base):
    """Append-only, hash-chained audit log. REVOKE UPDATE/DELETE from app role."""
    __tablename__ = "audit_entries"

    id: Mapped[uuid.UUID] = uuid_pk()
    sequence: Mapped[int] = mapped_column(BigInteger, Sequence("audit_seq"), unique=True, index=True)
    occurred_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    action: Mapped[AuditAction] = mapped_column(val_enum(AuditAction))
    actor_type: Mapped[ActorType] = mapped_column(val_enum(ActorType))
    actor_id: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    actor_role: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    service: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    polling_station_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("polling_stations.id"), nullable=True)
    ip_address: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    geo: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    detail: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    change_diff: Mapped[Optional[List]] = mapped_column(JSON, nullable=True)
    entry_hash: Mapped[str] = mapped_column(String, index=True)
    prev_hash: Mapped[str] = mapped_column(String)
