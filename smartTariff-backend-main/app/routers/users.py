from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User
from ..schemas.user import UpdateUserRequest
from ..dependencies import get_current_user

router = APIRouter(prefix="/api/v1/users", tags=["users"])


def api_success(data=None, message="OK"):
    resp = {"success": True, "message": message}
    if data is not None:
        resp["data"] = data
    return resp


@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return api_success(data=current_user.to_dict())


@router.patch("/me")
def update_me(
    body: UpdateUserRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if body.name is not None:
        current_user.name = body.name
    if body.phone is not None:
        current_user.phone = body.phone
    if body.avatar is not None:
        current_user.avatar = body.avatar

    db.commit()
    db.refresh(current_user)

    return api_success(data=current_user.to_dict(), message="Profile updated successfully")
