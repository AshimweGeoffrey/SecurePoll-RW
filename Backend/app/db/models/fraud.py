"""Fraud and duplicate detection models."""
from datetime import datetime
from sqlalchemy import String, Float, Boolean, DateTime, ForeignKey, Enum, JSON
from sqlalchemy.orm import Mapped, mapped_column
from app.db.models.base import Base, TimestampMixin, uuid_pk
from app.core.enums import (FraudType, RiskLevel, CaseResolution,
                            DuplicateStatus, AnomalySeverity)
import uuid


class FraudCase(Base, TimestampMixin):
    """A fraud investigation case."""
    __tablename__ = "fraud_cases"
    
    id: Mapped[str] = mapped_column(String, primary_key=True)
    type: Mapped[FraudType] = mapped_column(Enum(FraudType))
    title: Mapped[str] = mapped_column(String)
    risk_level: Mapped[RiskLevel] = mapped_column(Enum(RiskLevel))
    score: Mapped[str | None] = mapped_column(String)
    verdict: Mapped[str | None] = mapped_column(String)
    voter_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("voters.id"))
    registration_ref: Mapped[str | None] = mapped_column(String)
    polling_station_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("polling_stations.id"))
    detected_by: Mapped[str | None] = mapped_column(String)
    face_score: Mapped[float | None] = mapped_column(Float)
    opened_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    resolution: Mapped[CaseResolution | None] = mapped_column(Enum(CaseResolution))
    breakdown: Mapped[list] = mapped_column(JSON, default=list)
    timeline: Mapped[list] = mapped_column(JSON, default=list)
    assessment: Mapped[dict] = mapped_column(JSON, default=dict)
    duplicate_of_registration_ref: Mapped[str | None] = mapped_column(String)
    similarity: Mapped[float | None] = mapped_column(Float)


class DuplicateMatch(Base, TimestampMixin):
    """A potential duplicate voter record."""
    __tablename__ = "duplicate_matches"
    
    id = uuid_pk()
    record_a_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("voters.id"))
    record_b_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("voters.id"))
    similarity: Mapped[float] = mapped_column(Float)
    status: Mapped[DuplicateStatus] = mapped_column(Enum(DuplicateStatus), default=DuplicateStatus.pending)
    merged_into_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("voters.id"))
    resolved_by_user_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("admin_users.id"))
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class AnomalySignal(Base, TimestampMixin):
    """System anomaly alert."""
    __tablename__ = "anomaly_signals"
    
    id = uuid_pk()
    public_ref: Mapped[str] = mapped_column(String, unique=True)
    severity: Mapped[AnomalySeverity] = mapped_column(Enum(AnomalySeverity))
    title: Mapped[str] = mapped_column(String)
    description: Mapped[str | None] = mapped_column(String)
    is_live: Mapped[bool] = mapped_column(Boolean, default=True)
    signal_name: Mapped[str | None] = mapped_column(String)
    baseline: Mapped[float | None] = mapped_column(Float)
    observed: Mapped[float | None] = mapped_column(Float)
    unit: Mapped[str | None] = mapped_column(String)
    affected_entities: Mapped[list[str]] = mapped_column(JSON, default=list)
    recommendation: Mapped[str | None] = mapped_column(String)
    related_case_id: Mapped[str | None] = mapped_column(ForeignKey("fraud_cases.id"))
    status: Mapped[str] = mapped_column(String, default="active")
    detected_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
