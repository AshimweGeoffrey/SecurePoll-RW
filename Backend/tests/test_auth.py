"""Auth module tests — login, MFA, users, roles, sessions."""
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


# ---------------------------------------------------------------------------
# Login / token tests
# ---------------------------------------------------------------------------

def test_login_success(client):
    """POST /auth/login with correct credentials → 200 with access_token."""
    resp = client.post(
        "/auth/login",
        json={"email": "admin@securepoll.rw", "password": "SecurePassword123!"},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert "access_token" in body
    assert body["access_token"] != ""


def test_login_wrong_password(client):
    """POST /auth/login with wrong password → 401."""
    resp = client.post(
        "/auth/login",
        json={"email": "admin@securepoll.rw", "password": "WrongPassword!"},
    )
    assert resp.status_code == 401


def test_login_unknown_email(client):
    """POST /auth/login with unknown e-mail → 401."""
    resp = client.post(
        "/auth/login",
        json={"email": "nobody@example.com", "password": "SomePassword123!"},
    )
    assert resp.status_code == 401


def test_login_missing_fields(client):
    """POST /auth/login with no body → 422 validation error."""
    resp = client.post("/auth/login", json={})
    assert resp.status_code == 422


def test_form_login_oauth2(client):
    """POST /auth/token with OAuth2 form data → 200 with access_token."""
    resp = client.post(
        "/auth/token",
        data={"username": "admin@securepoll.rw", "password": "SecurePassword123!"},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert "access_token" in body
    assert body["access_token"] != ""


def test_form_login_wrong_password(client):
    """POST /auth/token with wrong password → 401."""
    resp = client.post(
        "/auth/token",
        data={"username": "admin@securepoll.rw", "password": "BadPass!"},
    )
    assert resp.status_code == 401


def test_refresh_token(client, auth_headers):
    """POST /auth/refresh with valid Bearer token → 200 with new access_token."""
    resp = client.post("/auth/refresh", headers=auth_headers)
    assert resp.status_code == 200
    body = resp.json()
    assert "access_token" in body


def test_refresh_without_token(client):
    """POST /auth/refresh with no token → 401."""
    resp = client.post("/auth/refresh")
    assert resp.status_code == 401


def test_logout(client, auth_headers):
    """POST /auth/logout → 200 with status logged out."""
    resp = client.post("/auth/logout", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json().get("status") == "logged out"


# ---------------------------------------------------------------------------
# User management tests
# ---------------------------------------------------------------------------

def test_list_users_authenticated(client, auth_headers):
    """GET /users with valid token → 200, returns a list."""
    resp = client.get("/users", headers=auth_headers)
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


def test_list_users_unauthenticated(client):
    """GET /users without token → 401."""
    resp = client.get("/users")
    assert resp.status_code == 401


def test_list_roles_authenticated(client, auth_headers):
    """GET /roles with valid token → 200, returns a list."""
    resp = client.get("/roles", headers=auth_headers)
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


def test_list_roles_unauthenticated(client):
    """GET /roles without token → 401."""
    resp = client.get("/roles")
    assert resp.status_code == 401


def test_invite_user_creates_user(client, auth_headers):
    """POST /users:invite with a new unique email → 201."""
    unique_email = f"invited_{uuid.uuid4().hex[:8]}@securepoll.rw"
    resp = client.post(
        "/users:invite",
        json={
            "full_name": "Test Invited",
            "email": unique_email,
            "password": "InvitedPass123!",
            "role_id": "super",
            "district_scope": "National",
        },
        headers=auth_headers,
    )
    assert resp.status_code == 201
    body = resp.json()
    assert body["email"] == unique_email
    assert body["status"] == "invitation_pending"


def test_invite_duplicate_email(client, auth_headers):
    """POST /users:invite with an already-registered email → 400."""
    resp = client.post(
        "/users:invite",
        json={
            "full_name": "Duplicate User",
            "email": "admin@securepoll.rw",
            "password": "AnyPass123!",
            "role_id": "super",
            "district_scope": "National",
        },
        headers=auth_headers,
    )
    assert resp.status_code == 400


def test_invite_invalid_role(client, auth_headers):
    """POST /users:invite with a nonexistent role_id → 400."""
    resp = client.post(
        "/users:invite",
        json={
            "full_name": "Bad Role User",
            "email": f"badrole_{uuid.uuid4().hex[:8]}@securepoll.rw",
            "password": "AnyPass123!",
            "role_id": "nonexistent_role_xyz",
            "district_scope": "National",
        },
        headers=auth_headers,
    )
    assert resp.status_code == 400


def test_invite_unauthenticated(client):
    """POST /users:invite without token → 401."""
    resp = client.post(
        "/users:invite",
        json={
            "full_name": "Ghost",
            "email": "ghost@securepoll.rw",
            "password": "Ghost123!",
            "role_id": "super",
            "district_scope": "National",
        },
    )
    assert resp.status_code == 401


# ---------------------------------------------------------------------------
# Role CRUD tests
# ---------------------------------------------------------------------------

def test_create_and_update_role(client, auth_headers):
    """POST /roles → 201; then PATCH /roles/{id} → 200."""
    role_id = f"test_role_{uuid.uuid4().hex[:6]}"

    # Create
    create_resp = client.post(
        "/roles",
        json={"id": role_id, "name": "Test Role", "permissions": ["registry"]},
        headers=auth_headers,
    )
    assert create_resp.status_code == 201
    assert create_resp.json()["id"] == role_id

    # Update
    update_resp = client.patch(
        f"/roles/{role_id}",
        json={"id": role_id, "name": "Updated Role", "permissions": ["registry", "audit"]},
        headers=auth_headers,
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["name"] == "Updated Role"
    assert "audit" in update_resp.json()["permissions"]


def test_update_nonexistent_role(client, auth_headers):
    """PATCH /roles/doesnotexist → 404."""
    resp = client.patch(
        "/roles/totally_nonexistent_role_abc",
        json={"id": "totally_nonexistent_role_abc", "name": "X", "permissions": []},
        headers=auth_headers,
    )
    assert resp.status_code == 404


# ---------------------------------------------------------------------------
# User suspend tests
# ---------------------------------------------------------------------------

def test_suspend_other_user(client, auth_headers):
    """POST /users/{id}:suspend on a different user → 200 {"status": "suspended"}."""
    # First invite a new user to suspend
    unique_email = f"tosuspend_{uuid.uuid4().hex[:8]}@securepoll.rw"
    invite_resp = client.post(
        "/users:invite",
        json={
            "full_name": "To Suspend",
            "email": unique_email,
            "password": "Suspend123!",
            "role_id": "super",
            "district_scope": "National",
        },
        headers=auth_headers,
    )
    assert invite_resp.status_code == 201
    user_id = invite_resp.json()["id"]

    suspend_resp = client.post(f"/users/{user_id}:suspend", headers=auth_headers)
    assert suspend_resp.status_code == 200
    assert suspend_resp.json()["status"] == "suspended"


def test_suspend_nonexistent_user(client, auth_headers):
    """POST /users/{id}:suspend for a UUID that doesn't exist → 404."""
    fake_id = "00000000-0000-0000-0000-000000000000"
    resp = client.post(f"/users/{fake_id}:suspend", headers=auth_headers)
    assert resp.status_code == 404


def test_suspend_self(client, auth_headers):
    """POST /users/{id}:suspend where id == current user's id → 400."""
    # Get current user's id from user list
    users_resp = client.get("/users", headers=auth_headers)
    assert users_resp.status_code == 200
    users = users_resp.json()
    # Find admin@securepoll.rw
    admin = next((u for u in users if u["email"] == "admin@securepoll.rw"), None)
    assert admin is not None, "Admin user not found in /users"
    resp = client.post(f"/users/{admin['id']}:suspend", headers=auth_headers)
    assert resp.status_code == 400


# ---------------------------------------------------------------------------
# Sessions tests
# ---------------------------------------------------------------------------

def test_list_sessions_authenticated(client, auth_headers):
    """GET /sessions with valid token → 200, returns a list."""
    resp = client.get("/sessions", headers=auth_headers)
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


def test_list_sessions_unauthenticated(client):
    """GET /sessions without token → 401."""
    resp = client.get("/sessions")
    assert resp.status_code == 401
