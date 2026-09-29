from fastapi import APIRouter, Depends, HTTPException, Response, Request
from sqlalchemy.orm import Session
from jose import jwt, JWTError
from ..database import get_db
from ..models.user import User
from ..models.customer_profile import CustomerProfile
from ..schemas.auth import RegisterRequest, LoginRequest
from ..dependencies import (
    create_access_token,
    create_refresh_token,
    set_refresh_cookie,
    clear_refresh_cookie,
    get_current_user,
)
from ..config import settings

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


def api_success(data=None, message="OK", status_code=200):
    resp = {"success": True, "message": message}
    if data is not None:
        resp["data"] = data
    return resp


@router.post("/register", status_code=201)
def register(body: RegisterRequest, response: Response, db: Session = Depends(get_db)):
    # Check if email already exists
    existing = db.query(User).filter(User.email == body.email.lower()).first()
    if existing:
        raise HTTPException(status_code=409, detail="An account with this email already exists.")

    # Create user
    user = User(
        name=body.name,
        email=body.email.lower(),
        phone=body.phone or "",
        role="customer",
    )
    user.set_password(body.password)
    db.add(user)
    db.flush()

    # Auto-create customer profile
    profile = CustomerProfile(
        user_id=user.id,
        monthly_budget=500,
        minimum_data=10,
        minimum_call_minutes=500,
        minimum_sms=100,
        requires_5g=False,
    )
    db.add(profile)
    db.commit()
    db.refresh(user)

    # Generate tokens
    access_token = create_access_token(user.id, user.role)
    refresh_token = create_refresh_token(user.id)
    set_refresh_cookie(response, refresh_token)

    return api_success(
        data={"user": user.to_dict(), "token": access_token},
        message="Registration successful",
    )


@router.post("/login")
def login(body: LoginRequest, response: Response, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email.lower()).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    if not user.verify_password(body.password):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="This account has been deactivated. Contact support.")

    access_token = create_access_token(user.id, user.role)
    refresh_token = create_refresh_token(user.id)
    set_refresh_cookie(response, refresh_token)

    return api_success(
        data={"user": user.to_dict(), "token": access_token},
        message="Login successful",
    )


@router.post("/logout")
def logout(response: Response):
    clear_refresh_cookie(response)
    return api_success(message="Logged out successfully")


@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return api_success(data=current_user.to_dict())


@router.post("/refresh")
def refresh(request: Request, response: Response, db: Session = Depends(get_db)):
    refresh_token = request.cookies.get("refreshToken")
    if not refresh_token:
        raise HTTPException(status_code=401, detail="No refresh token found. Please log in again.")

    try:
        payload = jwt.decode(refresh_token, settings.jwt_refresh_secret, algorithms=["HS256"])
        user_id = payload.get("id")
    except JWTError:
        clear_refresh_cookie(response)
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token. Please log in again.")

    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user or not user.is_active:
        clear_refresh_cookie(response)
        raise HTTPException(status_code=401, detail="User no longer exists or is deactivated.")

    new_access_token = create_access_token(user.id, user.role)
    new_refresh_token = create_refresh_token(user.id)
    set_refresh_cookie(response, new_refresh_token)

    return api_success(data={"token": new_access_token}, message="Token refreshed")
