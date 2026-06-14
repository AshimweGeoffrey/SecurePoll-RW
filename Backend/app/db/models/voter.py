"""Voter model."""
from datetime import datetime, date
from sqlalchemy import String, Integer, Float, Date, DateTime, ForeignKey, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.models.base import Base, TimestampMixin, uuid_pk
from app.core.enums import VoterStatus, Sex
import uuid


class Voter(Base, TimestampMixin):
    """A registered voter."""
    __tablename__ = "voters"
    
    id = uuid_pk()
    voter_token: Mapped[str] = mapped_column(String, unique=True)
    registration_ref: Mapped[str] = mapped_column(String, unique=True)
    national_id: Mapped[str] = mapped_column(String(16), unique=True)
    first_name: Mapped[str] = mapped_column(String)
    last_name: Mapped[str] = mapped_column(String)
    sex: Mapped[Sex] = mapped_column(Enum(Sex))
    date_of_birth: Mapped[date] = mapped_column(Date)
    phone: Mapped[str | None] = mapped_column(String)
    district_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("districts.id"))
    polling_station_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("polling_stations.id"))
    roll_position: Mapped[int | None] = mapped_column(Integer)
    status: Mapped[VoterStatus] = mapped_column(Enum(VoterStatus), default=VoterStatus.registered)
    enrolled_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    enrolled_by_officer_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("field_officers.id"))
    enroll_lat: Mapped[float | None] = mapped_column(Float)
    enroll_lon: Mapped[float | None] = mapped_column(Float)
    data_quality_score: Mapped[int] = mapped_column(Integer, default=0)
    last_activity_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    last_verified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    
    templates: Mapped[list["BiometricTemplate"]] = relationship(back_populates="voter")
