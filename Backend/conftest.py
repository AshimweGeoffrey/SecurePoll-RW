"""Configuration for pytest and test utilities."""
import pytest
from app.core.db import engine, SessionLocal
from app.db.models.base import Base
from sqlalchemy.pool import StaticPool
from app.core.config import settings

# Use in-memory SQLite for tests (optional override)
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"


@pytest.fixture(scope="function")
def db():
    """Create a fresh test database for each test."""
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture
def test_user(db):
    """Create a test admin user."""
    from app.db.models.people import Role, AdminUser
    from app.core.security import hash_password
    from app.core.enums import UserStatus
    
    # Create role
    role = Role(
        id="test_role",
        name="Test Role",
        permissions=["verify", "audit"],
    )
    db.add(role)
    db.commit()
    
    # Create user
    user = AdminUser(
        full_name="Test User",
        email="test@securepoll.rw",
        password_hash=hash_password("TestPassword123!"),
        role_id="test_role",
        status=UserStatus.active,
    )
    db.add(user)
    db.commit()
    
    return user


@pytest.fixture
def test_voter(db, test_user):
    """Create a test voter."""
    from app.db.models.geography import District, PollingStation
    from app.db.models.voter import Voter
    from app.core.enums import Sex, VoterStatus
    from datetime import date
    import uuid
    
    # Create district
    district = District(
        code="TEST-DIS",
        name="Test District",
        province="Kigali City",
    )
    db.add(district)
    db.commit()
    
    # Create polling station
    station = PollingStation(
        code="TEST-PS",
        name="Test Polling Station",
        district_id=district.id,
    )
    db.add(station)
    db.commit()
    
    # Create voter
    voter = Voter(
        voter_token=f"RW-TEST-{uuid.uuid4().hex[:8].upper()}",
        registration_ref="#TEST001",
        national_id="1234567890123456",
        first_name="John",
        last_name="Doe",
        sex=Sex.male,
        date_of_birth=date(1990, 1, 1),
        district_id=district.id,
        polling_station_id=station.id,
        status=VoterStatus.registered,
    )
    db.add(voter)
    db.commit()
    
    return voter
