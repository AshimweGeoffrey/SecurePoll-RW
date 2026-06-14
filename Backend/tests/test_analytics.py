"""Analytics module tests — turnout, demographics, verification stats."""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock


# ---------------------------------------------------------------------------
# Module-scoped fixtures
# ---------------------------------------------------------------------------

@pytest.fixture(scope="module")
def client():
    """FastAPI test client with mocked AI models."""
    with patch("ml.inference.load_models"), \
         patch("ml.inference._face_model", MagicMock()), \
         patch("ml.inference._faiss_index", MagicMock(ntotal=0)):
        from app.main import app
        return TestClient(app, raise_server_exceptions=False)


@pytest.fixture(scope="module")
def auth_token(client):
    """Obtain a JWT token by logging in as the admin user."""
    resp = client.post(
        "/auth/login",
        json={"email": "admin@securepoll.rw", "password": "SecurePassword123!"},
    )
    assert resp.status_code == 200, f"Login failed: {resp.text}"
    return resp.json()["access_token"]


@pytest.fixture(scope="module")
def auth_headers(auth_token):
    """Authorization header dict for authenticated requests."""
    return {"Authorization": f"Bearer {auth_token}"}


# ---------------------------------------------------------------------------
# Turnout statistics
# ---------------------------------------------------------------------------

def test_turnout_stats(client, auth_headers):
    """GET /analytics/turnout → 200 with total_registered and turnout_rate."""
    resp = client.get("/analytics/turnout", headers=auth_headers)
    assert resp.status_code == 200
    body = resp.json()
    assert "total_registered" in body
    assert "total_voted" in body
    assert "total_verified" in body
    assert "turnout_rate" in body
    assert isinstance(body["total_registered"], int)
    assert isinstance(body["total_voted"], int)
    assert isinstance(body["turnout_rate"], (int, float))


def test_turnout_stats_by_station(client, auth_headers):
    """GET /analytics/turnout → by_station is a list of station breakdowns."""
    resp = client.get("/analytics/turnout", headers=auth_headers)
    assert resp.status_code == 200
    body = resp.json()
    assert "by_station" in body
    assert isinstance(body["by_station"], list)
    # Each station entry should have station_id, registered, voted, turnout_pct
    for station in body["by_station"]:
        assert "station_id" in station
        assert "registered" in station
        assert "voted" in station
        assert "turnout_pct" in station


def test_turnout_rate_is_valid_percentage(client, auth_headers):
    """GET /analytics/turnout → turnout_rate is between 0 and 100."""
    resp = client.get("/analytics/turnout", headers=auth_headers)
    assert resp.status_code == 200
    rate = resp.json()["turnout_rate"]
    assert 0 <= rate <= 100


def test_analytics_unauthenticated(client):
    """GET /analytics/turnout without token → 401."""
    resp = client.get("/analytics/turnout")
    assert resp.status_code == 401


# ---------------------------------------------------------------------------
# Demographics
# ---------------------------------------------------------------------------

def test_demographics(client, auth_headers):
    """GET /analytics/demographics → 200 with by_sex and by_district."""
    resp = client.get("/analytics/demographics", headers=auth_headers)
    assert resp.status_code == 200
    body = resp.json()
    assert "by_sex" in body
    assert "by_district" in body
    assert isinstance(body["by_district"], list)


def test_demographics_by_sex_keys(client, auth_headers):
    """GET /analytics/demographics → by_sex has 'male' and 'female' keys."""
    resp = client.get("/analytics/demographics", headers=auth_headers)
    assert resp.status_code == 200
    by_sex = resp.json()["by_sex"]
    assert "male" in by_sex
    assert "female" in by_sex
    assert isinstance(by_sex["male"], int)
    assert isinstance(by_sex["female"], int)


def test_demographics_by_district_structure(client, auth_headers):
    """GET /analytics/demographics → each district entry has 'district' and 'registered'."""
    resp = client.get("/analytics/demographics", headers=auth_headers)
    assert resp.status_code == 200
    by_district = resp.json()["by_district"]
    for entry in by_district:
        assert "district" in entry
        assert "registered" in entry
        assert isinstance(entry["registered"], int)


def test_demographics_unauthenticated(client):
    """GET /analytics/demographics without token → 401."""
    resp = client.get("/analytics/demographics")
    assert resp.status_code == 401


# ---------------------------------------------------------------------------
# Verification statistics
# ---------------------------------------------------------------------------

def test_verification_stats(client, auth_headers):
    """GET /analytics/verification → 200 with total_attempts and breakdown."""
    resp = client.get("/analytics/verification", headers=auth_headers)
    assert resp.status_code == 200
    body = resp.json()
    assert "total_attempts" in body
    assert "approved" in body
    assert "manual_review" in body
    assert "rejected" in body
    assert "average_confidence" in body
    assert isinstance(body["total_attempts"], int)


def test_verification_stats_counts_sum(client, auth_headers):
    """GET /analytics/verification → approved + manual_review + rejected == total_attempts."""
    resp = client.get("/analytics/verification", headers=auth_headers)
    assert resp.status_code == 200
    body = resp.json()
    total = body["total_attempts"]
    parts_sum = body["approved"] + body["manual_review"] + body["rejected"]
    assert parts_sum == total, (
        f"Counts don't add up: {body['approved']} + {body['manual_review']} + "
        f"{body['rejected']} = {parts_sum} != {total}"
    )


def test_verification_stats_average_confidence_range(client, auth_headers):
    """GET /analytics/verification → average_confidence between 0 and 1."""
    resp = client.get("/analytics/verification", headers=auth_headers)
    assert resp.status_code == 200
    avg_conf = resp.json()["average_confidence"]
    assert 0.0 <= avg_conf <= 1.0


def test_verification_stats_approval_rate(client, auth_headers):
    """GET /analytics/verification → approval_rate is between 0 and 100."""
    resp = client.get("/analytics/verification", headers=auth_headers)
    assert resp.status_code == 200
    body = resp.json()
    assert "approval_rate" in body
    assert 0 <= body["approval_rate"] <= 100


def test_verification_stats_unauthenticated(client):
    """GET /analytics/verification without token → 401."""
    resp = client.get("/analytics/verification")
    assert resp.status_code == 401
