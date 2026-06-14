"""Seed database with sample data."""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from datetime import datetime, timezone, date
import uuid
from app.core.db import engine, SessionLocal
from app.core.security import hash_password, generate_totp_secret
from app.core.enums import Province, UserStatus, VoterStatus, Sex
from app.db.models.base import Base
from app.db.models.geography import District, PollingStation
from app.db.models.people import Role, AdminUser, FieldOfficer
from app.db.models.voter import Voter

# Create tables
print("Creating tables...")
Base.metadata.create_all(bind=engine)

db = SessionLocal()

try:
    # Create roles
    print("Creating roles...")
    roles_data = [
        {"id": "super", "name": "Super Admin", "permissions": ["registry", "verify", "fraud", "audit", "users", "keys"]},
        {"id": "auditor", "name": "Auditor", "permissions": ["fraud", "audit", "registry"]},
        {"id": "officer", "name": "Field Officer", "permissions": ["verify", "registry"]},
        {"id": "observer", "name": "Observer", "permissions": []},
        {"id": "support", "name": "Support", "permissions": []},
    ]
    
    for role_data in roles_data:
        existing = db.query(Role).filter(Role.id == role_data["id"]).first()
        if not existing:
            role = Role(**role_data)
            db.add(role)
    
    db.commit()
    print("✓ Roles created")
    
    # Create admin user
    print("Creating admin users...")
    admin_user = AdminUser(
        full_name="System Administrator",
        email="admin@securepoll.rw",
        password_hash=hash_password("SecurePassword123!"),
        role_id="super",
        status=UserStatus.active,
        mfa_enabled=False,
    )
    db.add(admin_user)
    db.commit()
    print("✓ Admin user created (admin@securepoll.rw / SecurePassword123!)")
    
    # Create districts
    print("Creating districts...")
    provinces_and_districts = {
        Province.kigali: ["Gasabo", "Kicukiro", "Nyarugenge"],
        Province.northern: ["Burera", "Gicumbi", "Musanze", "Gicumbi"],
        Province.southern: ["Bugesera", "Gisagara", "Huye", "Muhanga City"],
        Province.eastern: ["Bugesera", "Gatsibo", "Kayonza", "Kirehe", "Ngoma"],
        Province.western: ["Karongi", "Kasekela", "Nyamasheke", "Nyabihu"],
    }
    
    districts_by_code = {}
    district_counter = 0
    for province, district_names in provinces_and_districts.items():
        for i, name in enumerate(district_names):
            code = f"DIS-{province.value[:3].upper()}-{i+1:02d}"
            district = District(
                code=code,
                name=name,
                province=province,
                boundary_ref=f"geo_ref_{code}",
            )
            db.add(district)
            db.flush()
            districts_by_code[code] = district
            district_counter += 1
    
    db.commit()
    print(f"✓ {len(districts_by_code)} districts created")
    
    # Create polling stations
    print("Creating polling stations...")
    station_counter = 0
    for dist_code, district in list(districts_by_code.items())[:5]:  # Just seed 5 districts for demo
        for i in range(3):  # 3 stations per district
            station_code = f"PS-{dist_code.split('-')[1]}-{i+1:03d}"
            station = PollingStation(
                code=station_code,
                name=f"Polling Station {i+1} - {district.name}",
                district_id=district.id,
                lat=-1.9 + (i * 0.01),
                lon=29.8 + (i * 0.01),
                opens_at="06:00:00",
                closes_at="18:00:00",
            )
            db.add(station)
            station_counter += 1
    
    db.commit()
    print(f"✓ {station_counter} polling stations created")
    
    # Create field officers
    print("Creating field officers...")
    officer_names = ["John Mugisha", "Alice Uwineza", "Peter Habimana", "Marie Kalindi", "James Niyigena"]
    for i, name in enumerate(officer_names):
        officer = FieldOfficer(
            name=name,
            team=f"Team {i+1}",
        )
        db.add(officer)
    
    db.commit()
    print(f"✓ {len(officer_names)} field officers created")
    
    # Create sample voters
    print("Creating sample voters...")
    first_names = ["Jean", "Marie", "Pierre", "Jeanine", "Francois", "Anne"]
    last_names = ["Kagame", "Mutabazi", "Nyarwaya", "Karugaba", "Mukandayire", "Habimana"]
    
    voter_counter = 0
    for district_code, district in list(districts_by_code.items())[:5]:
        stations = [s for s in db.query(PollingStation).filter(PollingStation.district_id == district.id).all()]
        if not stations:
            continue
        
        for i in range(10):  # 10 voters per district
            token_id = f"{district_code.split('-')[1]}{i+1:04d}".upper()
            voter = Voter(
                voter_token=f"RW-2026-{token_id}-{uuid.uuid4().hex[:4].upper()}",
                registration_ref=f"#{100000 + voter_counter}",
                national_id=f"1{i+1:015d}",
                first_name=first_names[i % len(first_names)],
                last_name=last_names[i % len(last_names)],
                sex=Sex.male if i % 2 == 0 else Sex.female,
                date_of_birth=date(1980 + (i % 40), (i % 12) + 1, (i % 28) + 1),
                phone=f"+250788{i:06d}",
                district_id=district.id,
                polling_station_id=stations[i % len(stations)].id,
                roll_position=i + 1,
                status=VoterStatus.registered,
                enrolled_at=datetime.now(timezone.utc),
                data_quality_score=90,
            )
            db.add(voter)
            voter_counter += 1
    
    db.commit()
    print(f"✓ {voter_counter} sample voters created")
    
    print("\n✅ Database seeded successfully!")
    print(f"\nSummary:")
    print(f"  - Roles: {len(roles_data)}")
    print(f"  - Admin users: 1")
    print(f"  - Districts: {len(districts_by_code)}")
    print(f"  - Polling stations: {station_counter}")
    print(f"  - Field officers: {len(officer_names)}")
    print(f"  - Voters: {voter_counter}")
    
finally:
    db.close()
