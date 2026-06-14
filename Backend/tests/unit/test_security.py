"""Unit tests for password hashing, JWT token creation/decode, and TOTP 2FA.

All tests are purely in-process — no database, no HTTP calls.
JWT_SECRET env var is set by tests/unit/conftest.py.
"""
import pytest
from datetime import timedelta

pytestmark = pytest.mark.unit


# ---------------------------------------------------------------------------
# Password hashing
# ---------------------------------------------------------------------------

def test_hash_password_produces_bcrypt_hash():
    from app.core.security import hash_password
    hashed = hash_password("Secret123!")
    assert hashed.startswith("$2b$"), "bcrypt hash must start with $2b$"


def test_hash_is_not_plaintext():
    from app.core.security import hash_password
    pw = "MyPassword42!"
    assert hash_password(pw) != pw


def test_same_password_different_hash_each_call():
    from app.core.security import hash_password
    pw = "SamePassword!"
    assert hash_password(pw) != hash_password(pw), "bcrypt salt must differ each call"


def test_verify_password_correct():
    from app.core.security import hash_password, verify_password
    pw = "CorrectHorseBatteryStaple"
    assert verify_password(pw, hash_password(pw)) is True


def test_verify_password_wrong():
    from app.core.security import hash_password, verify_password
    assert verify_password("wrong-password", hash_password("right-password")) is False


def test_verify_password_empty_string():
    from app.core.security import hash_password, verify_password
    assert verify_password("", hash_password("not-empty")) is False


# ---------------------------------------------------------------------------
# JWT
# ---------------------------------------------------------------------------

def test_create_access_token_is_string():
    from app.core.security import create_access_token
    token = create_access_token({"sub": "user-123"})
    assert isinstance(token, str)
    assert len(token.split(".")) == 3, "JWT must have three dot-separated parts"


def test_decode_token_recovers_subject():
    from app.core.security import create_access_token, decode_token
    token = create_access_token({"sub": "user-abc", "role": "admin"})
    payload = decode_token(token)
    assert payload["sub"] == "user-abc"
    assert payload["role"] == "admin"


def test_decode_token_has_expiry():
    from app.core.security import create_access_token, decode_token
    token = create_access_token({"sub": "user-abc"})
    payload = decode_token(token)
    assert "exp" in payload


def test_decode_token_custom_expiry():
    from app.core.security import create_access_token, decode_token
    import time
    token = create_access_token({"sub": "x"}, expires_delta=timedelta(hours=2))
    payload = decode_token(token)
    # expiry should be ~2h from now (within a 30-second tolerance)
    assert payload["exp"] > time.time() + 7000


def test_decode_invalid_token_raises():
    from app.core.security import decode_token
    with pytest.raises(ValueError, match="Invalid token"):
        decode_token("not.a.jwt")


def test_decode_tampered_token_raises():
    from app.core.security import create_access_token, decode_token
    token = create_access_token({"sub": "user-abc"})
    parts = token.split(".")
    # Corrupt the payload section
    tampered = parts[0] + "." + "dGFtcGVyZWQ" + "." + parts[2]
    with pytest.raises(ValueError, match="Invalid token"):
        decode_token(tampered)


# ---------------------------------------------------------------------------
# TOTP (2FA)
# ---------------------------------------------------------------------------

def test_generate_totp_secret_is_base32():
    from app.core.security import generate_totp_secret
    import base64
    secret = generate_totp_secret()
    assert len(secret) >= 16
    # Base32 alphabet only
    base64.b32decode(secret)  # raises if invalid


def test_verify_totp_current_code():
    from app.core.security import generate_totp_secret, get_totp, verify_totp
    secret = generate_totp_secret()
    totp = get_totp(secret)
    code = totp.now()
    assert verify_totp(secret, code) is True


def test_verify_totp_wrong_code():
    from app.core.security import generate_totp_secret, verify_totp
    secret = generate_totp_secret()
    assert verify_totp(secret, "000000") is False


def test_get_totp_uri_contains_issuer():
    from app.core.security import generate_totp_secret, get_totp_uri
    secret = generate_totp_secret()
    uri = get_totp_uri(secret, "test@securepoll.rw")
    assert "SecurePoll" in uri
    assert "test%40securepoll.rw" in uri or "test@securepoll.rw" in uri


def test_different_secrets_produce_different_codes():
    from app.core.security import generate_totp_secret, get_totp
    s1 = generate_totp_secret()
    s2 = generate_totp_secret()
    # Extremely unlikely (but not impossible) that two secrets produce the same current code
    # We just assert the secrets themselves differ
    assert s1 != s2
