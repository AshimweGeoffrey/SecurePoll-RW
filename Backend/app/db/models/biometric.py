"""Biometric template models."""
from typing import Optional
from datetime import datetime
from sqlalchemy import String, Float, Boolean, DateTime, ForeignKey, LargeBinary, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.models.base import Base, TimestampMixin, uuid_pk, val_enum
from app.core.enums import Modality
import uuid


class EncryptionKey(Base, TimestampMixin):
    __tablename__ = "encryption_keys"

    id: Mapped[uuid.UUID] = uuid_pk()
    title: Mapped[str] = mapped_column(String)
    algorithm: Mapped[str] = mapped_column(String, default="AES-256-GCM")
    scope: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    current_version: Mapped[int] = mapped_column(Integer, default=1)


class BiometricTemplate(Base, TimestampMixin):
    __tablename__ = "biometric_templates"

    id: Mapped[uuid.UUID] = uuid_pk()
    voter_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("voters.id"))
    modality: Mapped[Modality] = mapped_column(val_enum(Modality))
    template_blob: Mapped[bytes] = mapped_column(LargeBinary)
    quality_score: Mapped[float] = mapped_column(Float)
    liveness_passed: Mapped[bool] = mapped_column(Boolean, default=False)
    captured_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    device_id: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    key_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("encryption_keys.id"), nullable=True)
    faiss_id: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    voter: Mapped["Voter"] = relationship(back_populates="templates")
