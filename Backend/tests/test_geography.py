"""Integration tests — geography module (districts + polling stations)."""
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
def first_district_id(client, auth_headers):
    resp = client.get("/districts", headers=auth_headers, params={"limit": 1})
    assert resp.status_code == 200
    items = resp.json().get("items", [])
    assert items, "No districts in DB — run seed.py first"
    return items[0]["id"]


@pytest.fixture(scope="module")
def first_station_id(client, auth_headers):
    resp = client.get("/polling-stations", headers=auth_headers, params={"limit": 1})
    assert resp.status_code == 200
    items = resp.json().get("items", [])
    assert items, "No polling stations in DB — run seed.py first"
    return items[0]["id"]


# ---------------------------------------------------------------------------
# Districts
# ---------------------------------------------------------------------------

def test_list_districts_authenticated(client, auth_headers):
    resp = client.get("/districts", headers=auth_headers)
    assert resp.status_code == 200
    body = resp.json()
    assert "total" in body
    assert "items" in body
    assert body["total"] > 0


def test_list_districts_unauthenticated(client):
    resp = client.get("/districts")
    assert resp.status_code == 401


def test_list_districts_province_filter(client, auth_headers):
    resp = client.get("/districts", headers=auth_headers, params={"province": "Kigali City"})
    assert resp.status_code == 200
    body = resp.json()
    for d in body["items"]:
        assert d["province"] == "Kigali City"


def test_list_districts_invalid_province(client, auth_headers):
    resp = client.get("/districts", headers=auth_headers, params={"province": "NOWHERE"})
    assert resp.status_code == 422


def test_list_districts_pagination(client, auth_headers):
    resp = client.get("/districts", headers=auth_headers, params={"skip": 0, "limit": 2})
    assert resp.status_code == 200
    assert len(resp.json()["items"]) <= 2


def test_get_district_by_id(client, auth_headers, first_district_id):
    resp = client.get(f"/districts/{first_district_id}", headers=auth_headers)
    assert resp.status_code == 200
    body = resp.json()
    assert body["id"] == first_district_id
    assert "code" in body
    assert "name" in body
    assert "province" in body


def test_get_district_not_found(client, auth_headers):
    resp = client.get("/districts/00000000-0000-0000-0000-000000000000", headers=auth_headers)
    assert resp.status_code == 404


def test_get_district_invalid_uuid(client, auth_headers):
    resp = client.get("/districts/not-a-uuid", headers=auth_headers)
    assert resp.status_code == 422


def test_create_district(client, auth_headers):
    payload = {
        "code": "INT-TEST-D1",
        "name": "Integration Test District",
        "province": "Kigali City",
    }
    resp = client.post("/districts", headers=auth_headers, json=payload)
    assert resp.status_code == 201
    body = resp.json()
    assert body["code"] == "INT-TEST-D1"
    assert body["name"] == "Integration Test District"
    assert "id" in body


def test_create_district_unauthenticated(client):
    resp = client.post("/districts", json={"code": "X", "name": "Y", "province": "Kigali City"})
    assert resp.status_code == 401


def test_create_district_missing_fields(client, auth_headers):
    resp = client.post("/districts", headers=auth_headers, json={"code": "NOPROV"})
    assert resp.status_code == 422


def test_patch_district(client, auth_headers, first_district_id):
    resp = client.patch(
        f"/districts/{first_district_id}",
        headers=auth_headers,
        json={"boundary_ref": "geojson://test-boundary"},
    )
    assert resp.status_code == 200
    assert resp.json()["boundary_ref"] == "geojson://test-boundary"


def test_patch_district_not_found(client, auth_headers):
    resp = client.patch(
        "/districts/00000000-0000-0000-0000-000000000000",
        headers=auth_headers,
        json={"name": "Ghost"},
    )
    assert resp.status_code == 404


def test_patch_district_unauthenticated(client, first_district_id):
    resp = client.patch(f"/districts/{first_district_id}", json={"name": "Hack"})
    assert resp.status_code == 401


