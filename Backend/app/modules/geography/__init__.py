"""Geography module — districts and polling stations CRUD."""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select, func
import uuid

from app.core.db import get_db
from app.core.audit import write_audit
from app.core.deps import get_current_user
from app.core.enums import AuditAction, ActorType, StationStatus, Province
from app.db.models.geography import District, PollingStation
from app.db.models.voter import Voter
from app.db.models.people import AdminUser
from app.schemas import (
    DistrictCreate, DistrictResponse, DistrictUpdate,
    PollingStationCreate, PollingStationResponse, PollingStationUpdate,
)
from app.modules.geography.service import (
    get_districts, create_district, get_district, update_district,
    get_polling_stations, create_polling_station,
    get_polling_station, update_polling_station, set_station_status,
)

router = APIRouter(tags=["geography"])


# ============================================================================
# Districts
# ============================================================================

@router.get(
    "/districts",
    summary="List all districts with optional province filter",
    description=(
        "Returns a paginated list of districts.  \n\n"
        "**Query parameters:**\n"
        "- `province` — filter by `Province` enum value "
        "(`Kigali City`, `Northern`, `Southern`, `Eastern`, `Western`).\n"
        "- `skip` / `limit` — pagination offset and page size (default 50)."
    ),
    response_description="Paginated district list with total count.",
    responses={
        401: {"description": "Not authenticated."},
    },
)
async def list_districts(
    province: Optional[Province] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    items, total = get_districts(db, province=province, skip=skip, limit=limit)
    return {
        "total": total,
        "skip": skip,
        "limit": limit,
        "items": [DistrictResponse.model_validate(d) for d in items],
    }


@router.post(
    "/districts",
    response_model=DistrictResponse,
    status_code=201,
    summary="Create a new district",
    description=(
        "Register a new administrative district.  \n\n"
        "The `code` field must be unique across all districts.  "
        "Optionally supply a `boundary_ref` (GeoJSON reference string) for map integration.  "
        "An audit entry is written on success."
    ),
    response_description="Newly created district record.",
    responses={
        401: {"description": "Not authenticated."},
        422: {"description": "Validation error — code already in use or invalid province."},
    },
)
async def create_district_endpoint(
    req: DistrictCreate,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    district = create_district(db, req)
    write_audit(
        db,
        action=AuditAction.RECORD_CREATED,
        actor_type=ActorType.user,
        actor_id=str(current_user.id),
        service="Geography",
        detail=f"Created district: {req.code} — {req.name}",
    )
    db.commit()
    db.refresh(district)
    return district


@router.get(
    "/districts/{district_id}",
    response_model=DistrictResponse,
    summary="Get a district by UUID",
    description=(
        "Retrieve the full record of a single district using its UUID primary key.  "
        "Returns **404** if the district does not exist."
    ),
    response_description="District record.",
    responses={
        401: {"description": "Not authenticated."},
        404: {"description": "District not found."},
    },
)
async def get_district_endpoint(
    district_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    district = get_district(db, district_id)
    if not district:
        raise HTTPException(status_code=404, detail="District not found")
    return district


@router.patch(
    "/districts/{district_id}",
    response_model=DistrictResponse,
    summary="Partially update a district",
    description=(
        "Update one or more of a district's mutable fields: `code`, `name`, or `boundary_ref`.  "
        "Omitted fields are left unchanged (PATCH semantics).  "
        "An audit entry is written recording the field-level diff."
    ),
    response_description="Updated district record.",
    responses={
        401: {"description": "Not authenticated."},
        404: {"description": "District not found."},
    },
)
async def update_district_endpoint(
    district_id: uuid.UUID,
    req: DistrictUpdate,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    district = get_district(db, district_id)
    if not district:
        raise HTTPException(status_code=404, detail="District not found")

    update_data = req.model_dump(exclude_unset=True)
    old_vals = {k: getattr(district, k) for k in update_data}
    district = update_district(db, district, **update_data)

    write_audit(
        db,
        action=AuditAction.ADDRESS_UPDATED,
        actor_type=ActorType.user,
        actor_id=str(current_user.id),
        service="Geography",
        detail=f"Updated district: {district.code}",
        change_diff=[
            {"field": k, "old": str(old_vals[k]), "new": str(v)}
            for k, v in update_data.items()
        ],
    )
    db.commit()
    db.refresh(district)
    return district


# ============================================================================
# Polling Stations
# ============================================================================

@router.get(
    "/polling-stations",
    summary="List all polling stations with optional district filter",
    description=(
        "Returns a paginated list of polling stations.  \n\n"
        "**Query parameters:**\n"
        "- `district_id` — filter to one district's stations.\n"
        "- `skip` / `limit` — pagination offset and page size (default 50)."
    ),
    response_description="Paginated polling station list with total count.",
    responses={
        401: {"description": "Not authenticated."},
    },
)
async def list_polling_stations(
    district_id: Optional[uuid.UUID] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    items, total = get_polling_stations(db, district_id=district_id, skip=skip, limit=limit)
    return {
        "total": total,
        "skip": skip,
        "limit": limit,
        "items": [PollingStationResponse.model_validate(s) for s in items],
    }


@router.post(
    "/polling-stations",
    response_model=PollingStationResponse,
    status_code=201,
    summary="Create a new polling station",
    description=(
        "Register a new polling station.  \n\n"
        "The `district_id` must reference an existing district — returns **400** if not found.  "
        "The station is created with status `not_open` by default.  "
        "An audit entry is written on success."
    ),
    response_description="Newly created polling station record.",
    responses={
        400: {"description": "Referenced district does not exist."},
        401: {"description": "Not authenticated."},
        422: {"description": "Validation error — code already in use."},
    },
)
async def create_polling_station_endpoint(
    req: PollingStationCreate,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    if not get_district(db, req.district_id):
        raise HTTPException(status_code=400, detail="District not found")

    station = create_polling_station(db, req)
    write_audit(
        db,
        action=AuditAction.RECORD_CREATED,
        actor_type=ActorType.user,
        actor_id=str(current_user.id),
        service="Geography",
        detail=f"Created polling station: {req.code} — {req.name}",
    )
    db.commit()
    db.refresh(station)
    return station


@router.get(
    "/polling-stations/{station_id}",
    response_model=PollingStationResponse,
    summary="Get a polling station by UUID",
    description=(
        "Retrieve the full record of a single polling station using its UUID primary key.  "
        "Returns **404** if the station does not exist."
    ),
    response_description="Polling station record.",
    responses={
        401: {"description": "Not authenticated."},
        404: {"description": "Polling station not found."},
    },
)
async def get_polling_station_endpoint(
    station_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    station = get_polling_station(db, station_id)
    if not station:
        raise HTTPException(status_code=404, detail="Polling station not found")
    return station


@router.patch(
    "/polling-stations/{station_id}",
    response_model=PollingStationResponse,
    summary="Partially update a polling station",
    description=(
        "Update one or more mutable fields of a polling station: "
        "`name`, `lat`, `lon`, `opens_at`, `closes_at`.  "
        "Omitted fields are left unchanged (PATCH semantics).  "
        "Use `:open` and `:close` custom actions to change the station's operational status."
    ),
    response_description="Updated polling station record.",
    responses={
        401: {"description": "Not authenticated."},
        404: {"description": "Polling station not found."},
    },
)
async def update_polling_station_endpoint(
    station_id: uuid.UUID,
    req: PollingStationUpdate,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    station = get_polling_station(db, station_id)
    if not station:
        raise HTTPException(status_code=404, detail="Polling station not found")

    update_data = req.model_dump(exclude_unset=True)
    station = update_polling_station(db, station, **update_data)
    db.commit()
    db.refresh(station)
    return station


@router.post(
    "/polling-stations/{station_id}:open",
    response_model=PollingStationResponse,
    summary="Open a polling station for voting",
    description=(
        "Set the station's status to `online`, indicating that it is open and accepting voters.  "
        "An audit entry is written with action `STATUS_SYNCED`.  "
        "Returns **404** if the station does not exist."
    ),
    response_description="Updated polling station with status `online`.",
    responses={
        401: {"description": "Not authenticated."},
        404: {"description": "Polling station not found."},
    },
)
async def open_polling_station(
    station_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    station = get_polling_station(db, station_id)
    if not station:
        raise HTTPException(status_code=404, detail="Polling station not found")

    station = set_station_status(db, station, StationStatus.online)
    write_audit(
        db,
        action=AuditAction.STATUS_SYNCED,
        actor_type=ActorType.user,
        actor_id=str(current_user.id),
        service="Geography",
        station_id=station_id,
        detail=f"Station opened: {station.code}",
    )
    db.commit()
    db.refresh(station)
    return station


@router.post(
    "/polling-stations/{station_id}:close",
    response_model=PollingStationResponse,
    summary="Close a polling station",
    description=(
        "Set the station's status to `offline`, indicating that voting has ended at this station.  "
        "An audit entry is written with action `STATUS_SYNCED`.  "
        "Returns **404** if the station does not exist."
    ),
    response_description="Updated polling station with status `offline`.",
    responses={
        401: {"description": "Not authenticated."},
        404: {"description": "Polling station not found."},
    },
)
async def close_polling_station(
    station_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    station = get_polling_station(db, station_id)
    if not station:
        raise HTTPException(status_code=404, detail="Polling station not found")

    station = set_station_status(db, station, StationStatus.offline)
    write_audit(
        db,
        action=AuditAction.STATUS_SYNCED,
        actor_type=ActorType.user,
        actor_id=str(current_user.id),
        service="Geography",
        station_id=station_id,
        detail=f"Station closed: {station.code}",
    )
    db.commit()
    db.refresh(station)
    return station


@router.get(
    "/polling-stations/{station_id}/summary",
    summary="Station-day summary with vote counts",
    description=(
        "Returns a real-time summary for a polling station covering the current election day.  \n\n"
        "**Fields returned:**\n"
        "- `registered_count` — total voters assigned to this station.\n"
        "- `verified_today` — biometric verifications completed today (from station counter).\n"
        "- `votes_cast` — voters with status `voted` assigned to this station (queried live).\n"
        "- `pending` — registered voters who have not yet voted.\n\n"
        "Returns **404** if the station does not exist."
    ),
    response_description="Station-day summary with registration, verification, and vote counts.",
    responses={
        401: {"description": "Not authenticated."},
        404: {"description": "Polling station not found."},
    },
)
async def station_summary(
    station_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    station = get_polling_station(db, station_id)
    if not station:
        raise HTTPException(status_code=404, detail="Polling station not found")

    from app.core.enums import VoterStatus

    votes_cast = db.execute(
        select(func.count(Voter.id)).where(
            Voter.polling_station_id == station_id,
            Voter.status == VoterStatus.voted,
        )
    ).scalar() or 0

    return {
        "station_id": str(station_id),
        "station_code": station.code,
        "station_name": station.name,
        "status": station.status.value,
        "registered_count": station.registered_count,
        "verified_today": station.verified_today,
        "votes_cast": votes_cast,
        "pending": station.registered_count - votes_cast,
    }
