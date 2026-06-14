"""Auth module - JWT + TOTP 2FA."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from datetime import datetime, timezone, timedelta
from app.core.db import get_db
from app.core.security import (
    hash_password, verify_password, create_access_token, decode_token,
    generate_totp_secret, verify_totp
)
from app.core.audit import write_audit
from app.core.enums import AuditAction, ActorType, UserStatus
from app.db.models.people import AdminUser, Session as SessionModel
from app.schemas import LoginRequest, MFARequest, TokenResponse
import uuid

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    """
    Login with email and password.
    
    Returns MFA challenge if MFA is enabled.
    """
    user = db.execute(
        select(AdminUser).where(AdminUser.email == request.email)
    ).scalar_one_or_none()
    
    if not user or not verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )
    
    if user.status == UserStatus.suspended:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is suspended",
        )
    
    if user.mfa_enabled:
        # Return MFA challenge; client sends TOTP code to /auth/mfa
        return TokenResponse(
            access_token="",
            mfa_required=True,
        )
    
    # No MFA required; issue token
    token = create_access_token({"sub": str(user.id), "role": user.role_id})
    
    # Update last_active_at
    user.last_active_at = datetime.now(timezone.utc)
    
    write_audit(
        db,
        action=AuditAction.LOGIN,
        actor_type=ActorType.user,
        actor_id=str(user.id),
        actor_role=user.role_id,
        service="Auth",
        detail=f"Logged in: {user.email}",
    )
    
    db.commit()
    
    return TokenResponse(access_token=token, mfa_required=False)


@router.post("/mfa", response_model=TokenResponse)
async def verify_mfa(email: str, request: MFARequest, db: Session = Depends(get_db)):
    """
    Verify TOTP code and issue token.
    """
    user = db.execute(
        select(AdminUser).where(AdminUser.email == email)
    ).scalar_one_or_none()
    
    if not user or not user.mfa_enabled or not user.totp_secret:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="MFA not configured",
        )
    
    if not verify_totp(user.totp_secret, request.code):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid TOTP code",
        )
    
    token = create_access_token({"sub": str(user.id), "role": user.role_id})
    
    user.last_active_at = datetime.now(timezone.utc)
    write_audit(
        db,
        action=AuditAction.LOGIN,
        actor_type=ActorType.user,
        actor_id=str(user.id),
        actor_role=user.role_id,
        service="Auth",
        detail=f"MFA verified: {user.email}",
    )
    
    db.commit()
    
    return TokenResponse(access_token=token, mfa_required=False)


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    token: str,
    db: Session = Depends(get_db),
):
    """Refresh an access token."""
    try:
        payload = decode_token(token)
        user_id = payload.get("sub")
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )
    
    user = db.execute(
        select(AdminUser).where(AdminUser.id == user_id)
    ).scalar_one_or_none()
    
    if not user or user.status == UserStatus.suspended:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or suspended",
        )
    
    new_token = create_access_token({"sub": str(user.id), "role": user.role_id})
    return TokenResponse(access_token=new_token)


@router.post("/logout")
async def logout(token: str, db: Session = Depends(get_db)):
    """Logout (stub: in production, add token to blacklist)."""
    return {"status": "logged out"}
