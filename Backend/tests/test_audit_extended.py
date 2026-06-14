"""Audit module extended tests — entries list, filtering, chain verify, export."""
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


@pytest.fixture(scope="module")
def first_audit_entry_id(client, auth_headers):
    """Return the UUID of the first audit entry (or None if empty)."""
    resp = client.get("/audit/entries?limit=1", headers=auth_headers)
    assert resp.status_code == 200
    items = resp.json().get("items", [])
    if items:
        return items[0]["id"]
    return None


# ---------------------------------------------------------------------------
# List audit entries
# ---------------------------------------------------------------------------

def test_list_audit_entries(client, auth_headers):
    """GET /audit/entries → 200 with total >= 0 and items list."""
    resp = client.get("/audit/entries", headers=auth_headers)
    assert resp.status_code == 200
    body = resp.json()
    assert "total" in body
    assert body["total"] >= 0
    assert isinstance(body["items"], list)


def test_list_audit_entries_pagination(client, auth_headers):
    """GET /audit/entries?skip=0&limit=5 → 200, items <= 5."""
    resp = client.get("/audit/entries?skip=0&limit=5", headers=auth_headers)
    assert resp.status_code == 200
    assert len(resp.json()["items"]) <= 5


def test_list_audit_entries_filtered_by_action(client, auth_headers):
    """GET /audit/entries?action=LOGIN → 200, all entries have action LOGIN."""
    resp = client.get("/audit/entries?action=LOGIN", headers=auth_headers)
    assert resp.status_code == 200
    body = resp.json()
    items = body["items"]
    # If there are any entries, they should all have action == "LOGIN"
    for entry in items:
        assert entry["action"] == "LOGIN"


def test_list_audit_entries_filtered_by_service(client, auth_headers):
    """GET /audit/entries?service=Auth → 200, all entries have service Auth."""
    resp = client.get("/audit/entries?service=Auth", headers=auth_headers)
    assert resp.status_code == 200
    body = resp.json()
    items = body["items"]
    for entry in items:
        assert entry["service"] == "Auth"


def test_list_audit_entries_filtered_by_actor(client, auth_headers):
    """GET /audit/entries?actor_id=system → 200, items returned."""
    resp = client.get("/audit/entries?actor_id=system", headers=auth_headers)
    assert resp.status_code == 200
    assert "items" in resp.json()


def test_audit_unauthenticated(client):
    """GET /audit/entries without token → 401."""
    resp = client.get("/audit/entries")
    assert resp.status_code == 401


# ---------------------------------------------------------------------------
# Get audit entry by id
# ---------------------------------------------------------------------------

def test_get_audit_entry_by_id(client, auth_headers, first_audit_entry_id):
    """GET /audit/entries/{id} → 200 with entry data including sequence and action."""
    if first_audit_entry_id is None:
        pytest.skip("No audit entries in DB")
    resp = client.get(f"/audit/entries/{first_audit_entry_id}", headers=auth_headers)
    assert resp.status_code == 200
    body = resp.json()
    assert body["id"] == first_audit_entry_id
    assert "sequence" in body
    assert "action" in body
    assert "entry_hash" in body


def test_get_audit_entry_not_found(client, auth_headers):
    """GET /audit/entries/<zero-UUID> → 404."""
    resp = client.get(
        "/audit/entries/00000000-0000-0000-0000-000000000000",
        headers=auth_headers,
    )
    assert resp.status_code == 404


def test_get_audit_entry_invalid_uuid(client, auth_headers):
    """GET /audit/entries/not-a-uuid → 422."""
    resp = client.get("/audit/entries/not-a-valid-uuid", headers=auth_headers)
    assert resp.status_code == 422


def test_get_audit_entry_unauthenticated(client):
    """GET /audit/entries/{id} without token → 401."""
    resp = client.get("/audit/entries/00000000-0000-0000-0000-000000000000")
    assert resp.status_code == 401


# ---------------------------------------------------------------------------
# Chain verification
# ---------------------------------------------------------------------------

def test_verify_chain_no_breaks(client, auth_headers):
    """POST /audit:verify-chain → 200, breaks_found == 0 on an unmodified chain."""
    resp = client.post("/audit:verify-chain", headers=auth_headers)
    assert resp.status_code == 200
    body = resp.json()
    assert "breaks_found" in body
    assert "entries_walked" in body
    # For a healthy, unmodified chain there should be zero breaks
    assert body["breaks_found"] == 0


def test_verify_chain_response_structure(client, auth_headers):
    """POST /audit:verify-chain → response includes all ChainVerificationResponse fields."""
    resp = client.post("/audit:verify-chain", headers=auth_headers)
    assert resp.status_code == 200
    body = resp.json()
    for field in ("entries_walked", "breaks_found", "verified_at"):
        assert field in body, f"Missing field: {field}"


def test_verify_chain_unauthenticated(client):
    """POST /audit:verify-chain without token → 401."""
    resp = client.post("/audit:verify-chain")
    assert resp.status_code == 401


# ---------------------------------------------------------------------------
# Audit export
# ---------------------------------------------------------------------------

def test_export_audit_csv(client, auth_headers):
    """GET /audit:export → 200, content-type text/csv."""
    resp = client.get("/audit:export", headers=auth_headers)
    assert resp.status_code == 200
    content_type = resp.headers.get("content-type", "")
    assert "text/csv" in content_type


def test_export_audit_csv_has_header_row(client, auth_headers):
    """GET /audit:export CSV body starts with expected column headers."""
    resp = client.get("/audit:export", headers=auth_headers)
    assert resp.status_code == 200
    content = resp.text
    first_line = content.splitlines()[0] if content.strip() else ""
    assert "sequence" in first_line
    assert "action" in first_line


def test_export_audit_unauthenticated(client):
    """GET /audit:export without token → 401."""
    resp = client.get("/audit:export")
    assert resp.status_code == 401
