"""Concurrency test: proves row-level lock prevents double-voting."""
import concurrent.futures
import pytest
from sqlalchemy import select
from app.core.db import SessionLocal
from app.db.models.voter import Voter
from app.db.models.geography import District, PollingStation
from app.core.enums import VoterStatus, Sex
from app.core.audit import write_audit
from app.core.enums import AuditAction, ActorType
from datetime import date
import uuid


def _cast_vote(voter_id, officer_id):
    """One vote-cast attempt in its own session."""
    db = SessionLocal()
    try:
        voter = db.execute(
            select(Voter).where(Voter.id == voter_id).with_for_update()
        ).scalar_one()

        if voter.status == VoterStatus.voted:
            return {"status": "FAILED", "reason": "already voted"}

        voter.status = VoterStatus.voted
        write_audit(db, action=AuditAction.VOTER_VOTED, actor_type=ActorType.officer,
                    actor_id=str(officer_id), service="Test")
        db.commit()
        return {"status": "SUCCESS"}
    except Exception as e:
        db.rollback()
        return {"status": "ERROR", "error": str(e)}
    finally:
        db.close()


@pytest.fixture(scope="function")
def lock_test_voter():
    """Create a voter specifically for the concurrency test."""
    db = SessionLocal()
    try:
        # Minimal geography
        district = db.execute(
            select(District).where(District.code == "LOCK-TEST")
        ).scalar_one_or_none()
        if not district:
            district = District(code="LOCK-TEST", name="Lock District", province="Kigali City")
            db.add(district)
            db.flush()

        station = db.execute(
            select(PollingStation).where(PollingStation.code == "LOCK-PS")
        ).scalar_one_or_none()
        if not station:
            station = PollingStation(code="LOCK-PS", name="Lock Station", district_id=district.id)
            db.add(station)
            db.flush()

        voter = Voter(
            voter_token=f"RW-LOCK-{uuid.uuid4().hex[:8].upper()}",
            registration_ref=f"#LOCK{uuid.uuid4().hex[:4].upper()}",
            national_id=uuid.uuid4().hex[:16],
            first_name="Concurrency",
            last_name="Test",
            sex=Sex.male,
            date_of_birth=date(1990, 1, 1),
            district_id=district.id,
            polling_station_id=station.id,
            status=VoterStatus.registered,
        )
        db.add(voter)
        db.commit()
        voter_id = voter.id
        return voter_id
    finally:
        db.close()


def test_double_vote_lock(lock_test_voter):
    """
    Two simultaneous cast_vote calls on the same voter -> exactly one wins.
    This demonstrates that `SELECT ... FOR UPDATE` prevents double-voting.
    """
    voter_id = lock_test_voter
    o1, o2 = str(uuid.uuid4()), str(uuid.uuid4())

    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
        f1 = executor.submit(_cast_vote, voter_id, o1)
        f2 = executor.submit(_cast_vote, voter_id, o2)
        r1 = f1.result(timeout=10)
        r2 = f2.result(timeout=10)

    successes = [r for r in (r1, r2) if r["status"] == "SUCCESS"]
    failures = [r for r in (r1, r2) if r["status"] == "FAILED"]

    assert len(successes) == 1, f"Expected 1 success, got {len(successes)}. r1={r1} r2={r2}"
    assert len(failures) == 1, f"Expected 1 failure, got {len(failures)}. r1={r1} r2={r2}"

    # Verify DB state
    db = SessionLocal()
    try:
        voter = db.execute(select(Voter).where(Voter.id == voter_id)).scalar_one()
        assert voter.status == VoterStatus.voted
    finally:
        db.close()