# ---------------------------------------------------------------------------
# Polling Stations
# ---------------------------------------------------------------------------

def test_list_stations_authenticated(client, auth_headers):
    resp = client.get("/polling-stations", headers=auth_headers)
    assert resp.status_code == 200
    body = resp.json()
    assert "total" in body
    assert "items" in body
    assert body["total"] > 0


def test_list_stations_unauthenticated(client):
    resp = client.get("/polling-stations")
    assert resp.status_code == 401


def test_list_stations_district_filter(client, auth_headers, first_district_id):
    resp = client.get("/polling-stations", headers=auth_headers,
                      params={"district_id": first_district_id})
    assert resp.status_code == 200
    body = resp.json()
    for s in body["items"]:
        assert s["district_id"] == first_district_id


def test_list_stations_pagination(client, auth_headers):
    resp = client.get("/polling-stations", headers=auth_headers, params={"limit": 3})
    assert resp.status_code == 200
    assert len(resp.json()["items"]) <= 3


def test_get_station_by_id(client, auth_headers, first_station_id):
    resp = client.get(f"/polling-stations/{first_station_id}", headers=auth_headers)
    assert resp.status_code == 200
    body = resp.json()
    assert body["id"] == first_station_id
    assert "code" in body
    assert "name" in body
    assert "status" in body


def test_get_station_not_found(client, auth_headers):
    resp = client.get("/polling-stations/00000000-0000-0000-0000-000000000000",
                      headers=auth_headers)
    assert resp.status_code == 404


def test_create_polling_station(client, auth_headers, first_district_id):
    payload = {
        "code": "INT-TEST-PS1",
        "name": "Integration Test Station",
        "district_id": first_district_id,
        "lat": -1.9441,
        "lon": 30.0619,
    }
    resp = client.post("/polling-stations", headers=auth_headers, json=payload)
    assert resp.status_code == 201
    body = resp.json()
    assert body["code"] == "INT-TEST-PS1"
    assert body["district_id"] == first_district_id


def test_create_station_invalid_district(client, auth_headers):
    payload = {
        "code": "INT-ORPHAN",
        "name": "Orphan Station",
        "district_id": "00000000-0000-0000-0000-000000000000",
    }
    resp = client.post("/polling-stations", headers=auth_headers, json=payload)
    assert resp.status_code == 400


def test_create_station_unauthenticated(client, first_district_id):
    resp = client.post("/polling-stations", json={"code": "X", "name": "Y",
                                                   "district_id": first_district_id})
    assert resp.status_code == 401


def test_patch_polling_station(client, auth_headers, first_station_id):
    resp = client.patch(
        f"/polling-stations/{first_station_id}",
        headers=auth_headers,
        json={"name": "Patched Station Name"},
    )
    assert resp.status_code == 200


def test_open_polling_station(client, auth_headers, first_station_id):
    resp = client.post(f"/polling-stations/{first_station_id}:open", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["status"] == "online"


def test_close_polling_station(client, auth_headers, first_station_id):
    resp = client.post(f"/polling-stations/{first_station_id}:close", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["status"] == "offline"


def test_open_station_not_found(client, auth_headers):
    resp = client.post("/polling-stations/00000000-0000-0000-0000-000000000000:open",
                       headers=auth_headers)
    assert resp.status_code == 404


def test_station_summary(client, auth_headers, first_station_id):
    resp = client.get(f"/polling-stations/{first_station_id}/summary", headers=auth_headers)
    assert resp.status_code == 200
    body = resp.json()
    assert "station_id" in body
    assert "registered_count" in body
    assert "votes_cast" in body
    assert "pending" in body


def test_station_summary_not_found(client, auth_headers):
    resp = client.get("/polling-stations/00000000-0000-0000-0000-000000000000/summary",
                      headers=auth_headers)
    assert resp.status_code == 404
