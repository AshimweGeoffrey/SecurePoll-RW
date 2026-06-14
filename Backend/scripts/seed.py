"""Seed the database with realistic sample data for demo and evaluation."""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from datetime import datetime, timezone, date
import uuid
from sqlalchemy import select
from app.core.db import engine, SessionLocal
from app.core.security import hash_password
from app.core.enums import (Province, UserStatus, VoterStatus, Sex,
                             AnomalySeverity, FraudType, RiskLevel)
from app.db.models.base import Base
from app.db.models.geography import District, PollingStation
from app.db.models.people import Role, AdminUser, FieldOfficer
from app.db.models.voter import Voter
from app.db.models.fraud import AnomalySignal, FraudCase

print("Creating tables...")
Base.metadata.create_all(bind=engine)

db = SessionLocal()

try:
    # -------------------------------------------------------------------------
    # Roles
    # -------------------------------------------------------------------------
    print("Seeding roles...")
    roles_data = [
        {"id": "super",    "name": "Super Admin",   "permissions": ["registry","verify","fraud","audit","users","keys"]},
        {"id": "auditor",  "name": "Auditor",        "permissions": ["fraud","audit","registry"]},
        {"id": "officer",  "name": "Field Officer",  "permissions": ["verify","registry"]},
        {"id": "observer", "name": "Observer",       "permissions": []},
        {"id": "support",  "name": "Support",        "permissions": ["registry"]},
    ]
    for rd in roles_data:
        if not db.execute(select(Role).where(Role.id == rd["id"])).scalar_one_or_none():
            db.add(Role(**rd))
    db.commit()
    print(f"  ✓ {len(roles_data)} roles")

    # -------------------------------------------------------------------------
    # Admin users
    # -------------------------------------------------------------------------
    print("Seeding admin users...")
    admins_data = [
        ("System Admin",      "admin@securepoll.rw",    "SecurePassword123!", "super"),
        ("Audit Officer",     "auditor@securepoll.rw",  "AuditPass123!",      "auditor"),
        ("Field Supervisor",  "officer@securepoll.rw",  "OfficerPass123!",    "officer"),
    ]
    for full_name, email, password, role_id in admins_data:
        if not db.execute(select(AdminUser).where(AdminUser.email == email)).scalar_one_or_none():
            db.add(AdminUser(
                full_name=full_name, email=email,
                password_hash=hash_password(password),
                role_id=role_id, status=UserStatus.active,
            ))
    db.commit()
    print(f"  ✓ {len(admins_data)} admin users")
    print("    admin@securepoll.rw / SecurePassword123!")

    # -------------------------------------------------------------------------
    # Districts  (30 real Rwanda districts)
    # -------------------------------------------------------------------------
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
    district_map = {}
    for code, name, province in districts_raw:
        d = db.execute(select(District).where(District.code == code)).scalar_one_or_none()
        if not d:
            d = District(code=code, name=name, province=province)
            db.add(d)
            db.flush()
        district_map[code] = d
    db.commit()
    print(f"  ✓ {len(district_map)} districts")

    # -------------------------------------------------------------------------
    # Polling stations (3 per district)
    # -------------------------------------------------------------------------
    print("Seeding polling stations...")
    station_map = {}
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

    # -------------------------------------------------------------------------
    # Field officers
    # -------------------------------------------------------------------------
    print("Seeding field officers...")
    officer_names = [
        "John Mugisha", "Alice Uwineza", "Peter Habimana",
        "Marie Kalindi", "James Niyigena", "Grace Uwimana",
        "Patrick Nkurunziza", "Diane Mukagatare",
    ]
    officers = []
    for name in officer_names:
        officer = FieldOfficer(name=name, team="Alpha")
        db.add(officer)
        officers.append(officer)
    db.commit()
    print(f"  ✓ {len(officers)} field officers")

    # -------------------------------------------------------------------------
    # Voters (20 per district = 600 total)
    # -------------------------------------------------------------------------
    print("Seeding voters...")
    first_names_m = ["Jean", "Pierre", "Francois", "Emmanuel", "Claude", "Patrick"]
    first_names_f = ["Marie", "Jeanine", "Grace", "Diane", "Ange", "Solange"]
    last_names = ["Kagame", "Mutabazi", "Nyarwaya", "Karugaba", "Mukandayire",
                  "Habimana", "Niyonzima", "Uwimana", "Nkurunziza", "Bizimana"]

    voter_count = 0
    for dist_idx, (dist_code, district) in enumerate(district_map.items()):
        stations = [v for k, v in station_map.items() if k.startswith(f"PS-{dist_code}-")]
        if not stations:
            continue
        for i in range(20):
            is_female = i % 2 == 0
            fname = (first_names_f if is_female else first_names_m)[i % 6]
            lname = last_names[i % len(last_names)]
            nid_raw = f"1{dist_idx:02d}{voter_count:013d}"
            existing = db.execute(
                select(Voter).where(Voter.national_id == nid_raw)
            ).scalar_one_or_none()
            if existing:
                voter_count += 1
                continue
            voter = Voter(
                voter_token=f"RW-2026-{dist_code[:3]}{i:04d}-{voter_count:04X}",
                registration_ref=f"#{100000 + voter_count}",
                national_id=nid_raw,
                first_name=fname,
                last_name=lname,
                sex=Sex.female if is_female else Sex.male,
                date_of_birth=date(1960 + (voter_count % 40), (i % 12) + 1, (i % 28) + 1),
                phone=f"+250788{voter_count:06d}",
                district_id=district.id,
                polling_station_id=stations[i % len(stations)].id,
                roll_position=i + 1,
                status=VoterStatus.registered,
                data_quality_score=85 + (i % 15),
            )
            db.add(voter)
            voter_count += 1

    db.commit()
    print(f"  ✓ {voter_count} voters")

    # -------------------------------------------------------------------------
    # Sample anomaly signals
    # -------------------------------------------------------------------------
    print("Seeding anomaly signals...")
    anomalies = [
        AnomalySignal(
            id="AN-01",
            severity=AnomalySeverity.critical,
            title="Verification rate spike at Gasabo Station 1",
            description="Verifications per hour 3x above baseline",
            signal_name="verifications_per_hour",
            baseline=45.0, observed=142.0, unit="verifications/hr",
            recommendation="Deploy additional officers to Gasabo Station 1",
            status="active",
            detected_at=datetime.now(timezone.utc),
        ),
        AnomalySignal(
            id="AN-02",
            severity=AnomalySeverity.warning,
            title="Low face match confidence cluster",
            description="8 consecutive rejections at Kicukiro Station 2",
            signal_name="consecutive_rejections",
            baseline=1.0, observed=8.0, unit="count",
            recommendation="Check lighting conditions at station",
            status="active",
            detected_at=datetime.now(timezone.utc),
        ),
        AnomalySignal(
            id="AN-03",
            severity=AnomalySeverity.info,
            title="Above-average data quality score for eastern region",
            description="Eastern province voters have 94% avg quality vs 85% national baseline",
            signal_name="data_quality_score",
            baseline=85.0, observed=94.0, unit="score",
            recommendation="No action required",
            status="active",
            detected_at=datetime.now(timezone.utc),
        ),
    ]
    for a in anomalies:
        if not db.execute(select(AnomalySignal).where(AnomalySignal.id == a.id)).scalar_one_or_none():
            db.add(a)
    db.commit()
    print(f"  ✓ {len(anomalies)} anomaly signals")

    # -------------------------------------------------------------------------
    # Sample fraud case
    # -------------------------------------------------------------------------
    print("Seeding sample fraud case...")
    if not db.execute(select(FraudCase).where(FraudCase.id == "FR-0001")).scalar_one_or_none():
        db.add(FraudCase(
            id="FR-0001",
            type=FraudType.duplicate,
            title="Duplicate biometric detected at enrollment",
            risk_level=RiskLevel.critical,
            detected_by="1:N de-duplication",
            face_score=0.97,
            opened_at=datetime.now(timezone.utc),
            breakdown=[
                {"label": "Face similarity", "value": "0.97"},
                {"label": "Threshold", "value": "0.85"},
            ],
            timeline=[
                {"time": datetime.now(timezone.utc).isoformat(), "event": "Duplicate flag raised by FAISS dedup"},
            ],
            assessment={"risk": "critical", "recommendation": "Manual review required"},
        ))
        db.commit()
    print("  ✓ 1 fraud case")

    print("\n✅ Database seeded successfully!")
    print(f"   Roles: {len(roles_data)} | Districts: {len(district_map)} | Stations: {ps_count}")
    print(f"   Voters: {voter_count} | Officers: {len(officers)}")
    print("\nLogin: admin@securepoll.rw / SecurePassword123!")

finally:
    db.close()
