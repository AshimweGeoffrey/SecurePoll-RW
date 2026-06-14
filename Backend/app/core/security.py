"""Security utilities: password hashing, JWT, TOTP."""
import jwt
import pyotp
from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
from typing import Optional
from app.core.config import settings

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """Hash a password using bcrypt."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a hash."""
    return pwd_context.verify(plain_password, hashed_password)


# JWT
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.access_token_minutes
        )
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode, settings.jwt_secret, algorithm=settings.jwt_algorithm
    )
    return encoded_jwt


def decode_token(token: str) -> dict:
    """Decode and validate a JWT token."""
    try:
        payload = jwt.decode(
            token, settings.jwt_secret, algorithms=[settings.jwt_algorithm]
        )
        return payload
    except jwt.InvalidTokenError:
        raise ValueError("Invalid token")


# TOTP (2FA)
def generate_totp_secret() -> str:
    """Generate a new TOTP secret for 2FA."""
    return pyotp.random_base32()


def get_totp(secret: str) -> pyotp.TOTP:
    """Get a TOTP instance from a secret."""
    return pyotp.TOTP(secret)


def verify_totp(secret: str, token: str) -> bool:
    """Verify a TOTP token."""
    totp = get_totp(secret)
    return totp.verify(token)


def get_totp_uri(secret: str, email: str, issuer: str = "SecurePoll") -> str:
    """Get the provisioning URI for TOTP (QR code)."""
    totp = get_totp(secret)
    return totp.provisioning_uri(email, issuer_name=issuer)
