"""Integration tests for SecurePoll backend."""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
import numpy as np


@pytest.fixture
def client():
    """FastAPI test client with mocked AI models."""
    with patch("ml.inference.load_models"), \
         patch("ml.inference._face_model", MagicMock()), \
         patch("ml.inference._faiss_index", MagicMock(ntotal=0)):
        from app.main import app
        return TestClient(app, raise_server_exceptions=False)


def test_health(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_login_invalid_credentials(client):
    response = client.post(
        "/auth/login",
        json={"email": "nobody@example.com", "password": "wrong"},
    )
    assert response.status_code == 401


def test_list_voters_requires_auth(client):
    response = client.get("/voters")
    assert response.status_code == 401


def test_audit_chain_integrity(db):
    """Audit chain should have zero breaks on freshly written entries."""
    from app.core.audit import write_audit, verify_chain
    from app.core.enums import AuditAction, ActorType
    import uuid

    # Record baseline before adding entries
    before = verify_chain(db)
    baseline = before["entries_walked"]

    for i in range(5):
        write_audit(
            db,
            action=AuditAction.LOGIN,
            actor_type=ActorType.user,
            actor_id=str(uuid.uuid4()),
            service="Test",
            detail=f"Entry {i}",
        )
        db.commit()

    result = verify_chain(db)
    assert result["breaks_found"] == 0
    assert result["entries_walked"] == baseline + 5


def test_audit_chain_detects_tamper(db):
    """Modifying an entry directly must produce a chain break."""
    from app.core.audit import write_audit, verify_chain
    from app.core.enums import AuditAction, ActorType
    from app.db.models.audit import AuditEntry
    from sqlalchemy import select
    import uuid

    entry_id = uuid.uuid4()
    write_audit(db, action=AuditAction.LOGIN, actor_type=ActorType.user,
                actor_id=str(uuid.uuid4()), service="Test", detail="Original")
    db.commit()

    # Tamper: directly change the detail field on the most-recently written entry
    entry = db.execute(
        select(AuditEntry).order_by(AuditEntry.sequence.desc()).limit(1)
    ).scalar_one()
    entry.detail = "TAMPERED"
    db.commit()

    result = verify_chain(db)
    assert result["breaks_found"] >= 1
    assert result["first_break_sequence"] is not None
