"""Voters module."""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import select, or_
from datetime import datetime, timezone
import uuid
import csv
import io
from app.core.db import get_db
from app.core.audit import write_audit
from app.core.enums import AuditAction, ActorType, VoterStatus
from app.db.models.voter import Voter
from app.db.models.geography import District, PollingStation
from app.schemas import VoterResponse, VoterCreate, VoterUpdate, VoterListResponse

router = APIRouter(prefix="/voters", tags=["voters"])


@router.get("", response_model=VoterListResponse)
async def list_voters(
    skip: int = 0,
    limit: int = 50,
    search: str = "",
    status_filter: str = "",
    district: str = "",
    db: Session = Depends(get_db),
):
    """List voters with optional search/filter."""
    query = select(Voter)
    
    if search:
        query = query.where(
            or_(
                Voter.first_name.ilike(f"%{search}%"),
                Voter.last_name.ilike(f"%{search}%"),
                Voter.voter_token.ilike(f"%{search}%"),
                Voter.registration_ref.ilike(f"%{search}%"),
            )
        )
    
    if status_filter:
        query = query.where(Voter.status == status_filter)
    
    if district:
        query = query.where(Voter.district_id == district)
    
    total = db.execute(select(Voter.__table__.columns[0]).select_from(Voter)).rowcount
    items = db.execute(query.offset(skip).limit(limit)).scalars().all()
    
    return VoterListResponse(
        total=total,
        page=skip // limit + 1,
        size=limit,
        items=[VoterResponse.from_orm(v) for v in items],
    )


@router.get("/{voter_id}", response_model=VoterResponse)
async def get_voter(voter_id: uuid.UUID, db: Session = Depends(get_db)):
    """Get a voter by ID."""
    voter = db.execute(
        select(Voter).where(Voter.id == voter_id)
    ).scalar_one_or_none()
    
    if not voter:
        raise HTTPException(status_code=404, detail="Voter not found")
    
    return VoterResponse.from_orm(voter)


@router.get("/by-token/{voter_token}", response_model=VoterResponse)
async def get_voter_by_token(voter_token: str, db: Session = Depends(get_db)):
    """Get voter by token (QR scan)."""
    voter = db.execute(
        select(Voter).where(Voter.voter_token == voter_token)
    ).scalar_one_or_none()
    
    if not voter:
        raise HTTPException(status_code=404, detail="Voter not found")
    
    write_audit(
        db,
        action=AuditAction.TEMPLATE_ACCESSED,
        actor_type=ActorType.system,
        service="Voters",
        detail=f"Voter accessed by token: {voter_token}",
    )
    
    db.commit()
    return VoterResponse.from_orm(voter)


@router.post("", response_model=VoterResponse)
async def create_voter(req: VoterCreate, user_id: str, db: Session = Depends(get_db)):
    """Create a new voter."""
    # Verify district and station exist
    district = db.execute(select(District).where(District.id == req.district_id)).scalar_one_or_none()
    if not district:
        raise HTTPException(status_code=400, detail="District not found")
    
    station = db.execute(select(PollingStation).where(PollingStation.id == req.polling_station_id)).scalar_one_or_none()
    if not station:
        raise HTTPException(status_code=400, detail="Polling station not found")
    
    # Create voter
    voter = Voter(**req.dict())
    voter.enrolled_at = datetime.now(timezone.utc)
    
    write_audit(
        db,
        action=AuditAction.RECORD_CREATED,
        actor_type=ActorType.user,
        actor_id=user_id,
        service="Voters",
        detail=f"Voter created: {voter.registration_ref}",
    )
    
    db.add(voter)
    db.commit()
    db.refresh(voter)
    
    return VoterResponse.from_orm(voter)


