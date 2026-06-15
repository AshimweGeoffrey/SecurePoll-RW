"""Integration tests — biometrics module (enroll, templates, dedup-scan)."""
import base64
import io
import uuid
import pytest
import numpy as np
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _fake_jpeg() -> bytes:
    """Return a minimal valid JPEG payload that PIL can open (1×1 white pixel)."""
    from PIL import Image
    buf = io.BytesIO()
    Image.new("RGB", (1, 1), (255, 255, 255)).save(buf, format="JPEG")
    return buf.getvalue()


FAKE_EMBEDDING = np.random.rand(512).astype(np.float32)
FAKE_EMBEDDING /= np.linalg.norm(FAKE_EMBEDDING)   # L2-normalise


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
def fresh_voter_id(client, auth_headers):
    """Create a voter without a biometric template for enrolment tests."""
    stations = client.get("/polling-stations", headers=auth_headers, params={"limit": 1})
    station_id = stations.json()["items"][0]["id"]
    district_id = stations.json()["items"][0]["district_id"]

    resp = client.post("/voters", headers=auth_headers, json={
        "voter_token": "BIO-TEST-9999-ZZZZ",
        "registration_ref": "#BIO-TEST-9999",
        "national_id": "9999999999999999",
        "first_name": "Biometric",
        "last_name": "TestUser",
        "sex": "male",
        "date_of_birth": "1990-06-01",
        "district_id": district_id,
        "polling_station_id": station_id,
    })
    assert resp.status_code == 201, f"Create voter failed: {resp.text}"
    return resp.json()["id"]


@pytest.fixture(scope="module")
def seeded_voter_with_template(client, auth_headers):
    """Return the voter_id of any voter in the seeded DB that has a template."""
    resp = client.get("/biometrics/templates", headers=auth_headers, params={"limit": 1})
    assert resp.status_code == 200
    items = resp.json().get("items", [])
    assert items, "No biometric templates in DB — run seed.py first"
    return items[0]["voter_id"]


# ---------------------------------------------------------------------------
# Template list
# ---------------------------------------------------------------------------

def test_list_templates_authenticated(client, auth_headers):
    resp = client.get("/biometrics/templates", headers=auth_headers)
    assert resp.status_code == 200
    body = resp.json()
    assert "total" in body
    assert "items" in body
    assert body["total"] > 0


def test_list_templates_unauthenticated(client):
    resp = client.get("/biometrics/templates")
    assert resp.status_code == 401


def test_list_templates_pagination(client, auth_headers):
    resp = client.get("/biometrics/templates", headers=auth_headers,
                      params={"skip": 0, "limit": 2})
    assert resp.status_code == 200
    assert len(resp.json()["items"]) <= 2


def test_template_item_shape(client, auth_headers):
    resp = client.get("/biometrics/templates", headers=auth_headers, params={"limit": 1})
    item = resp.json()["items"][0]
    assert "id" in item
    assert "voter_id" in item
    assert "modality" in item
    assert "quality_score" in item
    assert "liveness_passed" in item


# ---------------------------------------------------------------------------
# Quality endpoint
# ---------------------------------------------------------------------------

def test_get_template_quality(client, auth_headers, seeded_voter_with_template):
    resp = client.get(f"/biometrics/quality/{seeded_voter_with_template}",
                      headers=auth_headers)
    assert resp.status_code == 200
    body = resp.json()
    assert "quality_score" in body
    assert "liveness_passed" in body


def test_get_template_quality_not_found(client, auth_headers):
    resp = client.get("/biometrics/quality/00000000-0000-0000-0000-000000000000",
                      headers=auth_headers)
    assert resp.status_code == 404


def test_get_template_quality_unauthenticated(client, seeded_voter_with_template):
    resp = client.get(f"/biometrics/quality/{seeded_voter_with_template}")
    assert resp.status_code == 401


# ---------------------------------------------------------------------------
# Enroll face
# ---------------------------------------------------------------------------

