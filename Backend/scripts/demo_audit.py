"""Demo script: Audit chain verification."""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.core.db import SessionLocal
from app.core.audit import verify_chain
from sqlalchemy import select, text
from app.db.models.audit import AuditEntry

def demo_audit_chain():
    """
    Demo: Verify the integrity of the audit chain.
    
    Shows:
    1. Current audit log state
    2. How to tamper with it (UPDATE directly)
    3. How tampering is detected (chain verification)
    """
    
    print("🔐 Audit Chain Integrity Demo")
    print("=" * 50)
    
    db = SessionLocal()
    
    try:
        # Get audit entry count
        count = db.query(AuditEntry).count()
        
        if count == 0:
            print("ℹ️  No audit entries yet. Run some operations to generate logs.")
            print("   Suggestions:")
            print("   - Login via /auth/login")
            print("   - Create/update a voter")
            print("   - Enroll a biometric")
            print("   - Verify a voter")
            return
        
        print(f"📊 Audit Log: {count} entries\n")
        
        # Show a few recent entries
        entries = db.query(AuditEntry).order_by(AuditEntry.sequence.desc()).limit(5).all()
        print("Recent entries (last 5):")
        for entry in reversed(entries):
            print(f"  [{entry.sequence}] {entry.occurred_at} | {entry.action.value} | {entry.detail[:40]}...")
        
        print(f"\n🔗 Chain Structure:")
        print(f"  Entry 1: entry_hash = SHA256(payload + 'begin')")
        print(f"  Entry 2: entry_hash = SHA256(payload + Entry1.entry_hash)")
        print(f"  Entry 3: entry_hash = SHA256(payload + Entry2.entry_hash)")
        print(f"  ...")
        print(f"  Entry {count}: entry_hash = SHA256(payload + Entry{count-1}.entry_hash)")
        
        print(f"\n✅ Verification Result:")
        result = verify_chain(db)
        print(f"  Entries walked: {result['entries_walked']}")
        print(f"  Breaks found: {result['breaks_found']}")
        if result['breaks_found'] == 0:
            print(f"  Status: ✓ CHAIN INTEGRITY VERIFIED")
        else:
            print(f"  Status: ✗ TAMPERING DETECTED at sequence {result['first_break_sequence']}")
        
        print(f"\n🔨 To test tampering detection:")
        print(f"\n  1. Connect to PostgreSQL:")
        print(f"     psql -U securepoll_app -d securepoll")
        print(f"\n  2. View the chain:")
        print(f"     SELECT sequence, detail, entry_hash FROM audit_entries ORDER BY sequence LIMIT 10;")
        print(f"\n  3. Tamper with an entry:")
        print(f"     UPDATE audit_entries SET detail = 'HACKED' WHERE sequence = 2;")
        print(f"\n  4. Run verification again:")
        print(f"     curl http://localhost:8000/audit:verify-chain")
        print(f"\n  5. Result: 'breaks_found': 1, 'first_break_sequence': 3")
        print(f"     (Because modifying Entry 2 invalidates Entry 3's hash)")
        
        print(f"\n📈 Database Hardening (for production):")
        print(f"  REVOKE UPDATE, DELETE ON audit_entries FROM securepoll_app;")
        print(f"  REVOKE UPDATE, DELETE ON SEQUENCE audit_entries_sequence_seq FROM securepoll_app;")
        print(f"\n  This prevents even app-level tampering.")
        
    finally:
        db.close()


if __name__ == "__main__":
    demo_audit_chain()
