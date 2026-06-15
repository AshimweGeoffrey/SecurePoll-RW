"""Integration tests — verification module (1:1 verify, vote casting)."""
import base64
import io
import pytest
import numpy as np
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _fake_jpeg() -> bytes:
    from PIL import Image
    buf = io.BytesIO()
    Image.new("RGB", (1, 1), (255, 255, 255)).save(buf, format="JPEG")
    return buf.getvalue()


FAKE_EMBEDDING = np.random.rand(512).astype(np.float32)
FAKE_EMBEDDING /= np.linalg.norm(FAKE_EMBEDDING)


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

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
def geo_ids(client, auth_headers):
    """Return (district_id, station_id) from seeded data."""
    stations = client.get("/polling-stations", headers=auth_headers, params={"limit": 1})
    s = stations.json()["items"][0]
    return s["district_id"], s["id"]


@pytest.fixture(scope="module")
def officer_id(client, auth_headers):
    resp = client.get("/officers", headers=auth_headers, params={"limit": 1})
    return resp.json()["items"][0]["id"]


@pytest.fixture(scope="module")
def seeded_voter(client, auth_headers):
    """Return first voter with a biometric template."""
    templates = client.get("/biometrics/templates", headers=auth_headers, params={"limit": 1})
    voter_id = templates.json()["items"][0]["voter_id"]
    voter = client.get(f"/voters/{voter_id}", headers=auth_headers).json()
    return voter


@pytest.fixture(scope="module")
def verification_attempt_id(client, auth_headers, seeded_voter, officer_id, geo_ids):
    """Create one verification attempt and return its ID."""
    _, station_id = geo_ids
    encoded = base64.b64encode(_fake_jpeg()).decode()

    with patch("ml.inference.embed_face", return_value=FAKE_EMBEDDING.copy()), \
         patch("ml.inference.check_liveness", return_value=("live", 0.95)), \
         patch("app.core.crypto.decrypt_template", return_value=FAKE_EMBEDDING.tobytes()):
        resp = client.post("/verifications", json={
            "voter_token": seeded_voter["voter_token"],
            "polling_station_id": station_id,
            "officer_id": officer_id,
            "face_image": encoded,
        })
    if resp.status_code != 200:
        pytest.skip(f"Verification creation failed ({resp.status_code}): {resp.text}")
    return resp.json()["id"]


# ---------------------------------------------------------------------------
# POST /verifications
# ---------------------------------------------------------------------------

def test_verify_voter_success(client, seeded_voter, officer_id, geo_ids):
    _, station_id = geo_ids
    encoded = base64.b64encode(_fake_jpeg()).decode()

    with patch("ml.inference.embed_face", return_value=FAKE_EMBEDDING.copy()), \
         patch("ml.inference.check_liveness", return_value=("live", 0.95)), \
         patch("app.core.crypto.decrypt_template", return_value=FAKE_EMBEDDING.tobytes()):
        resp = client.post("/verifications", json={
            "voter_token": seeded_voter["voter_token"],
            "polling_station_id": station_id,
            "officer_id": officer_id,
            "face_image": encoded,
        })

    assert resp.status_code == 200
    body = resp.json()
    assert "id" in body
    assert body["result"] in ("approved", "manual_review", "rejected")
    assert 0.0 <= body["confidence"] <= 1.0
    assert "decision" in body
    assert "flags" in body


def test_verify_voter_token_not_found(client, officer_id, geo_ids):
    _, station_id = geo_ids
    resp = client.post("/verifications", json={
        "voter_token": "NO-SUCH-TOKEN",
        "polling_station_id": station_id,
        "officer_id": officer_id,
        "face_image": base64.b64encode(b"fake").decode(),
    })
    assert resp.status_code == 404


def test_verify_voter_missing_fields(client):
    resp = client.post("/verifications", json={"voter_token": "X"})
    assert resp.status_code == 422


def test_verify_blocked_voter(client, auth_headers, seeded_voter, officer_id, geo_ids):
    """A blocked voter should be rejected (400), not verified."""
    _, station_id = geo_ids
    voter_id = seeded_voter["id"]

    # Block the voter first
    client.post(f"/voters/{voter_id}:block", headers=auth_headers, params={"reason": "test"})

    encoded = base64.b64encode(_fake_jpeg()).decode()
    resp = client.post("/verifications", json={
        "voter_token": seeded_voter["voter_token"],
        "polling_station_id": station_id,
        "officer_id": officer_id,
        "face_image": encoded,
    })
    assert resp.status_code == 400
    assert "not eligible" in resp.json()["detail"].lower()

    # Restore for other tests
    client.post(f"/voters/{voter_id}:restore", headers=auth_headers)


# ---------------------------------------------------------------------------
# GET /verifications
# ---------------------------------------------------------------------------

def test_list_verifications_authenticated(client, auth_headers):
    resp = client.get("/verifications", headers=auth_headers)
    assert resp.status_code == 200
    body = resp.json()
    assert "total" in body
    assert "items" in body


def test_list_verifications_unauthenticated(client):
    resp = client.get("/verifications")
    assert resp.status_code == 401


def test_list_verifications_station_filter(client, auth_headers, geo_ids):
    _, station_id = geo_ids
    resp = client.get("/verifications", headers=auth_headers,
                      params={"station_id": station_id})
    assert resp.status_code == 200
    for item in resp.json()["items"]:
        assert item["polling_station_id"] == station_id


