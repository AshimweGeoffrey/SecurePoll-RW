"""Integration tests — encryption keys module."""
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
def created_key_id(client, auth_headers):
    resp = client.post("/keys", headers=auth_headers,
                       json={"title": "Integration Test Key",
                             "algorithm": "AES-256-GCM",
                             "scope": "integration-tests"})
    assert resp.status_code == 201
    return resp.json()["id"]


# ---------------------------------------------------------------------------
# Health
# ---------------------------------------------------------------------------

def test_keys_health_authenticated(client, auth_headers):
    resp = client.get("/keys/health", headers=auth_headers)
    assert resp.status_code == 200
    body = resp.json()
    assert body["healthy"] is True
    assert "key_count" in body
    assert isinstance(body["keys"], list)


def test_keys_health_unauthenticated(client):
    resp = client.get("/keys/health")
    assert resp.status_code == 401


def test_keys_health_writes_audit(client, auth_headers):
    resp = client.get("/keys/health", headers=auth_headers)
    assert resp.status_code == 200
    audit = client.get("/audit/entries", headers=auth_headers,
                       params={"service": "Keys", "limit": 5})
    assert audit.status_code == 200
    actions = [e["action"] for e in audit.json()["items"]]
    assert "HSM_HEALTHCHECK" in actions


# ---------------------------------------------------------------------------
# List
# ---------------------------------------------------------------------------

def test_list_keys_authenticated(client, auth_headers):
    resp = client.get("/keys", headers=auth_headers)
    assert resp.status_code == 200
    body = resp.json()
    assert "total" in body
    assert "items" in body


def test_list_keys_unauthenticated(client):
    resp = client.get("/keys")
    assert resp.status_code == 401


# ---------------------------------------------------------------------------
# Create
# ---------------------------------------------------------------------------

def test_create_key(client, auth_headers):
    payload = {"title": "Backup Key 2026", "algorithm": "AES-256-GCM", "scope": "backups"}
    resp = client.post("/keys", headers=auth_headers, json=payload)
    assert resp.status_code == 201
    body = resp.json()
    assert body["title"] == "Backup Key 2026"
    assert body["algorithm"] == "AES-256-GCM"
    assert body["current_version"] == 1
    assert "id" in body


def test_create_key_minimal(client, auth_headers):
    resp = client.post("/keys", headers=auth_headers, json={"title": "Minimal Key"})
    assert resp.status_code == 201
    assert resp.json()["algorithm"] == "AES-256-GCM"


def test_create_key_missing_title(client, auth_headers):
    resp = client.post("/keys", headers=auth_headers, json={"algorithm": "AES-256-GCM"})
    assert resp.status_code == 422


def test_create_key_unauthenticated(client):
    resp = client.post("/keys", json={"title": "Hack Key"})
    assert resp.status_code == 401


# ---------------------------------------------------------------------------
# Get single
# ---------------------------------------------------------------------------

def test_get_key_by_id(client, auth_headers, created_key_id):
    resp = client.get(f"/keys/{created_key_id}", headers=auth_headers)
    assert resp.status_code == 200
    body = resp.json()
    assert body["id"] == created_key_id
    assert "title" in body
    assert "current_version" in body


def test_get_key_not_found(client, auth_headers):
    resp = client.get("/keys/00000000-0000-0000-0000-000000000000", headers=auth_headers)
    assert resp.status_code == 404


def test_get_key_invalid_uuid(client, auth_headers):
    resp = client.get("/keys/not-a-uuid", headers=auth_headers)
    assert resp.status_code == 422


def test_get_key_unauthenticated(client, created_key_id):
    resp = client.get(f"/keys/{created_key_id}")
    assert resp.status_code == 401


# ---------------------------------------------------------------------------
# Rotate
# ---------------------------------------------------------------------------

def test_rotate_key_increments_version(client, auth_headers, created_key_id):
    before = client.get(f"/keys/{created_key_id}", headers=auth_headers).json()
    resp = client.post(f"/keys/{created_key_id}:rotate", headers=auth_headers)
    assert resp.status_code == 200
    after = resp.json()
    assert after["current_version"] == before["current_version"] + 1


def test_rotate_key_writes_audit(client, auth_headers, created_key_id):
    client.post(f"/keys/{created_key_id}:rotate", headers=auth_headers)
    audit = client.get("/audit/entries", headers=auth_headers,
                       params={"service": "Keys", "limit": 10})
    actions = [e["action"] for e in audit.json()["items"]]
    assert "KEY_ROTATED" in actions


def test_rotate_key_not_found(client, auth_headers):
    resp = client.post("/keys/00000000-0000-0000-0000-000000000000:rotate",
                       headers=auth_headers)
    assert resp.status_code == 404


def test_rotate_key_unauthenticated(client, created_key_id):
    resp = client.post(f"/keys/{created_key_id}:rotate")
    assert resp.status_code == 401


def test_rotate_idempotent_shape(client, auth_headers, created_key_id):
    resp1 = client.post(f"/keys/{created_key_id}:rotate", headers=auth_headers)
    resp2 = client.post(f"/keys/{created_key_id}:rotate", headers=auth_headers)
    assert resp2.json()["current_version"] == resp1.json()["current_version"] + 1
