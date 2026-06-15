"""Auth business logic."""
from sqlalchemy.orm import Session
from sqlalchemy import select
from datetime import datetime, timezone, timedelta
from typing import Optional
from app.core.security import hash_password, verify_password, create_access_token, generate_totp_secret, verify_totp
from app.core.audit import write_audit
from app.core.enums import AuditAction, ActorType, UserStatus
from app.db.models.people import AdminUser, Role, Session as SessionModel
from app.schemas import AdminUserCreate


def authenticate_user(db: Session, email: str, password: str) -> Optional[AdminUser]:
    """Return user if credentials valid, else None."""
    user = db.execute(
        select(AdminUser).where(AdminUser.email == email)
    ).scalar_one_or_none()
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user


def issue_token(user: AdminUser, mfa_pending: bool = False) -> str:
    """Create and return a JWT for the user."""
    data = {"sub": str(user.id), "role": user.role_id}
    if mfa_pending:
        data["mfa_pending"] = True
        return create_access_token(data, expires_delta=timedelta(minutes=5))
    return create_access_token(data)


def create_admin_user(db: Session, data: AdminUserCreate, created_by_id: str) -> AdminUser:
    """Create a new AdminUser and write audit."""
    user = AdminUser(
        full_name=data.full_name,
        email=data.email,
        password_hash=hash_password(data.password),
        role_id=data.role_id,
        district_scope=data.district_scope,
        status=UserStatus.invitation_pending,
    )
    db.add(user)
    write_audit(
        db,
        action=AuditAction.RECORD_CREATED,
        actor_type=ActorType.user,
        actor_id=created_by_id,
        service="Users",
        detail=f"Invited user: {data.email}",
    )
    db.commit()
    db.refresh(user)
    return user


def activate_user(db: Session, user: AdminUser, activated_by_id: str) -> AdminUser:
    """Set status=active, write audit."""
    user.status = UserStatus.active
    write_audit(
        db,
        action=AuditAction.PERMISSION_CHANGED,
        actor_type=ActorType.user,
        actor_id=activated_by_id,
        service="Users",
        detail=f"Activated user: {user.email}",
    )
    db.commit()
    db.refresh(user)
    return user


def suspend_user(db: Session, user: AdminUser, suspended_by_id: str) -> AdminUser:
    """Set status=suspended, write audit."""
    user.status = UserStatus.suspended
    write_audit(
        db,
        action=AuditAction.PERMISSION_CHANGED,
        actor_type=ActorType.user,
        actor_id=suspended_by_id,
        service="Users",
        detail=f"Suspended: {user.email}",
    )
    db.commit()
    db.refresh(user)
    return user


def reset_mfa(db: Session, user: AdminUser, reset_by_id: str) -> str:
    """Generate new TOTP secret, enable MFA, write audit. Returns secret."""
    secret = generate_totp_secret()
    user.totp_secret = secret
    user.mfa_enabled = True
    write_audit(
        db,
        action=AuditAction.PERMISSION_CHANGED,
        actor_type=ActorType.user,
        actor_id=reset_by_id,
        service="Users",
        detail=f"MFA reset for: {user.email}",
    )
    db.commit()
    return secret


def change_password(db: Session, user: AdminUser, new_password: str, changed_by_id: str) -> None:
    """Hash and update password, write audit."""
    user.password_hash = hash_password(new_password)
    write_audit(
        db,
        action=AuditAction.PERMISSION_CHANGED,
        actor_type=ActorType.user,
        actor_id=changed_by_id,
        service="Auth",
        detail=f"Password changed: {user.email}",
    )
    db.commit()


def list_sessions(db: Session, user_id) -> list:
    """Return non-revoked sessions for a user."""
    sessions = db.execute(
        select(SessionModel).where(
            SessionModel.user_id == user_id,
            SessionModel.revoked_at.is_(None),
        )
    ).scalars().all()
    return sessions


def revoke_session(db: Session, session: SessionModel) -> SessionModel:
    """Set revoked_at on a session."""
    session.revoked_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(session)
    return session


def soft_delete_user(db: Session, user: AdminUser, deleted_by_id: str) -> None:
    """Soft-delete an admin user: suspend + write USER_DELETED audit."""
    user.status = UserStatus.suspended
    write_audit(
        db,
        action=AuditAction.USER_DELETED,
        actor_type=ActorType.user,
        actor_id=deleted_by_id,
        service="Users",
        detail=f"User soft-deleted: {user.email}",
    )
    db.commit()


def get_totp_uri(user: AdminUser, issuer: str = "SecurePoll RW") -> dict:
    """Return TOTP provisioning URI and secret for QR code generation."""
    from app.core.security import get_totp
    if not user.totp_secret:
        raise ValueError("User has no TOTP secret. Call reset-mfa first.")
    totp = get_totp(user.totp_secret)
    uri = totp.provisioning_uri(user.email, issuer_name=issuer)
    return {"totp_secret": user.totp_secret, "provisioning_uri": uri, "issuer": issuer}
