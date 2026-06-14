"""Audit entry model (hash-chained, append-only)."""
from datetime import datetime
from sqlalchemy import String, BigInteger, DateTime, ForeignKey, Enum, JSON
from sqlalchemy.orm import Mapped, mapped_column
from app.db.models.base import Base, uuid_pk
from app.core.enums import AuditAction, ActorType
import uuid


class AuditEntry(Base):
    """Append-only, hash-chained audit log."""
    __tablename__ = "audit_entries"
    
    id = uuid_pk()
    sequence: Mapped[int] = mapped_column(BigInteger, autoincrement=True, unique=True)
    occurred_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    action: Mapped[AuditAction] = mapped_column(Enum(AuditAction))
    actor_type: Mapped[ActorType] = mapped_column(Enum(ActorType))
    actor_id: Mapped[str | None] = mapped_column(String)
    actor_role: Mapped[str | None] = mapped_column(String)
    service: Mapped[str | None] = mapped_column(String)
    polling_station_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("polling_stations.id"))
    ip_address: Mapped[str | None] = mapped_column(String)
    geo: Mapped[str | None] = mapped_column(String)
    detail: Mapped[str | None] = mapped_column(String)
    change_diff: Mapped[list | None] = mapped_column(JSON)
    entry_hash: Mapped[str] = mapped_column(String)
    prev_hash: Mapped[str] = mapped_column(String)
