"""Fraud and duplicate detection models."""
from typing import Optional, List
from datetime import datetime
from sqlalchemy import String, Float, Boolean, DateTime, ForeignKey, Enum, JSON
from sqlalchemy.orm import Mapped, mapped_column
from app.db.models.base import Base, TimestampMixin, uuid_pk
from app.core.enums import FraudType, RiskLevel, CaseResolution, DuplicateStatus, AnomalySeverity
import uuid


class FraudCase(Base, TimestampMixin):
    __tablename__ = "fraud_cases"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    type: Mapped[FraudType] = mapped_column(Enum(FraudType))
    title: Mapped[str] = mapped_column(String)
    risk_level: Mapped[RiskLevel] = mapped_column(Enum(RiskLevel))
    score: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    verdict: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    voter_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("voters.id"), nullable=True)
    registration_ref: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    polling_station_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("polling_stations.id"), nullable=True)
    detected_by: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    face_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    opened_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    resolved_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    resolution: Mapped[Optional[CaseResolution]] = mapped_column(Enum(CaseResolution), nullable=True)
    breakdown: Mapped[List] = mapped_column(JSON, default=list)
    timeline: Mapped[List] = mapped_column(JSON, default=list)
    assessment: Mapped[dict] = mapped_column(JSON, default=dict)
    duplicate_of_registration_ref: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    similarity: Mapped[Optional[float]] = mapped_column(Float, nullable=True)


class DuplicateMatch(Base, TimestampMixin):
    __tablename__ = "duplicate_matches"

    id: Mapped[uuid.UUID] = uuid_pk()
    record_a_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("voters.id"))
    record_b_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("voters.id"))
    similarity: Mapped[float] = mapped_column(Float)
    status: Mapped[DuplicateStatus] = mapped_column(Enum(DuplicateStatus), default=DuplicateStatus.pending)
    merged_into_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("voters.id"), nullable=True)
    resolved_by_user_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("admin_users.id"), nullable=True)
    resolved_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)


class AnomalySignal(Base, TimestampMixin):
    __tablename__ = "anomaly_signals"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    severity: Mapped[AnomalySeverity] = mapped_column(Enum(AnomalySeverity))
    title: Mapped[str] = mapped_column(String)
    description: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    is_live: Mapped[bool] = mapped_column(Boolean, default=True)
    signal_name: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    baseline: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    observed: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    unit: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    affected_entities: Mapped[List[str]] = mapped_column(JSON, default=list)
    recommendation: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    related_case_id: Mapped[Optional[str]] = mapped_column(ForeignKey("fraud_cases.id"), nullable=True)
    status: Mapped[str] = mapped_column(String, default="active")
    detected_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
