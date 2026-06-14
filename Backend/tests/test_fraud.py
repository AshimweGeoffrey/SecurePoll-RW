"""Fraud module tests — cases, duplicates, anomaly signals."""
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
def first_fraud_case_id(client, auth_headers):
    """Return the id of the first fraud case in the DB (or None if empty)."""
    resp = client.get("/fraud/cases?limit=1", headers=auth_headers)
    assert resp.status_code == 200
    items = resp.json().get("items", [])
    if items:
        return items[0]["id"]
    return None


@pytest.fixture(scope="module")
def first_anomaly_id(client, auth_headers):
    """Return the id of the first anomaly signal in the DB (or None if empty)."""
    resp = client.get("/anomalies?limit=1", headers=auth_headers)
    assert resp.status_code == 200
    items = resp.json().get("items", [])
    if items:
        return items[0]["id"]
    return None


# ---------------------------------------------------------------------------
# Fraud cases
# ---------------------------------------------------------------------------

def test_list_fraud_cases(client, auth_headers):
    """GET /fraud/cases → 200 with total >= 0 and items list."""
    resp = client.get("/fraud/cases", headers=auth_headers)
    assert resp.status_code == 200
    body = resp.json()
    assert "total" in body
    assert body["total"] >= 0
    assert isinstance(body["items"], list)


def test_list_fraud_cases_pagination(client, auth_headers):
    """GET /fraud/cases?skip=0&limit=5 → 200, items <= 5."""
    resp = client.get("/fraud/cases?skip=0&limit=5", headers=auth_headers)
    assert resp.status_code == 200
    body = resp.json()
    assert len(body["items"]) <= 5


def test_fraud_cases_unauthenticated(client):
    """GET /fraud/cases without token → 401."""
    resp = client.get("/fraud/cases")
    assert resp.status_code == 401


def test_get_real_fraud_case(client, auth_headers, first_fraud_case_id):
    """GET /fraud/cases/{id} with a real case id → 200 with case data."""
    if first_fraud_case_id is None:
        pytest.skip("No fraud cases in DB")
    resp = client.get(f"/fraud/cases/{first_fraud_case_id}", headers=auth_headers)
    assert resp.status_code == 200
    body = resp.json()
    assert body["id"] == first_fraud_case_id
    assert "type" in body
    assert "risk_level" in body


def test_get_fraud_case_not_found(client, auth_headers):
    """GET /fraud/cases/NONEXISTENT → 404."""
    resp = client.get("/fraud/cases/NONEXISTENT-CASE-9999", headers=auth_headers)
    assert resp.status_code == 404


def test_get_fraud_case_unauthenticated(client):
    """GET /fraud/cases/{id} without token → 401."""
    resp = client.get("/fraud/cases/any-case-id")
    assert resp.status_code == 401


# ---------------------------------------------------------------------------
# Fraud summary
# ---------------------------------------------------------------------------

def test_get_fraud_summary(client, auth_headers):
    """GET /fraud/summary → 200 with total_cases and by_type."""
    resp = client.get("/fraud/summary", headers=auth_headers)
    assert resp.status_code == 200
    body = resp.json()
    assert "total_cases" in body
    assert isinstance(body["total_cases"], int)
    assert "by_type" in body


def test_get_fraud_summary_unauthenticated(client):
    """GET /fraud/summary without token → 401."""
    resp = client.get("/fraud/summary")
    assert resp.status_code == 401


# ---------------------------------------------------------------------------
# Case dismiss / escalate
# ---------------------------------------------------------------------------

