"""Voters module - voter registry CRUD + CSV import."""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import select, or_, func
from datetime import datetime, timezone
import uuid
import csv
import io
from app.core.db import get_db
from app.core.audit import write_audit
from app.core.deps import get_current_user
from app.core.enums import AuditAction, ActorType, VoterStatus, Sex
from app.db.models.voter import Voter
from app.db.models.people import AdminUser
from app.db.models.geography import District, PollingStation
from app.schemas import VoterResponse, VoterCreate, VoterUpdate, VoterListResponse
from datetime import date

router = APIRouter(tags=["voters"])


@router.get("/voters", response_model=VoterListResponse)
async def list_voters(
    skip: int = 0,
    limit: int = 50,
    search: str = "",
    status: str = "",
    district: str = "",
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
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
    if status:
        query = query.where(Voter.status == status)
    if district:
        query = query.where(Voter.district_id == district)

    count_q = select(func.count()).select_from(query.subquery())
    total = db.execute(count_q).scalar()
    items = db.execute(query.offset(skip).limit(limit)).scalars().all()

    return VoterListResponse(
        total=total,
        page=skip // limit + 1,
        size=limit,
        items=items,
    )


@router.get("/voters/by-token/{voter_token}", response_model=VoterResponse)
async def get_voter_by_token(voter_token: str, db: Session = Depends(get_db),
                              current_user: AdminUser = Depends(get_current_user)):
    voter = db.execute(
        select(Voter).where(Voter.voter_token == voter_token)
    ).scalar_one_or_none()
    if not voter:
        raise HTTPException(status_code=404, detail="Voter not found")
    return voter


@router.get("/voters/{voter_id}", response_model=VoterResponse)
async def get_voter(voter_id: uuid.UUID, db: Session = Depends(get_db),
                    current_user: AdminUser = Depends(get_current_user)):
    voter = db.execute(select(Voter).where(Voter.id == voter_id)).scalar_one_or_none()
    if not voter:
        raise HTTPException(status_code=404, detail="Voter not found")
    return voter


@router.post("/voters", response_model=VoterResponse, status_code=201)
async def create_voter(req: VoterCreate, db: Session = Depends(get_db),
                       current_user: AdminUser = Depends(get_current_user)):
    if not db.execute(select(District).where(District.id == req.district_id)).scalar_one_or_none():
        raise HTTPException(status_code=400, detail="District not found")
    if not db.execute(select(PollingStation).where(PollingStation.id == req.polling_station_id)).scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Polling station not found")

    voter = Voter(**req.model_dump())
    db.add(voter)
    write_audit(db, action=AuditAction.RECORD_CREATED, actor_type=ActorType.user,
                actor_id=str(current_user.id), service="Voters",
                detail=f"Created: {req.registration_ref}")
    db.commit()
    db.refresh(voter)
    return voter


@router.patch("/voters/{voter_id}", response_model=VoterResponse)
async def update_voter(voter_id: uuid.UUID, req: VoterUpdate, db: Session = Depends(get_db),
                       current_user: AdminUser = Depends(get_current_user)):
    voter = db.execute(select(Voter).where(Voter.id == voter_id)).scalar_one_or_none()
    if not voter:
        raise HTTPException(status_code=404, detail="Voter not found")

    update_data = req.model_dump(exclude_unset=True)
    old_vals = {k: getattr(voter, k) for k in update_data}
    for k, v in update_data.items():
        setattr(voter, k, v)

    write_audit(db, action=AuditAction.ADDRESS_UPDATED, actor_type=ActorType.user,
                actor_id=str(current_user.id), service="Voters",
                detail=f"Updated: {voter.registration_ref}",
                change_diff=[{"field": k, "old": str(old_vals[k]), "new": str(v)} for k, v in update_data.items()])
    db.commit()
    db.refresh(voter)
    return voter


@router.post("/voters/{voter_id}:block")
async def block_voter(voter_id: uuid.UUID, reason: str, note: str = "",
                      db: Session = Depends(get_db),
                      current_user: AdminUser = Depends(get_current_user)):
    voter = db.execute(select(Voter).where(Voter.id == voter_id)).scalar_one_or_none()
    if not voter:
        raise HTTPException(status_code=404, detail="Voter not found")
    voter.status = VoterStatus.blocked
    write_audit(db, action=AuditAction.RECORD_BLOCKED, actor_type=ActorType.user,
                actor_id=str(current_user.id), service="Voters",
                detail=f"Blocked {voter.registration_ref}: {reason}")
    db.commit()
    return {"status": "blocked"}


@router.post("/voters/{voter_id}:archive")
async def archive_voter(voter_id: uuid.UUID, db: Session = Depends(get_db),
                        current_user: AdminUser = Depends(get_current_user)):
    voter = db.execute(select(Voter).where(Voter.id == voter_id)).scalar_one_or_none()
    if not voter:
        raise HTTPException(status_code=404, detail="Voter not found")
    voter.status = VoterStatus.archived
    write_audit(db, action=AuditAction.RECORD_ARCHIVED, actor_type=ActorType.user,
                actor_id=str(current_user.id), service="Voters",
                detail=f"Archived: {voter.registration_ref}")
    db.commit()
    return {"status": "archived"}


@router.post("/voters/{voter_id}:restore")
async def restore_voter(voter_id: uuid.UUID, db: Session = Depends(get_db),
                        current_user: AdminUser = Depends(get_current_user)):
    voter = db.execute(select(Voter).where(Voter.id == voter_id)).scalar_one_or_none()
    if not voter:
        raise HTTPException(status_code=404, detail="Voter not found")
    voter.status = VoterStatus.registered
    write_audit(db, action=AuditAction.STATUS_SYNCED, actor_type=ActorType.user,
                actor_id=str(current_user.id), service="Voters",
                detail=f"Restored: {voter.registration_ref}")
    db.commit()
    return {"status": "restored"}


@router.post("/voters:import")
async def import_voters(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    """Import voters from CSV. Expected columns: voter_token,registration_ref,national_id,first_name,
    last_name,sex,date_of_birth,phone,district_id,polling_station_id"""
    content = await file.read()
    reader = csv.DictReader(io.StringIO(content.decode()))
    added, flagged, rejected = 0, 0, 0

    for row in reader:
        try:
            dob_str = row.get("date_of_birth", "2000-01-01")
            dob = date.fromisoformat(dob_str)
            voter = Voter(
                voter_token=row["voter_token"],
                registration_ref=row["registration_ref"],
                national_id=row["national_id"],
                first_name=row["first_name"],
                last_name=row["last_name"],
                sex=Sex(row.get("sex", "male")),
                date_of_birth=dob,
                phone=row.get("phone"),
                district_id=uuid.UUID(row["district_id"]),
                polling_station_id=uuid.UUID(row["polling_station_id"]),
                status=VoterStatus.registered,
            )
            db.add(voter)
            added += 1
        except Exception:
            rejected += 1

    write_audit(db, action=AuditAction.RECORD_CREATED, actor_type=ActorType.user,
                actor_id=str(current_user.id), service="Voters",
                detail=f"CSV import: added={added}, rejected={rejected}")
    db.commit()
    return {"added": added, "flagged": flagged, "rejected": rejected}


@router.get("/voters:export")
async def export_voters(
    format: str = "csv",
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    voters = db.execute(select(Voter)).scalars().all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["voter_token", "registration_ref", "first_name", "last_name",
                     "sex", "date_of_birth", "status", "district_id", "polling_station_id"])
    for v in voters:
        writer.writerow([v.voter_token, v.registration_ref, v.first_name, v.last_name,
                         v.sex.value, v.date_of_birth, v.status.value,
                         str(v.district_id), str(v.polling_station_id)])

    write_audit(db, action=AuditAction.DATA_EXPORTED, actor_type=ActorType.user,
                actor_id=str(current_user.id), service="Voters",
                detail=f"Exported {len(voters)} voters as {format}")
    db.commit()

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=voters.csv"},
    )


@router.get("/registry/health")
async def registry_health(db: Session = Depends(get_db),
                           current_user: AdminUser = Depends(get_current_user)):
    total = db.execute(select(func.count(Voter.id))).scalar()
    registered = db.execute(
        select(func.count(Voter.id)).where(Voter.status == VoterStatus.registered)
    ).scalar()
    voted = db.execute(
        select(func.count(Voter.id)).where(Voter.status == VoterStatus.voted)
    ).scalar()
    flagged = db.execute(
        select(func.count(Voter.id)).where(Voter.status == VoterStatus.flagged)
    ).scalar()
    blocked = db.execute(
        select(func.count(Voter.id)).where(Voter.status == VoterStatus.blocked)
    ).scalar()

    return {
        "total_voters": total,
        "registered": registered,
        "voted": voted,
        "flagged": flagged,
        "blocked": blocked,
        "data_quality": "ok" if total > 0 else "empty",
    }
