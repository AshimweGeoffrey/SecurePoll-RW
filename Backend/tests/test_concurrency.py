"""Test concurrency with vote lock."""
import concurrent.futures
import time
from app.core.db import SessionLocal
from app.db.models.voter import Voter
from app.core.enums import VoterStatus
from sqlalchemy import select
import uuid

# This would be in a real test with fixtures
# For now, pseudo-code to explain the test

def cast_vote_concurrent(voter_id: uuid.UUID, officer_id: str):
    """Simulate vote casting (simplified)."""
    db = SessionLocal()
    try:
        # Lock voter row
        voter = db.execute(
            select(Voter).where(Voter.id == voter_id).with_for_update()
        ).scalar_one()
        
        if voter.status == VoterStatus.voted:
            return {"status": "FAILED", "reason": "Already voted"}
        
        # Mark voted
        voter.status = VoterStatus.voted
        db.commit()
        
        return {"status": "SUCCESS", "voter_id": str(voter_id)}
    
    except Exception as e:
        db.rollback()
        return {"status": "ERROR", "error": str(e)}
    finally:
        db.close()


def test_vote_lock_prevents_double_vote():
    """
    Test that concurrent vote attempts result in only one success.
    
    This proves row-level locking works correctly.
    """
    # Setup: create a voter
    db = SessionLocal()
    voter = Voter(
        voter_token="RW-TEST-LOCK",
        registration_ref="#LOCK001",
        national_id="1234567890LOCK",
        first_name="Concurrency",
        last_name="Test",
        sex="male",
        date_of_birth="1990-01-01",
        district_id="00000000-0000-0000-0000-000000000000",  # Placeholder
        polling_station_id="00000000-0000-0000-0000-000000000000",
    )
    db.add(voter)
    db.commit()
    voter_id = voter.id
    db.close()
    
    # Fire two concurrent vote-cast requests
    officer_id_1 = str(uuid.uuid4())
    officer_id_2 = str(uuid.uuid4())
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
        future_1 = executor.submit(cast_vote_concurrent, voter_id, officer_id_1)
        future_2 = executor.submit(cast_vote_concurrent, voter_id, officer_id_2)
        
        result_1 = future_1.result(timeout=5)
        result_2 = future_2.result(timeout=5)
    
    # Exactly one should succeed
    success_count = sum(1 for r in [result_1, result_2] if r["status"] == "SUCCESS")
    failed_count = sum(1 for r in [result_1, result_2] if r["status"] == "FAILED")
    
    assert success_count == 1, f"Expected 1 success, got {success_count}"
    assert failed_count == 1, f"Expected 1 failure, got {failed_count}"
    
    print("✅ Vote lock test passed!")
    print(f"  Request 1: {result_1['status']}")
    print(f"  Request 2: {result_2['status']}")
    print("  Proof: Row-level locking prevents double-voting")


if __name__ == "__main__":
    test_vote_lock_prevents_double_vote()
