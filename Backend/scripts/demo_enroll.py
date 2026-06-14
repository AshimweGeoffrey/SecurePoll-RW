"""Demo script: Biometric enrollment."""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.core.db import SessionLocal
from app.db.models.voter import Voter
from app.db.models.geography import District, PollingStation
from app.core.enums import Sex, VoterStatus
from datetime import date
import uuid

def demo_enroll():
    """
    Demo: Enroll a voter's face biometric.
    
    In practice, this would:
    1. POST /biometrics/enroll with voter_id + face image
    2. Extract face embedding (InsightFace)
    3. Check liveness (passive anti-spoof)
    4. Encrypt embedding
    5. Add to FAISS
    6. Store in DB
    """
    
    print("🔄 Biometric Enrollment Demo")
    print("=" * 50)
    
    db = SessionLocal()
    
    try:
        # Create a test voter if doesn't exist
        voter = db.query(Voter).filter(Voter.voter_token == "RW-DEMO-ENROLL").first()
        if not voter:
            print("📝 Creating test voter...")
            
            # Get or create district
            district = db.query(District).first()
            if not district:
                district = District(code="DEMO", name="Demo District", province="Kigali City")
                db.add(district)
                db.commit()
            
            # Get or create station
            station = db.query(PollingStation).filter(
                PollingStation.district_id == district.id
            ).first()
            if not station:
                station = PollingStation(
                    code="DEMO-PS",
                    name="Demo Polling Station",
                    district_id=district.id,
                )
                db.add(station)
                db.commit()
            
            # Create voter
            voter = Voter(
                voter_token="RW-DEMO-ENROLL",
                registration_ref="#DEMO001",
                national_id="1234567890DEMO",
                first_name="Demo",
                last_name="Voter",
                sex=Sex.male,
                date_of_birth=date(1990, 1, 1),
                district_id=district.id,
                polling_station_id=station.id,
                status=VoterStatus.registered,
            )
            db.add(voter)
            db.commit()
            print(f"✓ Voter created: {voter.voter_token}")
        
        print(f"\n📷 Enrolling biometric for: {voter.first_name} {voter.last_name}")
        print(f"   Voter ID: {voter.voter_token}")
        print(f"   Registration Ref: {voter.registration_ref}")
        
        print("\n🔐 Enrollment process:")
        print("   1. Capture face image from webcam")
        print("   2. Extract face embedding (InsightFace ArcFace, 512-d)")
        print("   3. Check liveness (passive anti-spoof detection)")
        print("   4. Encrypt embedding with AES-256-GCM")
        print("   5. Add to FAISS index for 1:N dedup")
        print("   6. Store encrypted template in DB")
        
        print("\n✅ To actually enroll, run:")
        print("   curl -X POST http://localhost:8000/biometrics/enroll \\")
        print(f"     -F 'voter_id={voter.id}' \\")
        print("     -F 'face_image=@/path/to/face.jpg'")
        
    finally:
        db.close()


if __name__ == "__main__":
    demo_enroll()
