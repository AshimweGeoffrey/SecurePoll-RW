"""Auth module - JWT + TOTP 2FA, user management, roles, sessions."""
from __future__ import annotations
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

@router.post(
    "/auth/login",
    response_model=TokenResponse,
    summary="Login with email and password",
    description=(
        "Authenticate with `email` + `password`.  \n\n"
        "- If the account has MFA enabled, `mfa_required: true` is returned together with a "
        "short-lived partial token (5 min).  Pass that token to `POST /auth/mfa` with the TOTP "
        "code to upgrade to a full session token.\n"
        "- If MFA is not configured, a full JWT is returned immediately.\n\n"
        "Suspended accounts receive **403 Forbidden**."
    ),
    response_description="JWT access token (possibly partial if MFA is pending).",
    responses={
        401: {"description": "Invalid email or password."},
        403: {"description": "Account is suspended."},
    },
)
async def login(request: LoginRequest, db: Session = Depends(get_db)):
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


@router.post(
    "/auth/token",
    response_model=TokenResponse,
    summary="OAuth2 form login (Swagger Authorize button)",
    description=(
        "OAuth2-compatible `application/x-www-form-urlencoded` login.  "
        "This endpoint is wired to the **Authorize** button in the Swagger UI — "
        "use `username` (email) and `password` fields.  "
        "Returns a full JWT (MFA is bypassed for the interactive docs flow)."
    ),
    response_description="Full JWT access token.",
    responses={
        401: {"description": "Invalid credentials."},
        403: {"description": "Account is suspended."},
    },
)
async def login_form(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
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


@router.post(
    "/auth/mfa",
    response_model=TokenResponse,
    summary="Complete TOTP MFA challenge",
    description=(
        "Submit the 6-digit TOTP code from an authenticator app to upgrade a partial token "
        "(received from `POST /auth/login` when `mfa_required: true`) into a full session token.  \n\n"
        "The partial token must be included in the `Authorization: Bearer …` header of this request."
    ),
    response_description="Full JWT access token after successful MFA verification.",
    responses={
        400: {"description": "MFA not configured on this account."},
        401: {"description": "Invalid or expired TOTP code."},
    },
)
async def verify_mfa(request: MFARequest, db: Session = Depends(get_db),
                     current_user: AdminUser = Depends(get_current_user)):
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


@router.post(
    "/auth/refresh",
    response_model=TokenResponse,
    summary="Refresh the current JWT",
    description=(
        "Issue a fresh JWT for the authenticated user without requiring re-entry of credentials.  "
        "Useful for extending sessions before the current token expires."
    ),
    response_description="New JWT access token with a refreshed expiry.",
    responses={
        401: {"description": "Token missing, expired, or invalid."},
    },
)
async def refresh_token(current_user: AdminUser = Depends(get_current_user)):
    token = create_access_token({"sub": str(current_user.id), "role": current_user.role_id})
    return TokenResponse(access_token=token, mfa_required=False)


@router.post(
    "/auth/logout",
    summary="Logout current session",
    description=(
        "Signals logout intent.  Because JWTs are stateless, the token is not server-side "
        "invalidated — the client must discard the token.  "
        "To truly revoke access, use `POST /sessions/{session_id}:revoke`."
    ),
    response_description="Confirmation that the logout signal was received.",
)
async def logout():
    return {"status": "logged out"}


# ---------------------------------------------------------------------------
# Users
# ---------------------------------------------------------------------------

@router.get(
    "/users",
    response_model=list[AdminUserResponse],
    summary="List all admin users",
    description=(
        "Returns all admin user accounts in the system.  "
        "Requires an authenticated admin session."
    ),
    response_description="Array of admin user objects.",
    responses={
        401: {"description": "Not authenticated."},
    },
)
async def list_users(db: Session = Depends(get_db),
                     current_user: AdminUser = Depends(get_current_user)):
    users = db.execute(select(AdminUser)).scalars().all()
    return users


@router.get(
    "/users/{user_id}",
    response_model=AdminUserResponse,
    summary="Get a single admin user by ID",
    description=(
        "Retrieve the full profile of a single admin user identified by UUID.  "
        "Returns **404** if the user does not exist."
    ),
    response_description="Admin user object.",
    responses={
        401: {"description": "Not authenticated."},
        404: {"description": "User not found."},
    },
)
async def get_user(
    user_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_user),
):
    user = db.execute(select(AdminUser).where(AdminUser.id == user_id)).scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.post(
    "/users:invite",
    response_model=AdminUserResponse,
    status_code=201,
    summary="Invite (create) a new admin user",
    description=(
        "Create a new admin user account and set its status to `invitation_pending`.  \n\n"
        "- `role_id` must reference an existing role.\n"
        "- `email` must be unique — returns **400** if already registered.\n"
        "- The invited user should change their password on first login."
    ),
    response_description="Newly created admin user.",
    responses={
        400: {"description": "Email already registered, or role not found."},
        401: {"description": "Not authenticated."},
    },
)
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


