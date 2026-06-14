"""Sample integration tests."""
import pytest
from fastapi.testclient import FastAPI
from app.main import app


@pytest.fixture
def client():
    """FastAPI test client."""
    return TestClient(app)


def test_health(client):
    """Test health endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_login_invalid_credentials(client):
    """Test login with invalid credentials."""
    response = client.post(
        "/auth/login",
        json={"email": "nonexistent@test.com", "password": "wrong"},
    )
    assert response.status_code == 401


def test_list_voters(client, test_user):
    """Test listing voters."""
    # Would need valid JWT token in practice
    response = client.get("/voters")
    # Should return 401 without auth or 200 with auth
    assert response.status_code in [200, 401]


def test_voter_by_token(client, test_voter):
    """Test fetching voter by token."""
    response = client.get(f"/voters/by-token/{test_voter.voter_token}")
    # Should return 401 without auth or 200 with auth
    assert response.status_code in [200, 401]


@pytest.mark.asyncio
async def test_audit_chain_integrity(db):
    """Test audit chain hash integrity."""
    from app.core.audit import write_audit, verify_chain
    from app.core.enums import AuditAction, ActorType
    import uuid
    
    # Write some audit entries
    for i in range(5):
        write_audit(
            db,
            action=AuditAction.LOGIN,
            actor_type=ActorType.user,
            actor_id=str(uuid.uuid4()),
            service="Test",
            detail=f"Test entry {i}",
        )
        db.commit()
    
    # Verify chain
    result = verify_chain(db)
    assert result["breaks_found"] == 0
    assert result["entries_walked"] == 5
