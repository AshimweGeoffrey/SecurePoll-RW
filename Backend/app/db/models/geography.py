"""Geography models: Districts and PollingStations."""
from sqlalchemy import String, Integer, Float, Time, ForeignKey, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.models.base import Base, TimestampMixin, uuid_pk
from app.core.enums import Province, StationStatus
import uuid


class District(Base, TimestampMixin):
    """Electoral district."""
    __tablename__ = "districts"
    
    id = uuid_pk()
    code: Mapped[str] = mapped_column(String, unique=True)
    name: Mapped[str] = mapped_column(String)
    province: Mapped[Province] = mapped_column(Enum(Province))
    boundary_ref: Mapped[str | None] = mapped_column(String)
    
    stations: Mapped[list["PollingStation"]] = relationship(back_populates="district")


class PollingStation(Base, TimestampMixin):
    """A polling station within a district."""
    __tablename__ = "polling_stations"
    
    id = uuid_pk()
    code: Mapped[str] = mapped_column(String, unique=True)
    name: Mapped[str] = mapped_column(String)
    district_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("districts.id"))
    lat: Mapped[float | None] = mapped_column(Float)
    lon: Mapped[float | None] = mapped_column(Float)
    opens_at: Mapped[str | None] = mapped_column(Time)
    closes_at: Mapped[str | None] = mapped_column(Time)
    status: Mapped[StationStatus] = mapped_column(
        Enum(StationStatus), default=StationStatus.not_open
    )
    registered_count: Mapped[int] = mapped_column(Integer, default=0)
    verified_today: Mapped[int] = mapped_column(Integer, default=0)
    
    district: Mapped["District"] = relationship(back_populates="stations")
