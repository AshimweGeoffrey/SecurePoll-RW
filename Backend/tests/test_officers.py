"""Integration tests — officers module."""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock


@pytest.fixture(scope="module")
def client():
    with patch("ml.inference.load_models"), \
         patch("ml.inference._face_model", MagicMock()), \
         patch("ml.inference._faiss_index", MagicMock(ntotal=0)):
        from app.main import app
        return TestClient(app, raise_server_exceptions=False)


@pytest.fixture(scope="module")
def auth_headers(client):
    resp = client.post("/auth/login",
                       json={"email": "admin@securepoll.rw", "password": "SecurePassword123!"})
    assert resp.status_code == 200, f"Login failed: {resp.text}"
    return {"Authorization": f"Bearer {resp.json()['access_token']}"}


@pytest.fixture(scope="module")
def first_officer_id(client, auth_headers):
    resp = client.get("/officers", headers=auth_headers, params={"limit": 1})
    assert resp.status_code == 200
    items = resp.json().get("items", [])
    assert items, "No officers in DB — run seed.py first"
    return items[0]["id"]


@pytest.fixture(scope="module")
def created_officer_id(client, auth_headers):
    resp = client.post("/officers", headers=auth_headers,
                       json={"name": "Integration Test Officer", "team": "Alpha"})
    assert resp.status_code == 201
    return resp.json()["id"]


# ---------------------------------------------------------------------------
# List
# ---------------------------------------------------------------------------

def test_list_officers_authenticated(client, auth_headers):
    resp = client.get("/officers", headers=auth_headers)
    assert resp.status_code == 200
    body = resp.json()
    assert "total" in body
    assert "items" in body
    assert body["total"] > 0


def test_list_officers_unauthenticated(client):
    resp = client.get("/officers")
    assert resp.status_code == 401


def test_list_officers_pagination(client, auth_headers):
    resp = client.get("/officers", headers=auth_headers, params={"skip": 0, "limit": 3})
    assert resp.status_code == 200
    assert len(resp.json()["items"]) <= 3


def test_list_officers_district_filter(client, auth_headers):
    resp = client.get("/officers", headers=auth_headers,
                      params={"district_id": "00000000-0000-0000-0000-000000000001"})
    assert resp.status_code == 200
    assert isinstance(resp.json()["items"], list)


# ---------------------------------------------------------------------------
# Get single
# ---------------------------------------------------------------------------

def test_get_officer_by_id(client, auth_headers, first_officer_id):
    resp = client.get(f"/officers/{first_officer_id}", headers=auth_headers)
    assert resp.status_code == 200
    body = resp.json()
    assert body["id"] == first_officer_id
    assert "name" in body


def test_get_officer_not_found(client, auth_headers):
    resp = client.get("/officers/00000000-0000-0000-0000-000000000000", headers=auth_headers)
    assert resp.status_code == 404


def test_get_officer_invalid_uuid(client, auth_headers):
    resp = client.get("/officers/not-a-uuid", headers=auth_headers)
    assert resp.status_code == 422


def test_get_officer_unauthenticated(client, first_officer_id):
    resp = client.get(f"/officers/{first_officer_id}")
    assert resp.status_code == 401


# ---------------------------------------------------------------------------
# Create
# ---------------------------------------------------------------------------

def test_create_officer(client, auth_headers):
    resp = client.post("/officers", headers=auth_headers,
                       json={"name": "Officer Bravo", "team": "Bravo Team"})
    assert resp.status_code == 201
    body = resp.json()
    assert body["name"] == "Officer Bravo"
    assert body["team"] == "Bravo Team"
    assert "id" in body


def test_create_officer_minimal(client, auth_headers):
    resp = client.post("/officers", headers=auth_headers, json={"name": "Min Officer"})
    assert resp.status_code == 201
    assert resp.json()["name"] == "Min Officer"


def test_create_officer_missing_name(client, auth_headers):
    resp = client.post("/officers", headers=auth_headers, json={"team": "NoName"})
    assert resp.status_code == 422


def test_create_officer_unauthenticated(client):
    resp = client.post("/officers", json={"name": "Hack"})
    assert resp.status_code == 401


# ---------------------------------------------------------------------------
# Update
# ---------------------------------------------------------------------------

def test_update_officer(client, auth_headers, created_officer_id):
    resp = client.patch(f"/officers/{created_officer_id}", headers=auth_headers,
                        json={"name": "Updated Name", "team": "Delta"})
    assert resp.status_code == 200
    body = resp.json()
    assert body["name"] == "Updated Name"
    assert body["team"] == "Delta"


def test_update_officer_partial(client, auth_headers, created_officer_id):
    resp = client.patch(f"/officers/{created_officer_id}", headers=auth_headers,
                        json={"team": "Echo"})
    assert resp.status_code == 200
    assert resp.json()["team"] == "Echo"


def test_update_officer_not_found(client, auth_headers):
    resp = client.patch("/officers/00000000-0000-0000-0000-000000000000",
                        headers=auth_headers, json={"name": "Ghost"})
    assert resp.status_code == 404


def test_update_officer_unauthenticated(client, first_officer_id):
    resp = client.patch(f"/officers/{first_officer_id}", json={"name": "Hack"})
    assert resp.status_code == 401


# ---------------------------------------------------------------------------
# Stats
# ---------------------------------------------------------------------------

def test_officer_stats(client, auth_headers, first_officer_id):
    resp = client.get(f"/officers/{first_officer_id}/stats", headers=auth_headers)
    assert resp.status_code == 200
    body = resp.json()
    assert "total" in body
    assert "approved" in body
    assert "manual_review" in body
    assert "rejected" in body


def test_officer_stats_not_found(client, auth_headers):
    resp = client.get("/officers/00000000-0000-0000-0000-000000000000/stats",
                      headers=auth_headers)
    assert resp.status_code == 404


def test_officer_stats_unauthenticated(client, first_officer_id):
    resp = client.get(f"/officers/{first_officer_id}/stats")
    assert resp.status_code == 401


# ---------------------------------------------------------------------------
# Delete
# ---------------------------------------------------------------------------

def test_delete_officer(client, auth_headers, created_officer_id):
    resp = client.delete(f"/officers/{created_officer_id}", headers=auth_headers)
    assert resp.status_code == 204

    confirm = client.get(f"/officers/{created_officer_id}", headers=auth_headers)
    assert confirm.status_code == 404


def test_delete_officer_not_found(client, auth_headers):
    resp = client.delete("/officers/00000000-0000-0000-0000-000000000000",
                         headers=auth_headers)
    assert resp.status_code == 404


def test_delete_officer_unauthenticated(client, first_officer_id):
    resp = client.delete(f"/officers/{first_officer_id}")
    assert resp.status_code == 401
