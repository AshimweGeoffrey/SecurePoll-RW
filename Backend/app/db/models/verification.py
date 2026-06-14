"""Verification attempt model."""
from typing import Optional, List
from datetime import datetime
from sqlalchemy import String, Float, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column
from app.db.models.base import Base, TimestampMixin, uuid_pk, val_enum
from app.core.enums import VerifyResult, Liveness
import uuid


class VerificationAttempt(Base, TimestampMixin):
    __tablename__ = "verification_attempts"

    id: Mapped[uuid.UUID] = uuid_pk()
    voter_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("voters.id"), nullable=True)
    polling_station_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("polling_stations.id"), nullable=True)
    officer_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("field_officers.id"), nullable=True)
    device_id: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    result: Mapped[VerifyResult] = mapped_column(val_enum(VerifyResult))
    confidence: Mapped[float] = mapped_column(Float)
    face_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    fingerprint_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    liveness: Mapped[Liveness] = mapped_column(val_enum(Liveness))
    review_required: Mapped[bool] = mapped_column(Boolean, default=False)
    explanation: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    flags: Mapped[List[str]] = mapped_column(JSON, default=list)
