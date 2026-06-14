"""Demo script: Biometric verification."""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.core.db import SessionLocal
from app.db.models.voter import Voter
from app.db.models.biometric import BiometricTemplate
from app.core.enums import Modality
import json

def demo_verify():
    """
    Demo: Verify a voter's face 1:1.
    
    In practice, this would:
    1. POST /verifications with voter_token + live face image
    2. Extract live embedding
    3. Decrypt stored template
    4. Compute cosine similarity
    5. Check liveness
    6. Compute decision + explainability JSON
    7. Return VerificationAttempt with decision
    """
    
    print("🔄 Biometric Verification Demo")
    print("=" * 50)
    
    db = SessionLocal()
    
    try:
        # Find a voter with template
        voter = db.query(Voter).filter(Voter.voter_token == "RW-DEMO-ENROLL").first()
        if not voter:
            print("⚠️  No demo voter found. Run demo_enroll.py first.")
            return
        
        template = db.query(BiometricTemplate).filter(
            BiometricTemplate.voter_id == voter.id,
            BiometricTemplate.modality == Modality.face,
        ).first()
        
        if not template:
            print("⚠️  No biometric template for voter. Run enrollment first.")
            return
        
        print(f"🔍 Verifying: {voter.first_name} {voter.last_name}")
        print(f"   Voter Token: {voter.voter_token}")
        print(f"   Registration Ref: {voter.registration_ref}")
        print(f"   Status: {voter.status.value}")
        
        print("\n🔐 Verification process:")
        print("   1. Capture live face image from camera")
        print("   2. Extract live face embedding (InsightFace, 512-d)")
        print("   3. Decrypt stored template (AES-256-GCM)")
        print("   4. Compute cosine similarity (L2-normalized)")
        print("   5. Check liveness (passive anti-spoof)")
        print("   6. Compute decision:")
        print("      - confidence >= 0.80 → APPROVED")
        print("      - 0.60 <= confidence < 0.80 → MANUAL_REVIEW")
        print("      - confidence < 0.60 → REJECTED")
        
        print("\n📊 Decision Explainability JSON (example):")
        example_decision = {
            "decision": "approved",
            "confidence": 0.91,
            "threshold": 0.80,
            "breakdown": {
                "face_score": 0.94,
                "fingerprint_score": None,
                "liveness": "LIVE",
                "fusion_score": 0.91,
            },
            "flags": [],
            "explanation": "Strong face match with high liveness confidence.",
            "review_required": False,
        }
        print(json.dumps(example_decision, indent=2))
        
        print("\n✅ To actually verify, run:")
        print("   curl -X POST http://localhost:8000/verifications \\")
        print(f"     -H 'Content-Type: application/json' \\")
        print("     -d '{")
        print(f"       \"voter_token\": \"{voter.voter_token}\",")
        print("       \"polling_station_id\": \"<station-id>\",")
        print("       \"officer_id\": \"<officer-id>\",")
        print("       \"face_image\": \"<base64-image>\"")
        print("     }'")
        
    finally:
        db.close()


if __name__ == "__main__":
    demo_verify()