def test_list_verifications_pagination(client, auth_headers):
    resp = client.get("/verifications", headers=auth_headers, params={"limit": 2})
    assert resp.status_code == 200
    assert len(resp.json()["items"]) <= 2


# ---------------------------------------------------------------------------
# GET /verifications/{id}
# ---------------------------------------------------------------------------

def test_get_verification_by_id(client, auth_headers, verification_attempt_id):
    resp = client.get(f"/verifications/{verification_attempt_id}", headers=auth_headers)
    assert resp.status_code == 200
    body = resp.json()
    assert body["id"] == verification_attempt_id
    assert "result" in body
    assert "confidence" in body
    assert "liveness" in body


def test_get_verification_not_found(client, auth_headers):
    resp = client.get("/verifications/00000000-0000-0000-0000-000000000000",
                      headers=auth_headers)
    assert resp.status_code == 404


def test_get_verification_unauthenticated(client, verification_attempt_id):
    resp = client.get(f"/verifications/{verification_attempt_id}")
    assert resp.status_code == 401


# ---------------------------------------------------------------------------
# POST /verifications/{id}:override
# ---------------------------------------------------------------------------

def test_override_verification(client, auth_headers, verification_attempt_id):
    resp = client.post(
        f"/verifications/{verification_attempt_id}:override",
        headers=auth_headers,
        params={"override_result": "approved", "reason": "Supervisor override for testing"},
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "overridden"
    assert resp.json()["new_result"] == "approved"


def test_override_invalid_result(client, auth_headers, verification_attempt_id):
    resp = client.post(
        f"/verifications/{verification_attempt_id}:override",
        headers=auth_headers,
        params={"override_result": "not_a_valid_result", "reason": "test"},
    )
    assert resp.status_code == 400


def test_override_not_found(client, auth_headers):
    resp = client.post(
        "/verifications/00000000-0000-0000-0000-000000000000:override",
        headers=auth_headers,
        params={"override_result": "approved", "reason": "test"},
    )
    assert resp.status_code == 404


def test_override_unauthenticated(client, verification_attempt_id):
    resp = client.post(f"/verifications/{verification_attempt_id}:override",
                       params={"override_result": "approved", "reason": "test"})
    assert resp.status_code == 401


# ---------------------------------------------------------------------------
# GET /verifications/station/{station_id}/log
# ---------------------------------------------------------------------------

def test_station_log(client, auth_headers, geo_ids):
    _, station_id = geo_ids
    resp = client.get(f"/verifications/station/{station_id}/log", headers=auth_headers)
    assert resp.status_code == 200
    body = resp.json()
    assert body["station_id"] == station_id
    assert "total" in body
    assert "attempts" in body
    assert "approved" in body


def test_station_log_unauthenticated(client, geo_ids):
    _, station_id = geo_ids
    resp = client.get(f"/verifications/station/{station_id}/log")
    assert resp.status_code == 401


# ---------------------------------------------------------------------------
# POST /votes (double-vote protection)
# ---------------------------------------------------------------------------

def test_cast_vote_voter_not_found(client, officer_id, geo_ids):
    _, station_id = geo_ids
    resp = client.post("/votes", json={
        "voter_id": "00000000-0000-0000-0000-000000000000",
        "officer_id": officer_id,
        "polling_station_id": station_id,
    })
    assert resp.status_code == 404


def test_cast_vote_missing_fields(client):
    resp = client.post("/votes", json={})
    assert resp.status_code == 422


def test_double_vote_returns_409(client, auth_headers, officer_id, geo_ids):
    """Create a fresh voter, vote once (200), then attempt a second vote (409)."""
    district_id, station_id = geo_ids

    # Create a throwaway voter
    resp = client.post("/voters", headers=auth_headers, json={
        "voter_token": "VOTE-TEST-DOUBLE-0001",
        "registration_ref": "#VOTE-DOUBLE-0001",
        "national_id": "8888888888888888",
        "first_name": "Double",
        "last_name": "VoteTest",
        "sex": "female",
        "date_of_birth": "1985-03-15",
        "district_id": district_id,
        "polling_station_id": station_id,
    })
    assert resp.status_code == 201
    voter_id = resp.json()["id"]

    vote_payload = {
        "voter_id": voter_id,
        "officer_id": officer_id,
        "polling_station_id": station_id,
    }

    first = client.post("/votes", json=vote_payload)
    assert first.status_code == 200
    assert first.json()["status"] == "voted"

    second = client.post("/votes", json=vote_payload)
    assert second.status_code == 409
    assert "already voted" in second.json()["detail"].lower()


def test_vote_blocked_voter(client, auth_headers, officer_id, geo_ids):
    district_id, station_id = geo_ids

    resp = client.post("/voters", headers=auth_headers, json={
        "voter_token": "VOTE-TEST-BLOCKED-0001",
        "registration_ref": "#VOTE-BLOCKED-0001",
        "national_id": "7777777777777777",
        "first_name": "Blocked",
        "last_name": "VoteTest",
        "sex": "male",
        "date_of_birth": "1992-07-22",
        "district_id": district_id,
        "polling_station_id": station_id,
    })
    assert resp.status_code == 201
    voter_id = resp.json()["id"]

    client.post(f"/voters/{voter_id}:block", headers=auth_headers,
                params={"reason": "test block"})

    vote_resp = client.post("/votes", json={
        "voter_id": voter_id,
        "officer_id": officer_id,
        "polling_station_id": station_id,
    })
    assert vote_resp.status_code == 400
    assert "not eligible" in vote_resp.json()["detail"].lower()
