"""Unit tests for Pydantic schemas — validation, required fields, and enum coercion.

No database, no HTTP — these tests exercise schema parsing and serialization
in isolation.  They act as a contract test: if a schema field is renamed or
its type changes, these tests catch it immediately.
"""
import pytest
from uuid import uuid4
from datetime import datetime, date, timezone

pytestmark = pytest.mark.unit


# ---------------------------------------------------------------------------
# Auth schemas
# ---------------------------------------------------------------------------

def test_login_request_valid():
    from app.schemas import LoginRequest
    req = LoginRequest(email="admin@securepoll.rw", password="Secret123!")
    assert req.email == "admin@securepoll.rw"
    assert req.password == "Secret123!"


def test_login_request_invalid_email_raises():
    from app.schemas import LoginRequest
    from pydantic import ValidationError
    with pytest.raises(ValidationError):
        LoginRequest(email="not-an-email", password="Secret123!")


def test_login_request_missing_password_raises():
    from app.schemas import LoginRequest
    from pydantic import ValidationError
    with pytest.raises(ValidationError):
        LoginRequest(email="admin@securepoll.rw")


def test_token_response_has_access_token():
    from app.schemas import TokenResponse
    resp = TokenResponse(access_token="tok.abc.def", token_type="bearer",
                         mfa_required=False, user_id=uuid4(), role="admin")
    assert resp.token_type == "bearer"


# ---------------------------------------------------------------------------
# Voter schemas
# ---------------------------------------------------------------------------

def test_voter_create_valid():
    from app.schemas import VoterCreate
    from app.core.enums import Sex
    data = {
        "voter_token": "RW-TEST-0001-ABCD",
        "registration_ref": "#TEST001",
        "national_id": "1234567890123456",
        "first_name": "Jean",
        "last_name": "Baptiste",
        "sex": "male",
        "date_of_birth": date(1990, 6, 15),
        "district_id": str(uuid4()),
        "polling_station_id": str(uuid4()),
    }
    voter = VoterCreate(**data)
    assert voter.first_name == "Jean"
    assert voter.sex == Sex.male


def test_voter_create_sex_enum_coercion():
    from app.schemas import VoterCreate
    from app.core.enums import Sex
    data = {
        "voter_token": "RW-0002-ZZZZ",
        "registration_ref": "#002",
        "national_id": "9876543210987654",
        "first_name": "Marie",
        "last_name": "Claire",
        "sex": "female",
        "date_of_birth": date(1985, 3, 20),
        "district_id": uuid4(),
        "polling_station_id": uuid4(),
    }
    voter = VoterCreate(**data)
    assert voter.sex is Sex.female


def test_voter_create_missing_required_raises():
    from app.schemas import VoterCreate
    from pydantic import ValidationError
    with pytest.raises(ValidationError):
        VoterCreate(first_name="Jean")


def test_voter_list_response_shape():
    from app.schemas import VoterListResponse
    resp = VoterListResponse(total=0, page=1, size=10, items=[])
    assert resp.total == 0
    assert resp.items == []


# ---------------------------------------------------------------------------
# Verification schemas
# ---------------------------------------------------------------------------

def test_verification_request_valid():
    import base64
    from app.schemas import VerificationRequest
    req = VerificationRequest(
        voter_token="RW-TOKEN-001",
        face_image=base64.b64encode(b"fake-image").decode(),
        polling_station_id=uuid4(),
        officer_id=uuid4(),
    )
    assert req.voter_token == "RW-TOKEN-001"


def test_vote_request_valid():
    from app.schemas import VoteRequest
    voter_id = uuid4()
    req = VoteRequest(voter_id=voter_id, polling_station_id=uuid4(), officer_id=uuid4())
    assert req.voter_id == voter_id


def test_vote_request_missing_voter_id_raises():
    from app.schemas import VoteRequest
    from pydantic import ValidationError
    with pytest.raises(ValidationError):
        VoteRequest(polling_station_id=uuid4(), officer_id=uuid4())


# ---------------------------------------------------------------------------
# Fraud / duplicate schemas
# ---------------------------------------------------------------------------

def test_merge_request_valid():
    from app.schemas import MergeRequest
    survivor = uuid4()
    req = MergeRequest(survivor_id=survivor)
    assert req.survivor_id == survivor


def test_merge_request_missing_survivor_raises():
    from app.schemas import MergeRequest
    from pydantic import ValidationError
    with pytest.raises(ValidationError):
        MergeRequest()


# ---------------------------------------------------------------------------
# Audit schemas
# ---------------------------------------------------------------------------

def test_chain_verification_response_clean():
    from app.schemas import ChainVerificationResponse
    resp = ChainVerificationResponse(
        entries_walked=250,
        breaks_found=0,
        first_break_sequence=None,
        verified_at=datetime.now(timezone.utc).isoformat(),
        duration_ms=17,
    )
    assert resp.breaks_found == 0
    assert resp.first_break_sequence is None
    assert resp.entries_walked == 250


def test_chain_verification_response_with_break():
    from app.schemas import ChainVerificationResponse
    resp = ChainVerificationResponse(
        entries_walked=100,
        breaks_found=3,
        first_break_sequence=42,
        verified_at=datetime.now(timezone.utc).isoformat(),
        duration_ms=8,
    )
    assert resp.breaks_found == 3
    assert resp.first_break_sequence == 42


# ---------------------------------------------------------------------------
# MFA schema
# ---------------------------------------------------------------------------

def test_mfa_request_valid():
    from app.schemas import MFARequest
    req = MFARequest(code="123456")
    assert req.code == "123456"


def test_mfa_request_missing_code_raises():
    from app.schemas import MFARequest
    from pydantic import ValidationError
    with pytest.raises(ValidationError):
        MFARequest()
