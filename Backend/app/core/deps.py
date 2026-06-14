"""Dependency injection for authentication and authorization."""
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from app.core.db import get_db
from app.core.security import decode_token
from app.db.models.people import AdminUser
from sqlalchemy import select


async def get_current_user(
    token: str = Depends(lambda: None),  # Will be overridden by FastAPI
    db: Session = Depends(get_db),
) -> AdminUser:
    """Get the current authenticated user from JWT token."""
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )
    
    try:
        payload = decode_token(token)
        user_id = payload.get("sub")
        if not user_id:
            raise ValueError("Invalid token payload")
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
        )
    
    user = db.execute(
        select(AdminUser).where(AdminUser.id == user_id)
    ).scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    
    return user


def require_role(*allowed_roles: str):
    """
    Decorator to require specific roles.
    
    Usage: @app.post(..., dependencies=[Depends(require_role("super", "auditor"))])
    """
    async def role_checker(current_user: AdminUser = Depends(get_current_user)):
        if current_user.role_id not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )
        return current_user
    
    return role_checker
