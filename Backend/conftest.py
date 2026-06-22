"""Pytest configuration and shared fixtures."""
import os
# Disable per-IP rate limiting during tests — the TestClient shares one IP, so a
# rapid suite would otherwise trip the limiter. Must be set before app import.
os.environ.setdefault("RATE_LIMIT_PER_MINUTE", "0")

import pytest
from unittest.mock import patch, MagicMock
from app.core.db import engine, SessionLocal
from app.db.models.base import Base
from app.core.enums import Province


# ---------------------------------------------------------------------------
# Auto-markers: tag every test by directory so -m unit / -m integration work
# ---------------------------------------------------------------------------

def pytest_collection_modifyitems(config, items):
    for item in items:
        path_str = str(item.fspath)
        if "/unit/" in path_str or "\\unit\\" in path_str:
            item.add_marker(pytest.mark.unit)
        else:
            item.add_marker(pytest.mark.integration)


# ---------------------------------------------------------------------------
# Shared fixtures (function-scoped DB session with rollback isolation)
# ---------------------------------------------------------------------------

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


# Note: module-scoped client/auth_token/auth_headers fixtures are defined
# locally in each test file to avoid fixture scope conflicts across modules.
