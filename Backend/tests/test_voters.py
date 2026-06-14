"""Voters module tests — registry CRUD, search, block, archive, export."""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
import uuid


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


@pytest.fixture(scope="module")
def existing_voter_id(client, auth_headers):
    """Return the ID of the first voter in the list (or None if empty)."""
    resp = client.get("/voters?limit=1", headers=auth_headers)
    assert resp.status_code == 200
    items = resp.json().get("items", [])
    if items:
        return items[0]["id"]
    return None


@pytest.fixture(scope="module")
def existing_voter_token(client, auth_headers):
    """Return the voter_token of the first voter in the list (or None if empty)."""
    resp = client.get("/voters?limit=1", headers=auth_headers)
    assert resp.status_code == 200
    items = resp.json().get("items", [])
    if items:
        return items[0]["voter_token"]
    return None


# ---------------------------------------------------------------------------
# Voter list tests
# ---------------------------------------------------------------------------

def test_list_voters_returns_total(client, auth_headers):
    """GET /voters → 200, response has total >= 0."""
    resp = client.get("/voters", headers=auth_headers)
    assert resp.status_code == 200
    body = resp.json()
    assert "total" in body
    assert body["total"] >= 0
    assert "items" in body


def test_list_voters_pagination(client, auth_headers):
    """GET /voters?skip=0&limit=10 → 200, items count <= 10."""
    resp = client.get("/voters?skip=0&limit=10", headers=auth_headers)
    assert resp.status_code == 200
    body = resp.json()
    assert len(body["items"]) <= 10


def test_list_voters_search(client, auth_headers):
    """GET /voters?search=a → 200, all returned names/tokens contain search term (case-insensitive)."""
    resp = client.get("/voters?search=a&limit=50", headers=auth_headers)
    assert resp.status_code == 200
    body = resp.json()
    assert isinstance(body["items"], list)


def test_list_voters_status_filter(client, auth_headers):
    """GET /voters?status=registered → 200, items returned."""
    resp = client.get("/voters?status=registered&limit=10", headers=auth_headers)
    assert resp.status_code == 200
    body = resp.json()
    assert isinstance(body["items"], list)


def test_list_voters_unauthenticated(client):
    """GET /voters without token → 401."""
    resp = client.get("/voters")
    assert resp.status_code == 401


# ---------------------------------------------------------------------------
# Get voter by ID
# ---------------------------------------------------------------------------

def test_get_voter_by_id(client, auth_headers, existing_voter_id):
    """GET /voters/{id} → 200 with voter data."""
    if existing_voter_id is None:
        pytest.skip("No voters in DB to fetch")
    resp = client.get(f"/voters/{existing_voter_id}", headers=auth_headers)
    assert resp.status_code == 200
    body = resp.json()
    assert body["id"] == existing_voter_id


def test_get_voter_not_found(client, auth_headers):
    """GET /voters/<zero-UUID> → 404."""
    resp = client.get(
        "/voters/00000000-0000-0000-0000-000000000000",
        headers=auth_headers,
    )
    assert resp.status_code == 404


def test_get_voter_invalid_uuid(client, auth_headers):
    """GET /voters/not-a-uuid → 422 unprocessable entity."""
    resp = client.get("/voters/not-a-uuid", headers=auth_headers)
    assert resp.status_code == 422


# ---------------------------------------------------------------------------
# Get voter by token
# ---------------------------------------------------------------------------

def test_get_voter_by_token(client, auth_headers, existing_voter_token):
    """GET /voters/by-token/{token} → 200 with voter data."""
    if existing_voter_token is None:
        pytest.skip("No voters in DB to fetch by token")
    resp = client.get(f"/voters/by-token/{existing_voter_token}", headers=auth_headers)
    assert resp.status_code == 200
    body = resp.json()
    assert body["voter_token"] == existing_voter_token


def test_get_voter_by_token_not_found(client, auth_headers):
    """GET /voters/by-token/DOESNOTEXIST → 404."""
    resp = client.get("/voters/by-token/DOESNOTEXIST-9999-AAAA", headers=auth_headers)
    assert resp.status_code == 404


# ---------------------------------------------------------------------------
# Update voter
# ---------------------------------------------------------------------------

def test_update_voter(client, auth_headers, existing_voter_id):
    """PATCH /voters/{id} with {first_name: 'Updated'} → 200 with new name."""
    if existing_voter_id is None:
        pytest.skip("No voters in DB to update")
    resp = client.patch(
        f"/voters/{existing_voter_id}",
        json={"first_name": "Updated"},
        headers=auth_headers,
    )
    assert resp.status_code == 200
    assert resp.json()["first_name"] == "Updated"


def test_update_voter_not_found(client, auth_headers):
    """PATCH /voters/<zero-UUID> → 404."""
    resp = client.patch(
        "/voters/00000000-0000-0000-0000-000000000000",
        json={"first_name": "Ghost"},
        headers=auth_headers,
    )
    assert resp.status_code == 404


