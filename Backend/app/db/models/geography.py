"""Geography models: Districts and PollingStations."""
from typing import Optional, List
from datetime import time
from sqlalchemy import String, Integer, Float, Time, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.models.base import Base, TimestampMixin, uuid_pk, val_enum
from app.core.enums import Province, StationStatus
import uuid


class District(Base, TimestampMixin):
    __tablename__ = "districts"

    id: Mapped[uuid.UUID] = uuid_pk()
    code: Mapped[str] = mapped_column(String, unique=True)
    name: Mapped[str] = mapped_column(String)
    province: Mapped[Province] = mapped_column(val_enum(Province))
    boundary_ref: Mapped[Optional[str]] = mapped_column(String, nullable=True)

    stations: Mapped[List["PollingStation"]] = relationship(back_populates="district")


class PollingStation(Base, TimestampMixin):
    __tablename__ = "polling_stations"

    id: Mapped[uuid.UUID] = uuid_pk()
    code: Mapped[str] = mapped_column(String, unique=True)
    name: Mapped[str] = mapped_column(String)
    district_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("districts.id"))
    lat: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    lon: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    opens_at: Mapped[Optional[time]] = mapped_column(Time, nullable=True)
    closes_at: Mapped[Optional[time]] = mapped_column(Time, nullable=True)
    status: Mapped[StationStatus] = mapped_column(val_enum(StationStatus), default=StationStatus.not_open)
    registered_count: Mapped[int] = mapped_column(Integer, default=0)
    verified_today: Mapped[int] = mapped_column(Integer, default=0)

    district: Mapped["District"] = relationship(back_populates="stations")
