"""Seed the database with rich, realistic sample data for demo and evaluation.

Covers every table:
  roles, encryption_keys, districts, polling_stations, field_officers,
  admin_users, sessions, voters, biometric_templates, verification_attempts,
  fraud_cases, duplicate_matches, anomaly_signals, audit_entries
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

import random
import uuid
from datetime import datetime, timezone, date, timedelta

import numpy as np
from sqlalchemy import select

from app.core.db import engine, SessionLocal
from app.core.security import hash_password
from app.core.audit import write_audit
from app.core.enums import (
    Province, UserStatus, VoterStatus, Sex, Modality,
    AnomalySeverity, FraudType, RiskLevel, CaseResolution, DuplicateStatus,
    VerifyResult, Liveness, AuditAction, ActorType,
)
from app.db.models.base import Base
from app.db.models.geography import District, PollingStation
from app.db.models.people import Role, AdminUser, FieldOfficer, Session
from app.db.models.voter import Voter
from app.db.models.biometric import BiometricTemplate, EncryptionKey
from app.db.models.verification import VerificationAttempt
from app.db.models.fraud import AnomalySignal, FraudCase, DuplicateMatch
from app.db.models.audit import AuditEntry

# ---------------------------------------------------------------------------
# AES key: use env value if valid (64-char hex), otherwise fall back to test key
# ---------------------------------------------------------------------------
try:
    from app.core.crypto import encrypt_template
    # Quick validation — will raise if key length wrong
    encrypt_template(b"test")
    _USE_REAL_CRYPTO = True
except Exception:
    print("  [warn] TEMPLATE_AES_KEY not valid — using hardcoded test key for seeding")
    _USE_REAL_CRYPTO = False
    import os as _os
    from cryptography.hazmat.primitives.ciphers.aead import AESGCM

    def encrypt_template(template_blob: bytes) -> bytes:  # type: ignore[no-redef]
        key = bytes.fromhex('a' * 64)
        nonce = _os.urandom(12)
        cipher = AESGCM(key)
        return nonce + cipher.encrypt(nonce, template_blob, None)

random.seed(42)
np.random.seed(42)

# ---------------------------------------------------------------------------
# Wipe and recreate schema
# ---------------------------------------------------------------------------
print("Creating tables (drop_all + create_all)...")
from sqlalchemy import text

# Drop all tables with CASCADE to handle FK dependencies cleanly
with engine.begin() as conn:
    conn.execute(text("DROP TABLE IF EXISTS audit_entries CASCADE"))
    conn.execute(text("DROP TABLE IF EXISTS anomaly_signals CASCADE"))
    conn.execute(text("DROP TABLE IF EXISTS duplicate_matches CASCADE"))
    conn.execute(text("DROP TABLE IF EXISTS fraud_cases CASCADE"))
    conn.execute(text("DROP TABLE IF EXISTS verification_attempts CASCADE"))
    conn.execute(text("DROP TABLE IF EXISTS biometric_templates CASCADE"))
    conn.execute(text("DROP TABLE IF EXISTS encryption_keys CASCADE"))
    conn.execute(text("DROP TABLE IF EXISTS sessions CASCADE"))
    conn.execute(text("DROP TABLE IF EXISTS admin_users CASCADE"))
    conn.execute(text("DROP TABLE IF EXISTS field_officers CASCADE"))
    conn.execute(text("DROP TABLE IF EXISTS roles CASCADE"))
    conn.execute(text("DROP TABLE IF EXISTS voters CASCADE"))
    conn.execute(text("DROP TABLE IF EXISTS polling_stations CASCADE"))
    conn.execute(text("DROP TABLE IF EXISTS districts CASCADE"))
    conn.execute(text("DROP SEQUENCE IF EXISTS audit_seq CASCADE"))
    # Drop all leftover enum types (they survive table drops)
    conn.execute(text("""
        DO $$ DECLARE r RECORD;
        BEGIN
            FOR r IN SELECT typname FROM pg_type
                     WHERE typtype='e'
                     AND typnamespace=(SELECT oid FROM pg_namespace WHERE nspname='public')
            LOOP
                EXECUTE 'DROP TYPE IF EXISTS ' || quote_ident(r.typname) || ' CASCADE';
            END LOOP;
        END $$;
    """))

Base.metadata.create_all(bind=engine)

db = SessionLocal()

try:
    # -----------------------------------------------------------------------
    # 1. Roles
    # -----------------------------------------------------------------------
    print("Seeding roles...")
    roles_data = [
        {"id": "super",    "name": "Super Admin",  "permissions": ["registry", "verify", "fraud", "audit", "users", "keys"]},
        {"id": "auditor",  "name": "Auditor",       "permissions": ["fraud", "audit", "registry"]},
        {"id": "officer",  "name": "Field Officer", "permissions": ["verify", "registry"]},
        {"id": "observer", "name": "Observer",      "permissions": []},
        {"id": "support",  "name": "Support",       "permissions": ["registry"]},
    ]
    for rd in roles_data:
        if not db.execute(select(Role).where(Role.id == rd["id"])).scalar_one_or_none():
            db.add(Role(**rd))
    db.commit()
    print(f"  ✓ {len(roles_data)} roles")

    # -----------------------------------------------------------------------
    # 2. Encryption keys
    # -----------------------------------------------------------------------
    print("Seeding encryption keys...")
    enc_keys_data = [
        {"title": "Face Template Key v1",        "algorithm": "AES-256-GCM", "scope": "face",        "current_version": 1},
        {"title": "Fingerprint Template Key v1", "algorithm": "AES-256-GCM", "scope": "fingerprint", "current_version": 1},
        {"title": "Archive Key v1",              "algorithm": "AES-256-GCM", "scope": "archive",     "current_version": 1},
    ]
    enc_key_objects = []
    for ekd in enc_keys_data:
        ek = EncryptionKey(**ekd)
        db.add(ek)
        enc_key_objects.append(ek)
    db.flush()
    db.commit()
    face_key = enc_key_objects[0]
    print(f"  ✓ {len(enc_key_objects)} encryption keys")

    # -----------------------------------------------------------------------
    # 3. Districts (30 real Rwanda districts)
    # -----------------------------------------------------------------------
    print("Seeding districts...")
    districts_raw = [
        # Kigali City
        ("KGL-GAS", "Gasabo",       Province.kigali),
        ("KGL-KIC", "Kicukiro",     Province.kigali),
        ("KGL-NYA", "Nyarugenge",   Province.kigali),
        # Northern
        ("NOR-BUR", "Burera",       Province.northern),
        ("NOR-GIC", "Gicumbi",      Province.northern),
        ("NOR-MUS", "Musanze",      Province.northern),
        ("NOR-RUL", "Rulindo",      Province.northern),
        ("NOR-GAK", "Gakenke",      Province.northern),
        # Southern
        ("SOU-BUG", "Bugesera",     Province.southern),
        ("SOU-GIS", "Gisagara",     Province.southern),
        ("SOU-HUY", "Huye",         Province.southern),
        ("SOU-KAM", "Kamonyi",      Province.southern),
        ("SOU-MUH", "Muhanga",      Province.southern),
        ("SOU-NYA", "Nyamagabe",    Province.southern),
        ("SOU-NYC", "Nyanza",       Province.southern),
        ("SOU-NYR", "Nyaruguru",    Province.southern),
        ("SOU-RUH", "Ruhango",      Province.southern),
        # Eastern
        ("EAS-GAT", "Gatsibo",      Province.eastern),
        ("EAS-KAY", "Kayonza",      Province.eastern),
        ("EAS-KIR", "Kirehe",       Province.eastern),
        ("EAS-NGO", "Ngoma",        Province.eastern),
        ("EAS-NGA", "Ngororero",    Province.eastern),
        ("EAS-RWA", "Rwamagana",    Province.eastern),
        # Western
        ("WES-KAR", "Karongi",      Province.western),
        ("WES-NYB", "Nyabihu",      Province.western),
        ("WES-NYA", "Nyamasheke",   Province.western),
        ("WES-RUB", "Rubavu",       Province.western),
        ("WES-RUS", "Rusizi",       Province.western),
        ("WES-RUT", "Rutsiro",      Province.western),
        ("WES-NGR", "Ngororero",    Province.western),
    ]
    district_map: dict[str, District] = {}
    for code, name, province in districts_raw:
        d = db.execute(select(District).where(District.code == code)).scalar_one_or_none()
        if not d:
            d = District(code=code, name=name, province=province)
            db.add(d)
            db.flush()
        district_map[code] = d
    db.commit()
    print(f"  ✓ {len(district_map)} districts")

    # -----------------------------------------------------------------------
    # 4. Polling stations (3 per district = 90)
    # -----------------------------------------------------------------------
    print("Seeding polling stations...")
    station_map: dict[str, PollingStation] = {}
    ps_count = 0
    for dist_code, district in district_map.items():
        for i in range(3):
            ps_code = f"PS-{dist_code}-{i+1:02d}"
            st = db.execute(select(PollingStation).where(PollingStation.code == ps_code)).scalar_one_or_none()
            if not st:
                st = PollingStation(
                    code=ps_code,
                    name=f"{district.name} Station {i+1}",
                    district_id=district.id,
                    lat=-1.9 + (ps_count * 0.003),
                    lon=29.8 + (ps_count * 0.003),
                    opens_at="06:00:00",
                    closes_at="18:00:00",
                )
                db.add(st)
                db.flush()
                ps_count += 1
            station_map[ps_code] = st
    db.commit()
    print(f"  ✓ {ps_count} polling stations")

    # -----------------------------------------------------------------------
    # 5. Field officers (15)
    # -----------------------------------------------------------------------
    print("Seeding field officers...")
    officer_data = [
        ("John Mugisha",        "Alpha"),
        ("Alice Uwineza",       "Alpha"),
        ("Peter Habimana",      "Bravo"),
        ("Marie Kalindi",       "Bravo"),
        ("James Niyigena",      "Charlie"),
        ("Grace Uwimana",       "Charlie"),
        ("Patrick Nkurunziza",  "Delta"),
        ("Diane Mukagatare",    "Delta"),
        ("Eric Nsabimana",      "Alpha"),
        ("Solange Mukeshimana", "Bravo"),
        ("Claude Bizimana",     "Charlie"),
        ("Ange Uwase",          "Delta"),
        ("Samuel Gatete",       "Alpha"),
        ("Francine Mukandori",  "Bravo"),
        ("Joseph Ntawukuliryayo", "Charlie"),
    ]
    all_district_ids = [d.id for d in district_map.values()]
    officers: list[FieldOfficer] = []
    for idx, (name, team) in enumerate(officer_data):
        fo = FieldOfficer(
            name=name,
            team=team,
            assigned_district_id=all_district_ids[idx % len(all_district_ids)],
        )
        db.add(fo)
        officers.append(fo)
    db.flush()
    db.commit()
    print(f"  ✓ {len(officers)} field officers")

    # -----------------------------------------------------------------------
    # 6. Admin users (5, one per role)
    # -----------------------------------------------------------------------
    print("Seeding admin users...")
    admins_data = [
        ("System Admin",        "admin@securepoll.rw",      "SecurePassword123!",  "super",    "National",    True),
        ("Audit Officer",       "auditor@securepoll.rw",    "AuditPass123!",       "auditor",  "National",    False),
        ("Field Supervisor",    "officer@securepoll.rw",    "OfficerPass123!",     "officer",  "Kigali City", False),
        ("Observer General",    "observer@securepoll.rw",   "ObserverPass123!",    "observer", "National",    False),
        ("Support Agent",       "support@securepoll.rw",    "SupportPass123!",     "support",  "Eastern",     False),
    ]
    admin_users: list[AdminUser] = []
    for full_name, email, password, role_id, scope, mfa in admins_data:
        u = db.execute(select(AdminUser).where(AdminUser.email == email)).scalar_one_or_none()
        if not u:
            u = AdminUser(
                full_name=full_name,
                email=email,
                password_hash=hash_password(password),
                role_id=role_id,
                district_scope=scope,
                status=UserStatus.active,
                mfa_enabled=mfa,
                last_active_at=datetime.now(timezone.utc) - timedelta(hours=random.randint(1, 48)),
            )
            db.add(u)
        admin_users.append(u)
    db.flush()
    db.commit()
    # Re-query so we have real objects with IDs
    admin_users = db.execute(select(AdminUser)).scalars().all()
    print(f"  ✓ {len(admin_users)} admin users")

    # -----------------------------------------------------------------------
    # 7. Sessions (3 per admin user = 15)
    # -----------------------------------------------------------------------
    print("Seeding sessions...")
    devices = [
        "Chrome 119 on Windows 11",
        "Safari 17 on macOS Sonoma",
        "Firefox 120 on Ubuntu 22.04",
        "Edge 119 on Windows 10",
        "Chrome 118 on Android 14",
    ]
    locations = [
        "Kigali, Rwanda",
        "Musanze, Rwanda",
        "Huye, Rwanda",
        "Rubavu, Rwanda",
        "Rwamagana, Rwanda",
    ]
    ips = [
        "197.157.83.14", "102.22.45.100", "41.186.234.7",
        "196.27.0.55",   "41.75.198.230",
    ]
    session_count = 0
    for admin in admin_users:
        for j in range(3):
            now = datetime.now(timezone.utc)
            last_active = now - timedelta(minutes=random.randint(5, 1440))
            revoked = last_active + timedelta(hours=random.randint(2, 8)) if j == 2 else None
            s = Session(
                user_id=admin.id,
                device=devices[(j + admin_users.index(admin)) % len(devices)],
                ip_address=ips[j % len(ips)],
                location=locations[j % len(locations)],
                last_active_at=last_active,
                revoked_at=revoked,
            )
            db.add(s)
            session_count += 1
    db.commit()
    print(f"  ✓ {session_count} sessions")

    # -----------------------------------------------------------------------
    # 8. Voters (20 per district = 600)
    # -----------------------------------------------------------------------
    print("Seeding voters...")
    first_names_m = ["Jean", "Pierre", "Francois", "Emmanuel", "Claude", "Patrick",
                     "Samuel", "Eric", "Joseph", "Alexis"]
    first_names_f = ["Marie", "Jeanine", "Grace", "Diane", "Ange", "Solange",
                     "Francine", "Claudine", "Odette", "Esperance"]
    last_names = [
        "Kagame", "Mutabazi", "Nyarwaya", "Karugaba", "Mukandayire",
        "Habimana", "Niyonzima", "Uwimana", "Nkurunziza", "Bizimana",
        "Nsabimana", "Gatete", "Mukeshimana", "Uwase", "Ndayishimiye",
    ]
    stations_list = list(station_map.values())

    voter_count = 0
    all_voters: list[Voter] = []
    for dist_idx, (dist_code, district) in enumerate(district_map.items()):
        stations = [v for k, v in station_map.items() if k.startswith(f"PS-{dist_code}-")]
        if not stations:
            continue
        for i in range(20):
            is_female = i % 2 == 0
            fname = (first_names_f if is_female else first_names_m)[i % 10]
            lname = last_names[i % len(last_names)]
            nid_raw = f"1{dist_idx:02d}{voter_count:013d}"
            v = Voter(
                voter_token=f"RW-2026-{dist_code[:3]}{i:04d}-{voter_count:04X}",
                registration_ref=f"#{100000 + voter_count}",
                national_id=nid_raw,
                first_name=fname,
                last_name=lname,
                sex=Sex.female if is_female else Sex.male,
                date_of_birth=date(1960 + (voter_count % 45), (i % 12) + 1, (i % 28) + 1),
                phone=f"+250788{voter_count:06d}",
                district_id=district.id,
                polling_station_id=stations[i % len(stations)].id,
                roll_position=i + 1,
                status=VoterStatus.registered,
                data_quality_score=75 + random.randint(0, 24),
                enrolled_at=datetime.now(timezone.utc) - timedelta(days=random.randint(30, 365)),
                enrolled_by_officer_id=officers[voter_count % len(officers)].id,
            )
            db.add(v)
            all_voters.append(v)
            voter_count += 1

    db.flush()
    db.commit()
    print(f"  ✓ {voter_count} voters")

    # -----------------------------------------------------------------------
    # 9. Biometric templates (1 per voter = 600, batches of 50)
    # -----------------------------------------------------------------------
    print("Seeding biometric templates...")
    all_voter_ids = [v.id for v in db.execute(select(Voter)).scalars().all()]
    face_key_id = face_key.id

    template_count = 0
    batch: list[BiometricTemplate] = []
    voter_embeddings: dict[uuid.UUID, np.ndarray] = {}  # store for duplicate matching later

    for faiss_idx, voter_id in enumerate(all_voter_ids):
        # Generate a random 512-d float32 unit-vector embedding
        emb = np.random.randn(512).astype(np.float32)
        emb = emb / np.linalg.norm(emb)
        voter_embeddings[voter_id] = emb

        template_blob = encrypt_template(emb.tobytes())
        quality = round(random.uniform(0.75, 0.99), 4)
        liveness = random.random() < 0.95  # 95% liveness pass

        bt = BiometricTemplate(
            voter_id=voter_id,
            modality=Modality.face,
            template_blob=template_blob,
            quality_score=quality,
            liveness_passed=liveness,
            captured_at=datetime.now(timezone.utc) - timedelta(days=random.randint(30, 365)),
            device_id=f"CAM-{random.randint(1000, 9999)}",
            key_id=face_key_id,
            faiss_id=faiss_idx,
        )
        batch.append(bt)
        template_count += 1

        if len(batch) == 50:
            db.add_all(batch)
            db.flush()
            batch.clear()
        if template_count % 100 == 0:
            print(f"    ... {template_count} templates generated")

    if batch:
        db.add_all(batch)
        db.flush()
    db.commit()
    print(f"  ✓ {template_count} biometric templates")

    # -----------------------------------------------------------------------
    # 10. Verification attempts (400 attempts for 400 of the 600 voters)
    # -----------------------------------------------------------------------
    print("Seeding verification attempts...")
    # Pick 400 voters to have been verified
    verified_voter_ids = random.sample(all_voter_ids, 400)
    officer_ids = [o.id for o in officers]
    station_ids = list(station_map.values())

    attempt_count = 0
    attempt_batch: list[VerificationAttempt] = []

    # Mark voters as voted for approved ones
    voted_voter_ids: list[uuid.UUID] = []

    for voter_id in verified_voter_ids:
        rng = random.random()
        if rng < 0.85:
            result = VerifyResult.approved
            confidence = round(random.uniform(0.82, 0.99), 4)
            face_score = round(random.uniform(0.80, 0.99), 4)
            liveness = Liveness.live
            review_required = False
            flags: list = []
            voted_voter_ids.append(voter_id)
        elif rng < 0.95:
            result = VerifyResult.manual_review
            confidence = round(random.uniform(0.60, 0.81), 4)
            face_score = round(random.uniform(0.55, 0.79), 4)
            liveness = Liveness.live
            review_required = True
            flags = ["LOW_CONFIDENCE"]
        else:
            result = VerifyResult.rejected
            confidence = round(random.uniform(0.10, 0.55), 4)
            face_score = round(random.uniform(0.10, 0.50), 4)
            liveness = random.choice([Liveness.spoof, Liveness.failed])
            review_required = False
            flags = ["LIVENESS_FAIL", "LOW_SCORE"]

        station_obj = random.choice(station_ids)
        va = VerificationAttempt(
            voter_id=voter_id,
            polling_station_id=station_obj.id,
            officer_id=random.choice(officer_ids),
            device_id=f"DEV-{random.randint(100, 999)}",
            result=result,
            confidence=confidence,
            face_score=face_score,
            liveness=liveness,
            review_required=review_required,
            explanation=None if result == VerifyResult.approved else f"Score below threshold ({face_score:.2f})",
            flags=flags,
        )
        attempt_batch.append(va)
        attempt_count += 1

    db.add_all(attempt_batch)
    db.flush()

    # Bulk-update voted voters' status (avoids N+1 individual SELECTs)
    from sqlalchemy import update as sa_update
    if voted_voter_ids:
        voted_at = datetime.now(timezone.utc) - timedelta(hours=2)
        db.execute(
            sa_update(Voter)
            .where(Voter.id.in_(voted_voter_ids))
            .values(
                status=VoterStatus.voted,
                last_verified_at=voted_at,
                last_activity_at=voted_at,
            )
            .execution_options(synchronize_session="fetch")
        )

    db.commit()
    approved_count = len(voted_voter_ids)
    print(f"  ✓ {attempt_count} verification attempts ({approved_count} approved/voted)")

    # -----------------------------------------------------------------------
    # 11. Fraud cases (8 cases)
    # -----------------------------------------------------------------------
    print("Seeding fraud cases...")

    # Get a few voter_ids and station_ids for linking
    sample_voter_ids = random.sample(all_voter_ids, min(8, len(all_voter_ids)))
    sample_station_ids = [random.choice(station_ids).id for _ in range(8)]

    fraud_cases_data = [
        {
            "id": "FR-0001",
            "type": FraudType.duplicate,
            "title": "Duplicate biometric detected at enrollment",
            "risk_level": RiskLevel.critical,
            "voter_id": sample_voter_ids[0],
            "registration_ref": "#100001",
            "polling_station_id": sample_station_ids[0],
            "detected_by": "1:N de-duplication (FAISS)",
            "face_score": 0.97,
            "opened_at": datetime.now(timezone.utc) - timedelta(days=5),
            "resolved_at": None,
            "resolution": None,
            "similarity": 0.97,
            "duplicate_of_registration_ref": "#100050",
            "breakdown": [
                {"label": "Face similarity", "value": "0.97"},
                {"label": "Threshold", "value": "0.85"},
            ],
            "timeline": [
                {"time": (datetime.now(timezone.utc) - timedelta(days=5)).isoformat(),
                 "event": "Duplicate flag raised by FAISS dedup pipeline"},
            ],
            "assessment": {"risk": "critical", "recommendation": "Block second registration; manual review required"},
        },
        {
            "id": "FR-0002",
            "type": FraudType.duplicate,
            "title": "Same face registered under two national IDs",
            "risk_level": RiskLevel.critical,
            "voter_id": sample_voter_ids[1],
            "registration_ref": "#100120",
            "polling_station_id": sample_station_ids[1],
            "detected_by": "Scheduled overnight dedup scan",
            "face_score": 0.93,
            "opened_at": datetime.now(timezone.utc) - timedelta(days=10),
            "resolved_at": datetime.now(timezone.utc) - timedelta(days=8),
            "resolution": CaseResolution.merged,
            "similarity": 0.93,
            "duplicate_of_registration_ref": "#100200",
            "breakdown": [
                {"label": "Face similarity", "value": "0.93"},
                {"label": "Threshold", "value": "0.85"},
            ],
            "timeline": [
                {"time": (datetime.now(timezone.utc) - timedelta(days=10)).isoformat(),
                 "event": "Duplicate detected during batch dedup"},
                {"time": (datetime.now(timezone.utc) - timedelta(days=8)).isoformat(),
                 "event": "Records merged by auditor@securepoll.rw"},
            ],
            "assessment": {"risk": "critical", "recommendation": "Merge records; notify NEC"},
        },
        {
            "id": "FR-0003",
            "type": FraudType.duplicate,
            "title": "Near-duplicate embedding cluster (3 voters)",
            "risk_level": RiskLevel.review,
            "voter_id": sample_voter_ids[2],
            "registration_ref": "#100300",
            "polling_station_id": sample_station_ids[2],
            "detected_by": "Clustering anomaly detector",
            "face_score": 0.88,
            "opened_at": datetime.now(timezone.utc) - timedelta(days=3),
            "resolved_at": None,
            "resolution": None,
            "similarity": 0.88,
            "duplicate_of_registration_ref": None,
            "breakdown": [
                {"label": "Cluster size", "value": "3"},
                {"label": "Max similarity", "value": "0.88"},
            ],
            "timeline": [
                {"time": (datetime.now(timezone.utc) - timedelta(days=3)).isoformat(),
                 "event": "Cluster of 3 suspiciously similar embeddings flagged"},
            ],
            "assessment": {"risk": "review", "recommendation": "Manual identity verification required"},
        },
        {
            "id": "FR-0004",
            "type": FraudType.duplicate,
            "title": "Possible twin registration — high similarity score",
            "risk_level": RiskLevel.review,
            "voter_id": sample_voter_ids[3],
            "registration_ref": "#100450",
            "polling_station_id": sample_station_ids[3],
            "detected_by": "Real-time verification pipeline",
            "face_score": 0.86,
            "opened_at": datetime.now(timezone.utc) - timedelta(days=1),
            "resolved_at": datetime.now(timezone.utc) - timedelta(hours=6),
            "resolution": CaseResolution.dismissed,
            "similarity": 0.86,
            "duplicate_of_registration_ref": "#100451",
            "breakdown": [
                {"label": "Face similarity", "value": "0.86"},
                {"label": "ID match", "value": "No"},
            ],
            "timeline": [
                {"time": (datetime.now(timezone.utc) - timedelta(days=1)).isoformat(),
                 "event": "High-similarity match triggered case creation"},
                {"time": (datetime.now(timezone.utc) - timedelta(hours=6)).isoformat(),
                 "event": "Confirmed twins — case dismissed"},
            ],
            "assessment": {"risk": "low", "recommendation": "Dismissed — confirmed biological twins"},
        },
        {
            "id": "FR-0005",
            "type": FraudType.impersonation,
            "title": "Voter attempted to verify with another person's ID",
            "risk_level": RiskLevel.critical,
            "voter_id": sample_voter_ids[4],
            "registration_ref": "#100500",
            "polling_station_id": sample_station_ids[4],
            "detected_by": "Live verification — face mismatch",
            "face_score": 0.28,
            "opened_at": datetime.now(timezone.utc) - timedelta(hours=14),
            "resolved_at": None,
            "resolution": None,
            "similarity": None,
            "duplicate_of_registration_ref": None,
            "breakdown": [
                {"label": "Face score", "value": "0.28"},
                {"label": "Threshold", "value": "0.80"},
                {"label": "Liveness", "value": "Live"},
            ],
            "timeline": [
                {"time": (datetime.now(timezone.utc) - timedelta(hours=14)).isoformat(),
                 "event": "Verification rejected — face score 0.28 (threshold 0.80)"},
                {"time": (datetime.now(timezone.utc) - timedelta(hours=13)).isoformat(),
                 "event": "Officer flagged for security review"},
            ],
            "assessment": {"risk": "critical", "recommendation": "Detain and refer to NEC security team"},
        },
        {
            "id": "FR-0006",
            "type": FraudType.impersonation,
            "title": "Spoofed liveness check using printed photo",
            "risk_level": RiskLevel.critical,
            "voter_id": sample_voter_ids[5],
            "registration_ref": "#100600",
            "polling_station_id": sample_station_ids[5],
            "detected_by": "Anti-spoofing model v2",
            "face_score": 0.91,
            "opened_at": datetime.now(timezone.utc) - timedelta(days=2),
            "resolved_at": datetime.now(timezone.utc) - timedelta(days=1),
            "resolution": CaseResolution.escalated,
            "similarity": None,
            "duplicate_of_registration_ref": None,
            "breakdown": [
                {"label": "Face score", "value": "0.91 (high — stolen template)"},
                {"label": "Liveness", "value": "SPOOF (printed photo)"},
            ],
            "timeline": [
                {"time": (datetime.now(timezone.utc) - timedelta(days=2)).isoformat(),
                 "event": "Liveness model detected paper/print artifact"},
                {"time": (datetime.now(timezone.utc) - timedelta(days=1)).isoformat(),
                 "event": "Escalated to National Electoral Commission"},
            ],
            "assessment": {"risk": "critical", "recommendation": "Escalated — possible organised fraud ring"},
        },
        {
            "id": "FR-0007",
            "type": FraudType.forgery,
            "title": "Suspected forged national ID document",
            "risk_level": RiskLevel.review,
            "voter_id": sample_voter_ids[6],
            "registration_ref": "#100700",
            "polling_station_id": sample_station_ids[6],
            "detected_by": "Document verification integration",
            "face_score": None,
            "opened_at": datetime.now(timezone.utc) - timedelta(days=7),
            "resolved_at": datetime.now(timezone.utc) - timedelta(days=5),
            "resolution": CaseResolution.dismissed,
            "similarity": None,
            "duplicate_of_registration_ref": None,
            "breakdown": [
                {"label": "ID check result", "value": "FAIL — MRZ mismatch"},
                {"label": "Biometric match", "value": "0.89 (OK)"},
            ],
            "timeline": [
                {"time": (datetime.now(timezone.utc) - timedelta(days=7)).isoformat(),
                 "event": "Document check failed — MRZ zone inconsistency"},
                {"time": (datetime.now(timezone.utc) - timedelta(days=5)).isoformat(),
                 "event": "Physical review: printing artefact, not forgery — dismissed"},
            ],
            "assessment": {"risk": "low", "recommendation": "Dismissed — document damage not forgery"},
        },
        {
            "id": "FR-0008",
            "type": FraudType.anomaly,
            "title": "Unusual surge of verifications from single device",
            "risk_level": RiskLevel.review,
            "voter_id": None,
            "registration_ref": None,
            "polling_station_id": sample_station_ids[7],
            "detected_by": "Rate-limiting anomaly detector",
            "face_score": None,
            "opened_at": datetime.now(timezone.utc) - timedelta(hours=4),
            "resolved_at": None,
            "resolution": None,
            "similarity": None,
            "duplicate_of_registration_ref": None,
            "breakdown": [
                {"label": "Verifications in 10 min", "value": "47 (threshold: 15)"},
                {"label": "Device ID", "value": "DEV-441"},
            ],
            "timeline": [
                {"time": (datetime.now(timezone.utc) - timedelta(hours=4)).isoformat(),
                 "event": "Rate anomaly detected on device DEV-441"},
            ],
            "assessment": {"risk": "review", "recommendation": "Inspect device DEV-441 and suspend pending investigation"},
        },
    ]

    for fcd in fraud_cases_data:
        if not db.execute(select(FraudCase).where(FraudCase.id == fcd["id"])).scalar_one_or_none():
            db.add(FraudCase(**fcd))
    db.commit()
    print(f"  ✓ {len(fraud_cases_data)} fraud cases")

    # -----------------------------------------------------------------------
    # 12. Duplicate matches (5 pairs)
    # -----------------------------------------------------------------------
    print("Seeding duplicate matches...")

    # Build 5 pairs with artificially high similarity (tweak embeddings slightly)
    dup_voter_ids = random.sample(all_voter_ids, 10)  # 10 voters → 5 pairs
    dup_pairs = [(dup_voter_ids[i], dup_voter_ids[i + 5]) for i in range(5)]
    dup_statuses = [
        DuplicateStatus.pending,
        DuplicateStatus.pending,
        DuplicateStatus.merged,
        DuplicateStatus.dismissed,
        DuplicateStatus.pending,
    ]
    super_admin = next((u for u in admin_users if u.role_id == "super"), admin_users[0])
    dup_count = 0
    for idx, ((a_id, b_id), status) in enumerate(zip(dup_pairs, dup_statuses)):
        similarity = round(random.uniform(0.86, 0.98), 4)
        resolved_at = (datetime.now(timezone.utc) - timedelta(hours=random.randint(2, 48))
                       if status != DuplicateStatus.pending else None)
        dm = DuplicateMatch(
            record_a_id=a_id,
            record_b_id=b_id,
            similarity=similarity,
            status=status,
            merged_into_id=a_id if status == DuplicateStatus.merged else None,
            resolved_by_user_id=super_admin.id if status != DuplicateStatus.pending else None,
            resolved_at=resolved_at,
        )
        db.add(dm)
        dup_count += 1
    db.commit()
    print(f"  ✓ {dup_count} duplicate matches")

    # -----------------------------------------------------------------------
    # 13. Anomaly signals (6)
    # -----------------------------------------------------------------------
    print("Seeding anomaly signals...")
    anomaly_data = [
        {
            "id": "AN-01",
            "severity": AnomalySeverity.critical,
            "title": "Verification rate spike at Gasabo Station 1",
            "description": "Verifications per hour 3x above baseline — possible coordinated attempt",
            "signal_name": "verifications_per_hour",
            "baseline": 45.0, "observed": 142.0, "unit": "verifications/hr",
            "recommendation": "Deploy additional officers to Gasabo Station 1; inspect device logs",
            "status": "active",
            "is_live": True,
            "affected_entities": ["PS-KGL-GAS-01", "DEV-441"],
            "related_case_id": "FR-0008",
            "detected_at": datetime.now(timezone.utc) - timedelta(hours=4),
        },
        {
            "id": "AN-02",
            "severity": AnomalySeverity.warning,
            "title": "Low face-match confidence cluster at Kicukiro Station 2",
            "description": "8 consecutive rejections — possible lighting or camera issue",
            "signal_name": "consecutive_rejections",
            "baseline": 1.0, "observed": 8.0, "unit": "count",
            "recommendation": "Check lighting conditions and camera calibration at station",
            "status": "acknowledged",
            "is_live": True,
            "affected_entities": ["PS-KGL-KIC-02"],
            "related_case_id": None,
            "detected_at": datetime.now(timezone.utc) - timedelta(hours=2),
        },
        {
            "id": "AN-03",
            "severity": AnomalySeverity.info,
            "title": "Above-average data quality in Eastern Province",
            "description": "Eastern province voters average 94% quality vs 85% national baseline",
            "signal_name": "data_quality_score",
            "baseline": 85.0, "observed": 94.0, "unit": "score",
            "recommendation": "No action required — positive signal",
            "status": "muted",
            "is_live": False,
            "affected_entities": [],
            "related_case_id": None,
            "detected_at": datetime.now(timezone.utc) - timedelta(days=1),
        },
        {
            "id": "AN-04",
            "severity": AnomalySeverity.critical,
            "title": "Two spoofed liveness attempts within 30 minutes",
            "description": "Anti-spoofing model flagged two paper-photo attacks at same station",
            "signal_name": "liveness_spoof_rate",
            "baseline": 0.0, "observed": 2.0, "unit": "count/30min",
            "recommendation": "Escalate to NEC security team immediately",
            "status": "active",
            "is_live": True,
            "affected_entities": ["PS-WES-RUB-01"],
            "related_case_id": "FR-0006",
            "detected_at": datetime.now(timezone.utc) - timedelta(hours=1),
        },
        {
            "id": "AN-05",
            "severity": AnomalySeverity.warning,
            "title": "Polling station offline for >15 minutes",
            "description": "Musanze Station 2 lost connectivity — sync queued locally",
            "signal_name": "station_offline_duration",
            "baseline": 0.0, "observed": 22.0, "unit": "minutes",
            "recommendation": "Check network connection and power supply at Musanze Station 2",
            "status": "acknowledged",
            "is_live": True,
            "affected_entities": ["PS-NOR-MUS-02"],
            "related_case_id": None,
            "detected_at": datetime.now(timezone.utc) - timedelta(minutes=30),
        },
        {
            "id": "AN-06",
            "severity": AnomalySeverity.info,
            "title": "Voter turnout ahead of forecast in Gasabo",
            "description": "Gasabo district at 73% turnout by midday vs 55% forecast",
            "signal_name": "turnout_rate",
            "baseline": 55.0, "observed": 73.0, "unit": "percentage",
            "recommendation": "Consider directing overflow voters to adjacent stations",
            "status": "active",
            "is_live": True,
            "affected_entities": ["KGL-GAS"],
            "related_case_id": None,
            "detected_at": datetime.now(timezone.utc) - timedelta(hours=3),
        },
    ]

    for ad in anomaly_data:
        if not db.execute(select(AnomalySignal).where(AnomalySignal.id == ad["id"])).scalar_one_or_none():
            db.add(AnomalySignal(**ad))
    db.commit()
    print(f"  ✓ {len(anomaly_data)} anomaly signals")

    # -----------------------------------------------------------------------
    # 14. Audit entries (20) using write_audit()
    # -----------------------------------------------------------------------
    print("Seeding audit entries...")
    audit_entries_spec = [
        # System boot / initial setup
        {
            "action": AuditAction.RECORD_CREATED,
            "actor_type": ActorType.system,
            "actor_id": "system",
            "actor_role": None,
            "service": "seed-script",
            "ip": None,
            "geo": None,
            "detail": "Database seed: roles, districts, stations created",
        },
        {
            "action": AuditAction.KEY_ROTATED,
            "actor_type": ActorType.system,
            "actor_id": "system",
            "actor_role": None,
            "service": "key-management",
            "ip": None,
            "geo": None,
            "detail": "Initial encryption keys provisioned (Face, Fingerprint, Archive)",
        },
        # Admin logins
        {
            "action": AuditAction.LOGIN,
            "actor_type": ActorType.user,
            "actor_id": str(admin_users[0].id),
            "actor_role": "super",
            "service": "auth",
            "ip": "197.157.83.14",
            "geo": "Kigali, Rwanda",
            "detail": "Admin login: admin@securepoll.rw",
        },
        {
            "action": AuditAction.LOGIN,
            "actor_type": ActorType.user,
            "actor_id": str(admin_users[1].id),
            "actor_role": "auditor",
            "service": "auth",
            "ip": "102.22.45.100",
            "geo": "Musanze, Rwanda",
            "detail": "Admin login: auditor@securepoll.rw",
        },
        {
            "action": AuditAction.LOGIN,
            "actor_type": ActorType.user,
            "actor_id": str(admin_users[2].id),
            "actor_role": "officer",
            "service": "auth",
            "ip": "41.186.234.7",
            "geo": "Huye, Rwanda",
            "detail": "Admin login: officer@securepoll.rw",
        },
        # Voter records created
        {
            "action": AuditAction.RECORD_CREATED,
            "actor_type": ActorType.officer,
            "actor_id": str(officers[0].id),
            "actor_role": "officer",
            "service": "registry",
            "ip": "196.27.0.55",
            "geo": "Kigali, Rwanda",
            "detail": "600 voter records created via bulk enrollment import",
        },
        # Biometric links
        {
            "action": AuditAction.BIOMETRIC_LINKED,
            "actor_type": ActorType.officer,
            "actor_id": str(officers[1].id),
            "actor_role": "officer",
            "service": "biometric",
            "ip": "196.27.0.55",
            "geo": "Gasabo, Kigali",
            "detail": "600 face templates enrolled and linked to voter records",
        },
        # Verifications
        {
            "action": AuditAction.VOTER_VERIFIED,
            "actor_type": ActorType.officer,
            "actor_id": str(officers[0].id),
            "actor_role": "officer",
            "service": "verify",
            "ip": "41.75.198.230",
            "geo": "Gasabo Station 1",
            "detail": "Voter RW-2026-KGL0000-0000 verified — approved (confidence: 0.94)",
        },
        {
            "action": AuditAction.VOTER_VERIFIED,
            "actor_type": ActorType.officer,
            "actor_id": str(officers[2].id),
            "actor_role": "officer",
            "service": "verify",
            "ip": "41.75.198.230",
            "geo": "Kicukiro Station 1",
            "detail": "Voter RW-2026-KGL0002-0002 verified — approved (confidence: 0.87)",
        },
        {
            "action": AuditAction.VOTER_VERIFIED,
            "actor_type": ActorType.officer,
            "actor_id": str(officers[3].id),
            "actor_role": "officer",
            "service": "verify",
            "ip": "102.22.45.100",
            "geo": "Musanze Station 2",
            "detail": "Voter RW-2026-NOR0004-0100 — manual_review triggered (confidence: 0.68)",
        },
        # Voted
        {
            "action": AuditAction.VOTER_VOTED,
            "actor_type": ActorType.officer,
            "actor_id": str(officers[0].id),
            "actor_role": "officer",
            "service": "verify",
            "ip": "41.75.198.230",
            "geo": "Gasabo Station 1",
            "detail": "Voter ballot issued — status updated to VOTED",
        },
        {
            "action": AuditAction.VOTER_VOTED,
            "actor_type": ActorType.officer,
            "actor_id": str(officers[1].id),
            "actor_role": "officer",
            "service": "verify",
            "ip": "197.157.83.14",
            "geo": "Kicukiro Station 3",
            "detail": "Voter ballot issued — status updated to VOTED",
        },
        # Permission change
        {
            "action": AuditAction.PERMISSION_CHANGED,
            "actor_type": ActorType.user,
            "actor_id": str(admin_users[0].id),
            "actor_role": "super",
            "service": "admin",
            "ip": "197.157.83.14",
            "geo": "Kigali, Rwanda",
            "detail": "Role 'observer' permissions updated — added 'fraud' scope",
            "change_diff": [
                {"field": "permissions", "before": [], "after": ["fraud"]},
            ],
        },
        # Data exports
        {
            "action": AuditAction.DATA_EXPORTED,
            "actor_type": ActorType.user,
            "actor_id": str(admin_users[1].id),
            "actor_role": "auditor",
            "service": "export",
            "ip": "102.22.45.100",
            "geo": "Musanze, Rwanda",
            "detail": "Voter roll exported — district Gasabo (CSV, 600 records)",
        },
        {
            "action": AuditAction.DATA_EXPORTED,
            "actor_type": ActorType.user,
            "actor_id": str(admin_users[1].id),
            "actor_role": "auditor",
            "service": "export",
            "ip": "102.22.45.100",
            "geo": "Musanze, Rwanda",
            "detail": "Fraud report exported — all open cases (PDF)",
        },
        # Template accessed
        {
            "action": AuditAction.TEMPLATE_ACCESSED,
            "actor_type": ActorType.service,
            "actor_id": "verification-service",
            "actor_role": None,
            "service": "biometric",
            "ip": None,
            "geo": None,
            "detail": "Biometric template accessed for identity verification (encrypted blob read)",
        },
        # Record blocked
        {
            "action": AuditAction.RECORD_BLOCKED,
            "actor_type": ActorType.user,
            "actor_id": str(admin_users[0].id),
            "actor_role": "super",
            "service": "registry",
            "ip": "197.157.83.14",
            "geo": "Kigali, Rwanda",
            "detail": "Voter record blocked pending fraud investigation (FR-0005)",
        },
        # HSM health check
        {
            "action": AuditAction.HSM_HEALTHCHECK,
            "actor_type": ActorType.system,
            "actor_id": "system",
            "actor_role": None,
            "service": "key-management",
            "ip": None,
            "geo": None,
            "detail": "Scheduled HSM health check passed — all 3 keys accessible",
        },
        # Record merged (duplicate case resolution)
        {
            "action": AuditAction.RECORD_MERGED,
            "actor_type": ActorType.user,
            "actor_id": str(admin_users[0].id),
            "actor_role": "super",
            "service": "registry",
            "ip": "197.157.83.14",
            "geo": "Kigali, Rwanda",
            "detail": "Duplicate voter records merged — FR-0002 resolved",
        },
        # Address updated
        {
            "action": AuditAction.ADDRESS_UPDATED,
            "actor_type": ActorType.officer,
            "actor_id": str(officers[4].id),
            "actor_role": "officer",
            "service": "registry",
            "ip": "41.186.234.7",
            "geo": "Huye, Rwanda",
            "detail": "Voter polling station reassigned — moved from Huye Stn 1 to Huye Stn 2",
            "change_diff": [
                {"field": "polling_station_id", "before": "Huye Station 1", "after": "Huye Station 2"},
            ],
        },
    ]

    audit_count = 0
    for spec in audit_entries_spec:
        write_audit(
            db,
            action=spec["action"],
            actor_type=spec["actor_type"],
            actor_id=spec.get("actor_id"),
            actor_role=spec.get("actor_role"),
            service=spec.get("service"),
            ip=spec.get("ip"),
            geo=spec.get("geo"),
            detail=spec.get("detail"),
            change_diff=spec.get("change_diff"),
        )
        audit_count += 1
        if audit_count % 5 == 0:
            db.commit()

    db.commit()
    print(f"  ✓ {audit_count} audit entries")

    # -----------------------------------------------------------------------
    # Summary
    # -----------------------------------------------------------------------
    print("\n✅ Database seeded successfully!")
    print(f"   Roles: {len(roles_data)}")
    print(f"   Encryption keys: {len(enc_key_objects)}")
    print(f"   Districts: {len(district_map)}")
    print(f"   Polling stations: {ps_count}")
    print(f"   Field officers: {len(officers)}")
    print(f"   Admin users: {len(admin_users)}")
    print(f"   Sessions: {session_count}")
    print(f"   Voters: {voter_count}")
    print(f"   Biometric templates: {template_count}")
    print(f"   Verification attempts: {attempt_count} ({approved_count} approved)")
    print(f"   Fraud cases: {len(fraud_cases_data)}")
    print(f"   Duplicate matches: {dup_count}")
    print(f"   Anomaly signals: {len(anomaly_data)}")
    print(f"   Audit entries: {audit_count}")
    print("\nAdmin login: admin@securepoll.rw / SecurePassword123!")

finally:
    db.close()