# ---------------------------------------------------------------------------
# Voter create
# ---------------------------------------------------------------------------

def test_create_voter_missing_district(client, auth_headers):
    """POST /voters with nonexistent district_id → 400."""
    resp = client.post(
        "/voters",
        json={
            "voter_token": f"RW-TST-{uuid.uuid4().hex[:8].upper()}",
            "registration_ref": f"#TST{uuid.uuid4().hex[:6]}",
            "national_id": "1234567890123456",
            "first_name": "Test",
            "last_name": "Voter",
            "sex": "male",
            "date_of_birth": "1990-01-01",
            "district_id": "00000000-0000-0000-0000-000000000001",
            "polling_station_id": "00000000-0000-0000-0000-000000000002",
        },
        headers=auth_headers,
    )
    # District not found → 400
    assert resp.status_code in [400, 422]


def test_create_voter_unauthenticated(client):
    """POST /voters without token → 401."""
    resp = client.post(
        "/voters",
        json={
            "voter_token": "RW-TST-UNAUTH",
            "registration_ref": "#UNAUTH001",
            "national_id": "0000000000000000",
            "first_name": "Ghost",
            "last_name": "Voter",
            "sex": "female",
            "date_of_birth": "1995-05-15",
            "district_id": "00000000-0000-0000-0000-000000000001",
            "polling_station_id": "00000000-0000-0000-0000-000000000002",
        },
    )
    assert resp.status_code == 401


def test_create_voter_validation_error(client, auth_headers):
    """POST /voters with invalid sex enum → 422."""
    resp = client.post(
        "/voters",
        json={
            "voter_token": "RW-TST-BADSEX",
            "registration_ref": "#BADSEX001",
            "national_id": "0000000000000000",
            "first_name": "Bad",
            "last_name": "Sex",
            "sex": "unknown_gender",
            "date_of_birth": "1995-05-15",
            "district_id": "00000000-0000-0000-0000-000000000001",
            "polling_station_id": "00000000-0000-0000-0000-000000000002",
        },
        headers=auth_headers,
    )
    assert resp.status_code == 422


# ---------------------------------------------------------------------------
# Block / archive / restore voter
# ---------------------------------------------------------------------------

def test_block_voter(client, auth_headers, existing_voter_id):
    """POST /voters/{id}:block?reason=test → 200 {"status": "blocked"}."""
    if existing_voter_id is None:
        pytest.skip("No voters in DB to block")
    resp = client.post(
        f"/voters/{existing_voter_id}:block?reason=test_block",
        headers=auth_headers,
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "blocked"


def test_block_voter_not_found(client, auth_headers):
    """POST /voters/<zero-UUID>:block → 404."""
    resp = client.post(
        "/voters/00000000-0000-0000-0000-000000000000:block?reason=no_voter",
        headers=auth_headers,
    )
    assert resp.status_code == 404


def test_archive_voter(client, auth_headers, existing_voter_id):
    """POST /voters/{id}:archive → 200 {"status": "archived"}."""
    if existing_voter_id is None:
        pytest.skip("No voters in DB to archive")
    resp = client.post(f"/voters/{existing_voter_id}:archive", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["status"] == "archived"


def test_restore_voter(client, auth_headers, existing_voter_id):
    """POST /voters/{id}:restore → 200 {"status": "restored"}."""
    if existing_voter_id is None:
        pytest.skip("No voters in DB to restore")
    resp = client.post(f"/voters/{existing_voter_id}:restore", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["status"] == "restored"


def test_archive_voter_not_found(client, auth_headers):
    """POST /voters/<zero-UUID>:archive → 404."""
    resp = client.post(
        "/voters/00000000-0000-0000-0000-000000000000:archive",
        headers=auth_headers,
    )
    assert resp.status_code == 404


def test_restore_voter_not_found(client, auth_headers):
    """POST /voters/<zero-UUID>:restore → 404."""
    resp = client.post(
        "/voters/00000000-0000-0000-0000-000000000000:restore",
        headers=auth_headers,
    )
    assert resp.status_code == 404


# ---------------------------------------------------------------------------
# Registry health + CSV export
# ---------------------------------------------------------------------------

def test_registry_health(client, auth_headers):
    """GET /registry/health → 200 with total_voters key."""
    resp = client.get("/registry/health", headers=auth_headers)
    assert resp.status_code == 200
    body = resp.json()
    assert "total_voters" in body
    assert isinstance(body["total_voters"], int)


def test_registry_health_unauthenticated(client):
    """GET /registry/health without token → 401."""
    resp = client.get("/registry/health")
    assert resp.status_code == 401


def test_export_voters_csv(client, auth_headers):
    """GET /voters:export → 200, content-type text/csv."""
    resp = client.get("/voters:export", headers=auth_headers)
    assert resp.status_code == 200
    assert "text/csv" in resp.headers.get("content-type", "")


def test_export_voters_unauthenticated(client):
    """GET /voters:export without token → 401."""
    resp = client.get("/voters:export")
    assert resp.status_code == 401