def test_dismiss_case(client, auth_headers, first_fraud_case_id):
    """POST /fraud/cases/{id}:dismiss → 200 {"status": "dismissed"}."""
    if first_fraud_case_id is None:
        pytest.skip("No fraud cases in DB to dismiss")
    resp = client.post(f"/fraud/cases/{first_fraud_case_id}:dismiss", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["status"] == "dismissed"


def test_dismiss_nonexistent_case(client, auth_headers):
    """POST /fraud/cases/FAKE:dismiss → 404."""
    resp = client.post("/fraud/cases/FAKE-CASE-9999:dismiss", headers=auth_headers)
    assert resp.status_code == 404


def test_escalate_case(client, auth_headers, first_fraud_case_id):
    """POST /fraud/cases/{id}:escalate → 200 {"status": "escalated"}."""
    if first_fraud_case_id is None:
        pytest.skip("No fraud cases in DB to escalate")
    resp = client.post(f"/fraud/cases/{first_fraud_case_id}:escalate", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["status"] == "escalated"


def test_escalate_nonexistent_case(client, auth_headers):
    """POST /fraud/cases/FAKE:escalate → 404."""
    resp = client.post("/fraud/cases/FAKE-CASE-9999:escalate", headers=auth_headers)
    assert resp.status_code == 404


# ---------------------------------------------------------------------------
# Duplicates
# ---------------------------------------------------------------------------

def test_list_duplicates(client, auth_headers):
    """GET /duplicates → 200 with total >= 0 and items list."""
    resp = client.get("/duplicates", headers=auth_headers)
    assert resp.status_code == 200
    body = resp.json()
    assert "total" in body
    assert body["total"] >= 0
    assert isinstance(body["items"], list)


def test_list_duplicates_pagination(client, auth_headers):
    """GET /duplicates?skip=0&limit=5 → 200, items <= 5."""
    resp = client.get("/duplicates?skip=0&limit=5", headers=auth_headers)
    assert resp.status_code == 200
    assert len(resp.json()["items"]) <= 5


def test_list_duplicates_status_filter(client, auth_headers):
    """GET /duplicates?status=pending → 200 with list."""
    resp = client.get("/duplicates?status=pending", headers=auth_headers)
    assert resp.status_code == 200
    assert isinstance(resp.json()["items"], list)


def test_list_duplicates_unauthenticated(client):
    """GET /duplicates without token → 401."""
    resp = client.get("/duplicates")
    assert resp.status_code == 401


def test_merge_nonexistent_duplicate(client, auth_headers):
    """POST /duplicates/<zero-UUID>:merge → 404."""
    resp = client.post(
        "/duplicates/00000000-0000-0000-0000-000000000000:merge",
        json={"survivor_id": "00000000-0000-0000-0000-000000000001"},
        headers=auth_headers,
    )
    assert resp.status_code == 404


# ---------------------------------------------------------------------------
# Anomaly signals
# ---------------------------------------------------------------------------

def test_list_anomalies(client, auth_headers):
    """GET /anomalies → 200 with total >= 0 and items list."""
    resp = client.get("/anomalies", headers=auth_headers)
    assert resp.status_code == 200
    body = resp.json()
    assert "total" in body
    assert body["total"] >= 0
    assert isinstance(body["items"], list)


def test_list_anomalies_pagination(client, auth_headers):
    """GET /anomalies?skip=0&limit=5 → 200, items <= 5."""
    resp = client.get("/anomalies?skip=0&limit=5", headers=auth_headers)
    assert resp.status_code == 200
    assert len(resp.json()["items"]) <= 5


def test_list_anomalies_unauthenticated(client):
    """GET /anomalies without token → 401."""
    resp = client.get("/anomalies")
    assert resp.status_code == 401


def test_acknowledge_nonexistent_anomaly(client, auth_headers):
    """POST /anomalies/FAKE:acknowledge → 404."""
    resp = client.post("/anomalies/FAKE-ANOMALY-9999:acknowledge", headers=auth_headers)
    assert resp.status_code == 404


def test_mute_nonexistent_anomaly(client, auth_headers):
    """POST /anomalies/FAKE:mute → 404."""
    resp = client.post("/anomalies/FAKE-ANOMALY-9999:mute", headers=auth_headers)
    assert resp.status_code == 404


def test_acknowledge_real_anomaly(client, auth_headers, first_anomaly_id):
    """POST /anomalies/{id}:acknowledge with real id → 200 {"status": "acknowledged"}."""
    if first_anomaly_id is None:
        pytest.skip("No anomaly signals in DB")
    resp = client.post(f"/anomalies/{first_anomaly_id}:acknowledge", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["status"] == "acknowledged"


def test_mute_real_anomaly(client, auth_headers, first_anomaly_id):
    """POST /anomalies/{id}:mute with real id → 200 {"status": "muted"}."""
    if first_anomaly_id is None:
        pytest.skip("No anomaly signals in DB")
    resp = client.post(f"/anomalies/{first_anomaly_id}:mute", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["status"] == "muted"
