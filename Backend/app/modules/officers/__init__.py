"""Officers module — field officer CRUD and verification stats."""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
import uuid

from sqlalchemy.orm import Session
from app.core.db import get_db
from app.core.deps import get_current_user
from app.db.models.people import AdminUser
from app.schemas import FieldOfficerCreate, FieldOfficerResponse, FieldOfficerUpdate
from app.modules.officers.service import (
    list_officers, create_officer, get_officer,
    update_officer, delete_officer, officer_stats,
)

router = APIRouter(tags=["officers"])


@router.get(
    "/officers",
    summary="List all field officers with optional district filter",
    description=(
        "Returns a paginated list of field officers.  \n\n"
        "**Query parameters:**\n"
        "- `district_id` — filter to officers assigned to a specific district.\n"
        "- `skip` / `limit` — pagination offset and page size (default 50)."
    ),
    response_description="Paginated field officer list with total count.",
    responses={
        401: {"description": "Not authenticated."},
    },
)
async def list_officers_endpoint(
    district_id: Optional[uuid.UUID] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    items, total = list_officers(db, district_id=district_id, skip=skip, limit=limit)
    return {
        "total": total,
        "skip": skip,
        "limit": limit,
        "items": [FieldOfficerResponse.model_validate(o) for o in items],
    }


@router.post(
    "/officers",
    response_model=FieldOfficerResponse,
    status_code=201,
    summary="Create a new field officer",
    description=(
        "Register a new field officer.  \n\n"
        "Optionally assign the officer to a `team` and a district via `assigned_district_id`.  "
        "The `assigned_district_id` is not validated against the districts table at creation "
        "time — ensure you pass a valid UUID if district scoping is required."
    ),
    response_description="Newly created field officer record.",
    responses={
        401: {"description": "Not authenticated."},
        422: {"description": "Validation error — missing required fields."},
    },
)
async def create_officer_endpoint(
    req: FieldOfficerCreate,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    officer = create_officer(db, req)
    db.commit()
    db.refresh(officer)
    return officer


@router.get(
    "/officers/{officer_id}",
    response_model=FieldOfficerResponse,
    summary="Get a field officer by UUID",
    description=(
        "Retrieve the full record of a single field officer using their UUID primary key.  "
        "Returns **404** if the officer does not exist."
    ),
    response_description="Field officer record.",
    responses={
        401: {"description": "Not authenticated."},
        404: {"description": "Officer not found."},
    },
)
async def get_officer_endpoint(
    officer_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    officer = get_officer(db, officer_id)
    if not officer:
        raise HTTPException(status_code=404, detail="Officer not found")
    return officer


@router.patch(
    "/officers/{officer_id}",
    response_model=FieldOfficerResponse,
    summary="Partially update a field officer",
    description=(
        "Update one or more of a field officer's mutable fields: "
        "`name`, `team`, or `assigned_district_id`.  "
        "Omitted fields are left unchanged (PATCH semantics).  "
        "Returns **404** if the officer does not exist."
    ),
    response_description="Updated field officer record.",
    responses={
        401: {"description": "Not authenticated."},
        404: {"description": "Officer not found."},
    },
)
async def update_officer_endpoint(
    officer_id: uuid.UUID,
    req: FieldOfficerUpdate,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    officer = get_officer(db, officer_id)
    if not officer:
        raise HTTPException(status_code=404, detail="Officer not found")

    update_data = req.model_dump(exclude_unset=True)
    officer = update_officer(db, officer, **update_data)
    db.commit()
    db.refresh(officer)
    return officer


@router.delete(
    "/officers/{officer_id}",
    status_code=204,
    summary="Hard-delete a field officer",
    description=(
        "Permanently remove a field officer record from the database.  \n\n"
        "Field officers are not voters and carry no audit sensitivity, "
        "so a hard delete is permitted here.  "
        "Returns **204 No Content** on success and **404** if the officer does not exist."
    ),
    response_description="No content — officer successfully deleted.",
    responses={
        401: {"description": "Not authenticated."},
        404: {"description": "Officer not found."},
    },
)
async def delete_officer_endpoint(
    officer_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    officer = get_officer(db, officer_id)
    if not officer:
        raise HTTPException(status_code=404, detail="Officer not found")
    delete_officer(db, officer)
    db.commit()


@router.get(
    "/officers/{officer_id}/stats",
    summary="Get verification statistics for a field officer",
    description=(
        "Returns the total number of biometric verification attempts performed by this officer, "
        "broken down by result (`approved`, `manual_review`, `rejected`).  \n\n"
        "Counts are queried live from the `verification_attempts` table.  "
        "Returns **404** if the officer does not exist."
    ),
    response_description="Verification attempt counts for the officer.",
    responses={
        401: {"description": "Not authenticated."},
        404: {"description": "Officer not found."},
    },
)
async def officer_stats_endpoint(
    officer_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    officer = get_officer(db, officer_id)
    if not officer:
        raise HTTPException(status_code=404, detail="Officer not found")
    return officer_stats(db, officer_id)
