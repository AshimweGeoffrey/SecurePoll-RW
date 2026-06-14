"""Voter model."""
from typing import Optional, List
from datetime import datetime, date
from sqlalchemy import String, Integer, Float, Date, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.models.base import Base, TimestampMixin, uuid_pk, val_enum
from app.core.enums import VoterStatus, Sex
import uuid


class Voter(Base, TimestampMixin):
    __tablename__ = "voters"

    id: Mapped[uuid.UUID] = uuid_pk()
    voter_token: Mapped[str] = mapped_column(String, unique=True)
    registration_ref: Mapped[str] = mapped_column(String, unique=True)
    national_id: Mapped[str] = mapped_column(String(16), unique=True)
    first_name: Mapped[str] = mapped_column(String)
    last_name: Mapped[str] = mapped_column(String)
    sex: Mapped[Sex] = mapped_column(val_enum(Sex))
    date_of_birth: Mapped[date] = mapped_column(Date)
    phone: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    district_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("districts.id"))
    polling_station_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("polling_stations.id"))
    roll_position: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    status: Mapped[VoterStatus] = mapped_column(val_enum(VoterStatus), default=VoterStatus.registered)
    enrolled_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    enrolled_by_officer_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("field_officers.id"), nullable=True)
    enroll_lat: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    enroll_lon: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    data_quality_score: Mapped[int] = mapped_column(Integer, default=0)
    last_activity_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    last_verified_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    templates: Mapped[List["BiometricTemplate"]] = relationship(back_populates="voter")
