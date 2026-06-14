"""Auth module - JWT + TOTP 2FA, user management, roles, sessions."""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy import select
from datetime import datetime, timezone, timedelta
import uuid
from app.core.db import get_db
from app.core.security import (
    hash_password, verify_password, create_access_token, decode_token,
    generate_totp_secret, verify_totp,
)
from app.core.audit import write_audit
from app.core.deps import get_current_user
from app.core.enums import AuditAction, ActorType, UserStatus
from app.db.models.people import AdminUser, Role, Session as SessionModel
from app.schemas import (
    LoginRequest, MFARequest, TokenResponse,
    AdminUserCreate, AdminUserUpdate, AdminUserResponse,
    RoleBase, RoleResponse,
)

router = APIRouter(tags=["auth"])

# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------

@router.post("/auth/login", response_model=TokenResponse)
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    """Login with email/password. Returns MFA challenge if MFA enabled."""
    user = db.execute(
        select(AdminUser).where(AdminUser.email == request.email)
    ).scalar_one_or_none()

    if not user or not verify_password(request.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    if user.status == UserStatus.suspended:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account suspended")

    if user.mfa_enabled and user.totp_secret:
        # Return partial token that requires MFA step
        mfa_token = create_access_token(
            {"sub": str(user.id), "role": user.role_id, "mfa_pending": True},
            expires_delta=timedelta(minutes=5),
        )
        return TokenResponse(access_token=mfa_token, mfa_required=True)

    token = create_access_token({"sub": str(user.id), "role": user.role_id})
    user.last_active_at = datetime.now(timezone.utc)
    write_audit(db, action=AuditAction.LOGIN, actor_type=ActorType.user,
                actor_id=str(user.id), actor_role=user.role_id, service="Auth",
                detail=f"Login: {user.email}")
    db.commit()
    return TokenResponse(access_token=token, mfa_required=False)


@router.post("/auth/token", response_model=TokenResponse)
async def login_form(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """OAuth2-compatible form login (used by /docs Authorize button)."""
    user = db.execute(
        select(AdminUser).where(AdminUser.email == form.username)
    ).scalar_one_or_none()

    if not user or not verify_password(form.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    if user.status == UserStatus.suspended:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account suspended")

    token = create_access_token({"sub": str(user.id), "role": user.role_id})
    user.last_active_at = datetime.now(timezone.utc)
    write_audit(db, action=AuditAction.LOGIN, actor_type=ActorType.user,
                actor_id=str(user.id), actor_role=user.role_id, service="Auth",
                detail=f"Form login: {user.email}")
    db.commit()
    return TokenResponse(access_token=token, mfa_required=False)


@router.post("/auth/mfa", response_model=TokenResponse)
async def verify_mfa(request: MFARequest, db: Session = Depends(get_db),
                     current_user: AdminUser = Depends(get_current_user)):
    """Verify TOTP and upgrade to full token."""
    if not current_user.mfa_enabled or not current_user.totp_secret:
        raise HTTPException(status_code=400, detail="MFA not configured")

    if not verify_totp(current_user.totp_secret, request.code):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid TOTP code")

    token = create_access_token({"sub": str(current_user.id), "role": current_user.role_id})
    current_user.last_active_at = datetime.now(timezone.utc)
    write_audit(db, action=AuditAction.LOGIN, actor_type=ActorType.user,
                actor_id=str(current_user.id), actor_role=current_user.role_id, service="Auth",
                detail=f"MFA verified: {current_user.email}")
    db.commit()
    return TokenResponse(access_token=token, mfa_required=False)


@router.post("/auth/refresh", response_model=TokenResponse)
async def refresh_token(current_user: AdminUser = Depends(get_current_user)):
    """Refresh JWT token."""
    token = create_access_token({"sub": str(current_user.id), "role": current_user.role_id})
    return TokenResponse(access_token=token, mfa_required=False)


@router.post("/auth/logout")
async def logout():
    """Logout (client discards token; stateless JWT)."""
    return {"status": "logged out"}


# ---------------------------------------------------------------------------
# Users
# ---------------------------------------------------------------------------

@router.get("/users", response_model=list[AdminUserResponse])
async def list_users(db: Session = Depends(get_db),
                     current_user: AdminUser = Depends(get_current_user)):
    users = db.execute(select(AdminUser)).scalars().all()
    return users


@router.post("/users:invite", response_model=AdminUserResponse, status_code=201)
async def invite_user(req: AdminUserCreate, db: Session = Depends(get_db),
                      current_user: AdminUser = Depends(get_current_user)):
    existing = db.execute(
        select(AdminUser).where(AdminUser.email == req.email)
    ).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    role = db.execute(select(Role).where(Role.id == req.role_id)).scalar_one_or_none()
    if not role:
        raise HTTPException(status_code=400, detail="Role not found")

    user = AdminUser(
        full_name=req.full_name,
        email=req.email,
        password_hash=hash_password(req.password),
        role_id=req.role_id,
        district_scope=req.district_scope,
        status=UserStatus.invitation_pending,
    )
    db.add(user)
    write_audit(db, action=AuditAction.RECORD_CREATED, actor_type=ActorType.user,
                actor_id=str(current_user.id), service="Users",
                detail=f"Invited user: {req.email}")
    db.commit()
    db.refresh(user)
    return user


@router.patch("/users/{user_id}", response_model=AdminUserResponse)
async def update_user(user_id: uuid.UUID, req: AdminUserUpdate,
                      db: Session = Depends(get_db),
                      current_user: AdminUser = Depends(get_current_user)):
    user = db.execute(select(AdminUser).where(AdminUser.id == user_id)).scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if req.full_name is not None:
        user.full_name = req.full_name
    if req.district_scope is not None:
        user.district_scope = req.district_scope

    write_audit(db, action=AuditAction.PERMISSION_CHANGED, actor_type=ActorType.user,
                actor_id=str(current_user.id), service="Users",
                detail=f"Updated user: {user.email}")
    db.commit()
    db.refresh(user)
    return user


@router.post("/users/{user_id}:reset-mfa")
async def reset_mfa(user_id: uuid.UUID, db: Session = Depends(get_db),
                    current_user: AdminUser = Depends(get_current_user)):
    user = db.execute(select(AdminUser).where(AdminUser.id == user_id)).scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    secret = generate_totp_secret()
    user.totp_secret = secret
    user.mfa_enabled = True

    write_audit(db, action=AuditAction.PERMISSION_CHANGED, actor_type=ActorType.user,
                actor_id=str(current_user.id), service="Users",
                detail=f"MFA reset for: {user.email}")
    db.commit()
    return {"totp_secret": secret, "message": "Scan this secret into your authenticator app"}


@router.post("/users/{user_id}:suspend")
async def suspend_user(user_id: uuid.UUID, db: Session = Depends(get_db),
                       current_user: AdminUser = Depends(get_current_user)):
    user = db.execute(select(AdminUser).where(AdminUser.id == user_id)).scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot suspend yourself")

    user.status = UserStatus.suspended
    write_audit(db, action=AuditAction.PERMISSION_CHANGED, actor_type=ActorType.user,
                actor_id=str(current_user.id), service="Users",
                detail=f"Suspended: {user.email}")
    db.commit()
    return {"status": "suspended"}


# ---------------------------------------------------------------------------
# Roles
# ---------------------------------------------------------------------------

@router.get("/roles", response_model=list[RoleResponse])
async def list_roles(db: Session = Depends(get_db),
                     current_user: AdminUser = Depends(get_current_user)):
    return db.execute(select(Role)).scalars().all()


@router.post("/roles", response_model=RoleResponse, status_code=201)
async def create_role(req: RoleBase, db: Session = Depends(get_db),
                      current_user: AdminUser = Depends(get_current_user)):
    role = Role(id=req.id, name=req.name, permissions=req.permissions)
    db.add(role)
    db.commit()
    db.refresh(role)
    return role


@router.patch("/roles/{role_id}", response_model=RoleResponse)
async def update_role(role_id: str, req: RoleBase, db: Session = Depends(get_db),
                      current_user: AdminUser = Depends(get_current_user)):
    role = db.execute(select(Role).where(Role.id == role_id)).scalar_one_or_none()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    role.name = req.name
    role.permissions = req.permissions
    db.commit()
    db.refresh(role)
    return role


# ---------------------------------------------------------------------------
# Sessions
# ---------------------------------------------------------------------------

@router.get("/sessions")
async def list_sessions(db: Session = Depends(get_db),
                        current_user: AdminUser = Depends(get_current_user)):
    sessions = db.execute(
        select(SessionModel).where(
            SessionModel.user_id == current_user.id,
            SessionModel.revoked_at.is_(None),
        )
    ).scalars().all()
    return [
        {
            "id": str(s.id),
            "device": s.device,
            "ip_address": s.ip_address,
            "location": s.location,
            "last_active_at": s.last_active_at,
            "created_at": s.created_at,
        }
        for s in sessions
    ]


@router.post("/sessions/{session_id}:revoke")
async def revoke_session(session_id: uuid.UUID, db: Session = Depends(get_db),
                         current_user: AdminUser = Depends(get_current_user)):
    session = db.execute(
        select(SessionModel).where(SessionModel.id == session_id)
    ).scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    session.revoked_at = datetime.now(timezone.utc)
    db.commit()
    return {"status": "revoked"}
