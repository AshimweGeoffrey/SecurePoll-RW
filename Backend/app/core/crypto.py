"""Cryptography utilities for biometric template encryption."""
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.backends import default_backend
import os
from app.core.config import settings


def _get_key() -> bytes:
    """Get the AES key from settings (32 bytes for AES-256)."""
    key_hex = settings.template_aes_key
    if len(key_hex) != 64:  # 32 bytes = 64 hex chars
        raise ValueError("AES key must be 32 bytes (64 hex characters)")
    return bytes.fromhex(key_hex)


def encrypt_template(template_blob: bytes) -> tuple[bytes, bytes]:
    """
    Encrypt a biometric template using AES-256-GCM.
    
    Returns: (ciphertext, nonce)
    """
    key = _get_key()
    nonce = os.urandom(12)  # 96-bit nonce for GCM
    cipher = AESGCM(key)
    ciphertext = cipher.encrypt(nonce, template_blob, None)
    return ciphertext, nonce


def decrypt_template(ciphertext: bytes, nonce: bytes) -> bytes:
    """
    Decrypt a biometric template using AES-256-GCM.
    """
    key = _get_key()
    cipher = AESGCM(key)
    plaintext = cipher.decrypt(nonce, ciphertext, None)
    return plaintext


def encrypt_sensitive_field(plaintext: str) -> tuple[bytes, bytes]:
    """Encrypt a sensitive string field (e.g., national_id, TOTP secret)."""
    key = _get_key()
    nonce = os.urandom(12)
    cipher = AESGCM(key)
    ciphertext = cipher.encrypt(nonce, plaintext.encode(), None)
    return ciphertext, nonce


def decrypt_sensitive_field(ciphertext: bytes, nonce: bytes) -> str:
    """Decrypt a sensitive string field."""
    key = _get_key()
    cipher = AESGCM(key)
    plaintext = cipher.decrypt(nonce, ciphertext, None)
    return plaintext.decode()
