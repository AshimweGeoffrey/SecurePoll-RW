"""Verification attempt model."""
from datetime import datetime
from sqlalchemy import String, Float, Boolean, DateTime, ForeignKey, Enum, JSON
from sqlalchemy.orm import Mapped, mapped_column
from app.db.models.base import Base, TimestampMixin, uuid_pk
from app.core.enums import VerifyResult, Liveness
import uuid


class VerificationAttempt(Base, TimestampMixin):
    """A single verification attempt (1:1 match)."""
    __tablename__ = "verification_attempts"
    
    id = uuid_pk()
    voter_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("voters.id"))
    polling_station_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("polling_stations.id"))
    officer_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("field_officers.id"))
    device_id: Mapped[str | None] = mapped_column(String)
    result: Mapped[VerifyResult] = mapped_column(Enum(VerifyResult))
    confidence: Mapped[float] = mapped_column(Float)
    face_score: Mapped[float | None] = mapped_column(Float)
    fingerprint_score: Mapped[float | None] = mapped_column(Float)
    liveness: Mapped[Liveness] = mapped_column(Enum(Liveness))
    review_required: Mapped[bool] = mapped_column(Boolean, default=False)
    explanation: Mapped[str | None] = mapped_column(String)
    flags: Mapped[list[str]] = mapped_column(JSON, default=list)