def test_enroll_face_success(client, auth_headers, fresh_voter_id):
    encoded_image = base64.b64encode(_fake_jpeg()).decode()

    with patch("ml.inference.embed_face", return_value=FAKE_EMBEDDING.copy()), \
         patch("ml.inference.check_liveness", return_value=("live", 0.95)), \
         patch("ml.inference.faiss_add", return_value=9000), \
         patch("ml.inference.faiss_search",
               return_value=(np.array([0.3], dtype=np.float32), np.array([-1]))), \
         patch("ml.inference.faiss_save"):

        resp = client.post("/biometrics/enroll", headers=auth_headers, data={
            "voter_id": fresh_voter_id,
            "face_image": encoded_image,
        })

    assert resp.status_code == 200
    body = resp.json()
    assert body["voter_id"] == fresh_voter_id
    assert body["liveness_passed"] is True
    assert "quality_score" in body
    assert "captured_at" in body


def test_enroll_face_voter_not_found(client, auth_headers):
    encoded_image = base64.b64encode(_fake_jpeg()).decode()
    with patch("ml.inference.embed_face", return_value=FAKE_EMBEDDING.copy()), \
         patch("ml.inference.check_liveness", return_value=("live", 0.95)), \
         patch("ml.inference.faiss_add", return_value=9001), \
         patch("ml.inference.faiss_save"):
        resp = client.post("/biometrics/enroll", headers=auth_headers, data={
            "voter_id": "00000000-0000-0000-0000-000000000000",
            "face_image": encoded_image,
        })
    assert resp.status_code == 404


def test_enroll_face_invalid_base64(client, auth_headers, fresh_voter_id):
    with patch("ml.inference.embed_face", return_value=FAKE_EMBEDDING.copy()), \
         patch("ml.inference.check_liveness", return_value=("live", 0.95)), \
         patch("ml.inference.faiss_add", return_value=9002), \
         patch("ml.inference.faiss_save"):
        resp = client.post("/biometrics/enroll", headers=auth_headers, data={
            "voter_id": fresh_voter_id,
            "face_image": "NOT_VALID_BASE64!!!",
        })
    assert resp.status_code == 400


def test_enroll_face_no_face_detected(client, auth_headers, fresh_voter_id):
    encoded_image = base64.b64encode(_fake_jpeg()).decode()
    with patch("ml.inference.embed_face",
               side_effect=ValueError("No face detected in image")), \
         patch("ml.inference.faiss_save"):
        resp = client.post("/biometrics/enroll", headers=auth_headers, data={
            "voter_id": fresh_voter_id,
            "face_image": encoded_image,
        })
    assert resp.status_code == 400
    assert "face" in resp.json()["detail"].lower()


def test_enroll_face_spoof_detected(client, auth_headers, fresh_voter_id):
    encoded_image = base64.b64encode(_fake_jpeg()).decode()
    with patch("ml.inference.embed_face", return_value=FAKE_EMBEDDING.copy()), \
         patch("ml.inference.check_liveness", return_value=("spoof", 0.95)), \
         patch("ml.inference.faiss_save"):
        resp = client.post("/biometrics/enroll", headers=auth_headers, data={
            "voter_id": fresh_voter_id,
            "face_image": encoded_image,
        })
    assert resp.status_code == 400
    assert "liveness" in resp.json()["detail"].lower()


def test_enroll_unauthenticated(client, fresh_voter_id):
    resp = client.post("/biometrics/enroll", data={
        "voter_id": fresh_voter_id,
        "face_image": base64.b64encode(b"fake").decode(),
    })
    assert resp.status_code == 401


# ---------------------------------------------------------------------------
# Dedup scan
# ---------------------------------------------------------------------------

def test_dedup_scan_no_template(client, auth_headers):
    fresh_id = str(uuid.uuid4())
    resp = client.post(f"/biometrics/dedup-scan/{fresh_id}", headers=auth_headers)
    # Either 404 (voter not found) or 400 (no template) — both valid
    assert resp.status_code in (400, 404)


def test_dedup_scan_unauthenticated(client, seeded_voter_with_template):
    resp = client.post(f"/biometrics/dedup-scan/{seeded_voter_with_template}")
    assert resp.status_code == 401


# ---------------------------------------------------------------------------
# Delete template
# ---------------------------------------------------------------------------

def test_delete_template_unauthenticated(client, seeded_voter_with_template):
    resp = client.delete(f"/biometrics/templates/{seeded_voter_with_template}")
    assert resp.status_code == 401


def test_delete_template_not_found(client, auth_headers):
    resp = client.delete("/biometrics/templates/00000000-0000-0000-0000-000000000000",
                         headers=auth_headers)
    assert resp.status_code == 404
