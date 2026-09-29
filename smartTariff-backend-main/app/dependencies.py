from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import Depends, HTTPException, Request, Response
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from .config import settings
from .database import get_db
from .models.user import User

security = HTTPBearer(auto_error=False)


# ── Token Creation ──────────────────────────────────────────────────────────────

def create_access_token(user_id: int, role: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expires_minutes)
    payload = {"id": str(user_id), "role": role, "exp": expire}
    return jwt.encode(payload, settings.jwt_access_secret, algorithm="HS256")


def create_refresh_token(user_id: int) -> str:
    expire = datetime.now(timezone.utc) + timedelta(days=settings.refresh_token_expires_days)
    payload = {"id": str(user_id), "exp": expire}
    return jwt.encode(payload, settings.jwt_refresh_secret, algorithm="HS256")


def set_refresh_cookie(response: Response, token: str):
    max_age = settings.refresh_token_expires_days * 24 * 60 * 60
    response.set_cookie(
        key="refreshToken",
        value=token,
        httponly=True,
        secure=settings.is_production,
        samesite="strict" if settings.is_production else "lax",
        max_age=max_age,
        path="/",
    )


def clear_refresh_cookie(response: Response):
    response.delete_cookie(
        key="refreshToken",
        httponly=True,
        secure=settings.is_production,
        samesite="strict" if settings.is_production else "lax",
        path="/",
    )


# ── Auth Dependencies ───────────────────────────────────────────────────────────

def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    """Extract and verify JWT from Authorization: Bearer <token> header."""
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated. Please log in.")

    token = credentials.credentials
    try:
        payload = jwt.decode(token, settings.jwt_access_secret, algorithms=["HS256"])
        user_id = payload.get("id")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token payload.")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token. Please log in again.")

    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(status_code=401, detail="User belonging to this token no longer exists.")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="This account has been deactivated. Contact support.")

    return user


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Dependency that requires the current user to be an admin."""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access denied. Required role: admin.")
    return current_user
