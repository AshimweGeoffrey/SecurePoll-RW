"""Geography business logic — districts and polling stations."""
from typing import Optional, Tuple, List
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from app.db.models.geography import District, PollingStation
from app.core.enums import Province, StationStatus
from app.schemas import DistrictCreate, PollingStationCreate
import uuid


# ---------------------------------------------------------------------------
# Districts
# ---------------------------------------------------------------------------

def get_districts(
    db: Session,
    province: Optional[Province] = None,
    skip: int = 0,
    limit: int = 50,
) -> Tuple[List[District], int]:
    """Return a page of districts and the total count."""
    query = select(District)
    if province is not None:
        query = query.where(District.province == province)
    total = db.execute(select(func.count()).select_from(query.subquery())).scalar()
    items = db.execute(query.offset(skip).limit(limit)).scalars().all()
    return items, total


def create_district(db: Session, data: DistrictCreate) -> District:
    """Persist a new District row."""
    district = District(**data.model_dump())
    db.add(district)
    db.flush()
    return district


def get_district(db: Session, district_id: uuid.UUID) -> Optional[District]:
    """Fetch a single District by primary key. Returns None if not found."""
    return db.execute(
        select(District).where(District.id == district_id)
    ).scalar_one_or_none()


def update_district(db: Session, district: District, **fields) -> District:
    """Apply keyword-argument field updates to a District and flush."""
    for key, value in fields.items():
        if value is not None:
            setattr(district, key, value)
    db.flush()
    return district


# ---------------------------------------------------------------------------
# Polling stations
# ---------------------------------------------------------------------------

def get_polling_stations(
    db: Session,
    district_id: Optional[uuid.UUID] = None,
    skip: int = 0,
    limit: int = 50,
) -> Tuple[List[PollingStation], int]:
    """Return a page of polling stations and the total count."""
    query = select(PollingStation)
    if district_id is not None:
        query = query.where(PollingStation.district_id == district_id)
    total = db.execute(select(func.count()).select_from(query.subquery())).scalar()
    items = db.execute(query.offset(skip).limit(limit)).scalars().all()
    return items, total


def create_polling_station(db: Session, data: PollingStationCreate) -> PollingStation:
    """Persist a new PollingStation row."""
    station = PollingStation(**data.model_dump())
    db.add(station)
    db.flush()
    return station


def get_polling_station(db: Session, station_id: uuid.UUID) -> Optional[PollingStation]:
    """Fetch a single PollingStation by primary key. Returns None if not found."""
    return db.execute(
        select(PollingStation).where(PollingStation.id == station_id)
    ).scalar_one_or_none()


def update_polling_station(db: Session, station: PollingStation, **fields) -> PollingStation:
    """Apply keyword-argument field updates to a PollingStation and flush."""
    for key, value in fields.items():
        if value is not None:
            setattr(station, key, value)
    db.flush()
    return station


def set_station_status(
    db: Session, station: PollingStation, status: StationStatus
) -> PollingStation:
    """Set the status of a PollingStation and flush."""
    station.status = status
    db.flush()
    return station
