"""Pytest configuration and shared fixtures."""
import pytest
from unittest.mock import patch, MagicMock
from app.core.db import engine, SessionLocal
from app.db.models.base import Base
from app.core.enums import Province


@pytest.fixture(scope="function")
def db():
    """Fresh DB session per test; rolls back all changes after each test."""
    Base.metadata.create_all(bind=engine)
    connection = engine.connect()
    transaction = connection.begin()

    from sqlalchemy.orm import Session
    session = Session(bind=connection)

    yield session

    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture
def test_user(db):
    """Admin user fixture."""
    from app.db.models.people import Role, AdminUser
    from app.core.security import hash_password
    from app.core.enums import UserStatus

    role = db.merge(Role(id="super", name="Super Admin",
                         permissions=["registry", "verify", "fraud", "audit", "users", "keys"]))
    db.flush()

    user = AdminUser(
        full_name="Test Admin",
        email="test@securepoll.rw",
        password_hash=hash_password("TestPassword123!"),
        role_id="super",
        status=UserStatus.active,
    )
    db.add(user)
    db.commit()
    return user


@pytest.fixture
def test_voter(db, test_user):
    """Voter with geography."""
    from app.db.models.geography import District, PollingStation
    from app.db.models.voter import Voter
    from app.core.enums import Sex, VoterStatus
    from datetime import date

    district = District(code="TEST-D1", name="Test District", province=Province.kigali)
    db.add(district)
    db.flush()

    station = PollingStation(code="TEST-PS1", name="Test Station", district_id=district.id)
    db.add(station)
    db.flush()

    voter = Voter(
        voter_token="RW-TEST-0001-ABCD",
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


# ---------------------------------------------------------------------------
# Module-scoped HTTP fixtures (shared by extended test modules)
# ---------------------------------------------------------------------------

@pytest.fixture(scope="module")
def client():
    """TestClient for integration tests with mocked AI models."""
    with patch("ml.inference.load_models"), \
         patch("ml.inference._face_model", MagicMock()), \
         patch("ml.inference._faiss_index", MagicMock(ntotal=0)):
        from app.main import app
        from fastapi.testclient import TestClient
        return TestClient(app, raise_server_exceptions=False)


@pytest.fixture(scope="module")
def auth_token(client):
    """Obtain a JWT access token using the seeded admin account."""
    resp = client.post(
        "/auth/login",
        json={"email": "admin@securepoll.rw", "password": "SecurePassword123!"},
    )
    return resp.json().get("access_token", "")


@pytest.fixture(scope="module")
def auth_headers(auth_token):
    """Authorization header dict ready for use in authenticated requests."""
    return {"Authorization": f"Bearer {auth_token}"}
