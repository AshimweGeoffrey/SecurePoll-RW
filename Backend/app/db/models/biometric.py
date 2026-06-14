"""Biometric template models."""
from datetime import datetime
from sqlalchemy import String, Float, Boolean, DateTime, ForeignKey, Enum, LargeBinary, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.models.base import Base, TimestampMixin, uuid_pk
from app.core.enums import Modality
import uuid


class EncryptionKey(Base, TimestampMixin):
    """Key metadata (actual key bytes in env)."""
    __tablename__ = "encryption_keys"
    
    id = uuid_pk()
    title: Mapped[str] = mapped_column(String)
    algorithm: Mapped[str] = mapped_column(String, default="AES-256-GCM")
    scope: Mapped[str | None] = mapped_column(String)
    current_version: Mapped[int] = mapped_column(Integer, default=1)


class BiometricTemplate(Base, TimestampMixin):
    """Encrypted biometric template (never returned raw by API)."""
    __tablename__ = "biometric_templates"
    
    id = uuid_pk()
    voter_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("voters.id"))
    modality: Mapped[Modality] = mapped_column(Enum(Modality))
    template_blob: Mapped[bytes] = mapped_column(LargeBinary)
    quality_score: Mapped[float] = mapped_column(Float)
    liveness_passed: Mapped[bool] = mapped_column(Boolean, default=False)
    captured_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    device_id: Mapped[str | None] = mapped_column(String)
    key_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("encryption_keys.id"))
    faiss_id: Mapped[int | None] = mapped_column(Integer)
    
    voter: Mapped["Voter"] = relationship(back_populates="templates")