@router.patch(
    "/users/{user_id}",
    response_model=AdminUserResponse,
    summary="Update an admin user's profile",
    description=(
        "Partially update an admin user's `full_name` and/or `district_scope`.  "
        "Only the fields present in the request body are changed (PATCH semantics).  "
        "An audit entry is written for every update."
    ),
    response_description="Updated admin user object.",
    responses={
        401: {"description": "Not authenticated."},
        404: {"description": "User not found."},
    },
)
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


@router.post(
    "/users/{user_id}:reset-mfa",
    summary="Reset and re-provision TOTP secret for a user",
    description=(
        "Generates a fresh TOTP secret for the target user, enables MFA on their account, "
        "and returns the raw secret for them to scan into an authenticator app (e.g., Google "
        "Authenticator, Authy).  \n\n"
        "**Security note:** the secret is returned only once — store it securely or display "
        "as a QR code to the user immediately."
    ),
    response_description="New TOTP secret string and instructions.",
    responses={
        401: {"description": "Not authenticated."},
        404: {"description": "User not found."},
    },
)
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


@router.post(
    "/users/{user_id}:suspend",
    summary="Suspend an admin user account",
    description=(
        "Sets the target user's status to `suspended`, preventing them from logging in.  \n\n"
        "**Constraint:** a user cannot suspend their own account — returns **400** if attempted."
    ),
    response_description="Confirmation that the account has been suspended.",
    responses={
        400: {"description": "Cannot suspend yourself."},
        401: {"description": "Not authenticated."},
        404: {"description": "User not found."},
    },
)
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

@router.get(
    "/roles",
    response_model=list[RoleResponse],
    summary="List all RBAC roles",
    description=(
        "Returns all roles defined in the system, each with an array of `permissions` strings.  "
        "Roles are referenced by `role_id` on admin user records."
    ),
    response_description="Array of role objects.",
    responses={
        401: {"description": "Not authenticated."},
    },
)
async def list_roles(db: Session = Depends(get_db),
                     current_user: AdminUser = Depends(get_current_user)):
    return db.execute(select(Role)).scalars().all()


@router.post(
    "/roles",
    response_model=RoleResponse,
    status_code=201,
    summary="Create a new RBAC role",
    description=(
        "Create a named role with an explicit list of permission strings.  "
        "Permission strings are arbitrary — the application checks for their presence "
        "in the role's `permissions` array."
    ),
    response_description="Newly created role.",
    responses={
        401: {"description": "Not authenticated."},
    },
)
async def create_role(req: RoleBase, db: Session = Depends(get_db),
                      current_user: AdminUser = Depends(get_current_user)):
    role = Role(id=req.id, name=req.name, permissions=req.permissions)
    db.add(role)
    db.commit()
    db.refresh(role)
    return role


@router.patch(
    "/roles/{role_id}",
    response_model=RoleResponse,
    summary="Update an existing RBAC role",
    description=(
        "Replace the `name` and `permissions` array of an existing role.  "
        "All users assigned this role immediately inherit the new permissions."
    ),
    response_description="Updated role object.",
    responses={
        401: {"description": "Not authenticated."},
        404: {"description": "Role not found."},
    },
)
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

@router.get(
    "/sessions",
    summary="List active sessions for current user",
    description=(
        "Returns all non-revoked sessions belonging to the currently authenticated user.  "
        "Each session record includes device, IP address, location, and last-active timestamp."
    ),
    response_description="Array of active session objects.",
    responses={
        401: {"description": "Not authenticated."},
    },
)
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


@router.post(
    "/sessions/{session_id}:revoke",
    summary="Revoke a specific session",
    description=(
        "Mark a session as revoked by setting its `revoked_at` timestamp.  "
        "Any token associated with that session will no longer be considered valid "
        "by session-aware middleware."
    ),
    response_description="Confirmation that the session was revoked.",
    responses={
        401: {"description": "Not authenticated."},
        404: {"description": "Session not found."},
    },
)
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