@router.patch("/{voter_id}", response_model=VoterResponse)
async def update_voter(
    voter_id: uuid.UUID,
    req: VoterUpdate,
    user_id: str,
    db: Session = Depends(get_db),
):
    """Update a voter."""
    voter = db.execute(select(Voter).where(Voter.id == voter_id)).scalar_one_or_none()
    if not voter:
        raise HTTPException(status_code=404, detail="Voter not found")
    
    update_data = req.dict(exclude_unset=True)
    
    for key, value in update_data.items():
        setattr(voter, key, value)
    
    voter.last_activity_at = datetime.now(timezone.utc)
    
    write_audit(
        db,
        action=AuditAction.ADDRESS_UPDATED,
        actor_type=ActorType.user,
        actor_id=user_id,
        service="Voters",
        detail=f"Voter updated: {voter.registration_ref}",
        change_diff=[{"field": k, "new": v} for k, v in update_data.items()],
    )
    
    db.commit()
    db.refresh(voter)
    
    return VoterResponse.from_orm(voter)


@router.post("/{voter_id}:block")
async def block_voter(voter_id: uuid.UUID, reason: str, user_id: str, db: Session = Depends(get_db)):
    """Block a voter."""
    voter = db.execute(select(Voter).where(Voter.id == voter_id)).scalar_one_or_none()
    if not voter:
        raise HTTPException(status_code=404, detail="Voter not found")
    
    voter.status = VoterStatus.blocked
    
    write_audit(
        db,
        action=AuditAction.RECORD_BLOCKED,
        actor_type=ActorType.user,
        actor_id=user_id,
        service="Voters",
        detail=f"Voter blocked: {voter.registration_ref}. Reason: {reason}",
    )
    
    db.commit()
    return {"status": "blocked"}


@router.post("/{voter_id}:archive")
async def archive_voter(voter_id: uuid.UUID, user_id: str, db: Session = Depends(get_db)):
    """Archive a voter."""
    voter = db.execute(select(Voter).where(Voter.id == voter_id)).scalar_one_or_none()
    if not voter:
        raise HTTPException(status_code=404, detail="Voter not found")
    
    voter.status = VoterStatus.archived
    
    write_audit(
        db,
        action=AuditAction.RECORD_ARCHIVED,
        actor_type=ActorType.user,
        actor_id=user_id,
        service="Voters",
        detail=f"Voter archived: {voter.registration_ref}",
    )
    
    db.commit()
    return {"status": "archived"}


@router.post("/{voter_id}:restore")
async def restore_voter(voter_id: uuid.UUID, user_id: str, db: Session = Depends(get_db)):
    """Restore a voter."""
    voter = db.execute(select(Voter).where(Voter.id == voter_id)).scalar_one_or_none()
    if not voter:
        raise HTTPException(status_code=404, detail="Voter not found")
    
    voter.status = VoterStatus.registered
    
    write_audit(
        db,
        action=AuditAction.STATUS_SYNCED,
        actor_type=ActorType.user,
        actor_id=user_id,
        service="Voters",
        detail=f"Voter restored: {voter.registration_ref}",
    )
    
    db.commit()
    return {"status": "restored"}


@router.post("/:import")
async def import_voters(
    file: UploadFile = File(...),
    user_id: str = "",
    db: Session = Depends(get_db),
):
    """Import voters from CSV."""
    content = await file.read()
    reader = csv.DictReader(io.StringIO(content.decode()))
    
    added, rejected, flagged = 0, 0, 0
    
    for row in reader:
        try:
            voter = Voter(
                voter_token=row.get("voter_token", ""),
                registration_ref=row.get("registration_ref", ""),
                national_id=row.get("national_id", ""),
                first_name=row.get("first_name", ""),
                last_name=row.get("last_name", ""),
                sex=row.get("sex", "male"),
                date_of_birth=row.get("date_of_birth", "2000-01-01"),
                phone=row.get("phone"),
                district_id=row.get("district_id", ""),
                polling_station_id=row.get("polling_station_id", ""),
            )
            db.add(voter)
            added += 1
        except Exception as e:
            rejected += 1
    
    write_audit(
        db,
        action=AuditAction.RECORD_CREATED,
        actor_type=ActorType.user,
        actor_id=user_id,
        service="Voters",
        detail=f"CSV import: added={added}, rejected={rejected}, flagged={flagged}",
    )
    
    db.commit()
    return {"added": added, "rejected": rejected, "flagged": flagged}


@router.get("/:export")
async def export_voters(format: str = "csv", db: Session = Depends(get_db)):
    """Export voters."""
    # Stub
    return {"status": "export feature coming"}
