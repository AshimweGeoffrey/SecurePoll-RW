"""Unit tests for AES-256-GCM biometric template encryption.

These tests are entirely in-process — no database, no network.
The TEMPLATE_AES_KEY env var is set by tests/unit/conftest.py before any
app module is imported.
"""
import pytest

pytestmark = pytest.mark.unit


# ---------------------------------------------------------------------------
# encrypt_template / decrypt_template (nonce-prepended blob)
# ---------------------------------------------------------------------------

def test_encrypt_decrypt_roundtrip():
    from app.core.crypto import encrypt_template, decrypt_template
    plaintext = b"\x01\x02\x03" * 170 + b"\x04\x05"  # 512 bytes (like float32 embedding)
    ciphertext = encrypt_template(plaintext)
    recovered = decrypt_template(ciphertext, b"")
    assert recovered == plaintext


def test_each_encryption_produces_unique_nonce():
    from app.core.crypto import encrypt_template
    data = b"synthetic-embedding"
    c1 = encrypt_template(data)
    c2 = encrypt_template(data)
    assert c1[:12] != c2[:12], "Each call must use a fresh random nonce"
    assert c1 != c2


def test_encrypted_blob_is_nonce_plus_ciphertext():
    from app.core.crypto import encrypt_template
    data = b"hello"
    blob = encrypt_template(data)
    # GCM adds 16-byte auth tag, so: 12 (nonce) + 5 (plaintext) + 16 (tag) = 33
    assert len(blob) == 12 + len(data) + 16


def test_tampered_ciphertext_raises():
    from app.core.crypto import encrypt_template, decrypt_template
    data = b"important-biometric-data"
    blob = encrypt_template(data)
    # Flip a byte in the ciphertext body (after 12-byte nonce)
    tampered = blob[:12] + bytes([blob[12] ^ 0xFF]) + blob[13:]
    with pytest.raises(Exception):  # cryptography.exceptions.InvalidTag


        decrypt_template(tampered, b"")


def test_tampered_nonce_raises():
    from app.core.crypto import encrypt_template, decrypt_template
    data = b"some-data"
    blob = encrypt_template(data)
    bad_nonce = bytes([blob[0] ^ 0x01]) + blob[1:]
    with pytest.raises(Exception):
        decrypt_template(bad_nonce, b"")


# ---------------------------------------------------------------------------
# encrypt_sensitive_field / decrypt_sensitive_field (string fields)
# ---------------------------------------------------------------------------

def test_encrypt_decrypt_sensitive_field():
    from app.core.crypto import encrypt_sensitive_field, decrypt_sensitive_field
    value = "1234567890123456"  # national ID
    ciphertext, nonce = encrypt_sensitive_field(value)
    recovered = decrypt_sensitive_field(ciphertext, nonce)
    assert recovered == value


def test_sensitive_field_nonce_is_12_bytes():
    from app.core.crypto import encrypt_sensitive_field
    _, nonce = encrypt_sensitive_field("test")
    assert len(nonce) == 12


def test_sensitive_field_unique_ciphertext():
    from app.core.crypto import encrypt_sensitive_field
    c1, n1 = encrypt_sensitive_field("same-value")
    c2, n2 = encrypt_sensitive_field("same-value")
    assert n1 != n2, "Nonces must differ"
    assert c1 != c2


def test_wrong_key_raises():
    """AES-GCM raises InvalidTag when decryption uses the wrong key."""
    from cryptography.hazmat.primitives.ciphers.aead import AESGCM
    import os
    key1 = os.urandom(32)
    key2 = os.urandom(32)
    nonce = os.urandom(12)
    ciphertext = AESGCM(key1).encrypt(nonce, b"biometric-data", None)
    with pytest.raises(Exception):
        AESGCM(key2).decrypt(nonce, ciphertext, None)
