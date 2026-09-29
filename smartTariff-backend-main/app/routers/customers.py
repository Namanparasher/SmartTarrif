from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User
from ..models.customer_profile import CustomerProfile
from ..schemas.user import UpdateProfileRequest
from ..dependencies import get_current_user

router = APIRouter(prefix="/api/v1/customers", tags=["customers"])


def api_success(data=None, message="OK"):
    resp = {"success": True, "message": message}
    if data is not None:
        resp["data"] = data
    return resp


@router.get("/me/profile")
def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = db.query(CustomerProfile).filter(CustomerProfile.user_id == current_user.id).first()

    # Auto-create profile if it doesn't exist
    if not profile:
        profile = CustomerProfile(
            user_id=current_user.id,
            monthly_budget=500,
            minimum_data=10,
            minimum_call_minutes=500,
            minimum_sms=100,
            requires_5g=False,
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)

    return api_success(data=profile.to_dict())


@router.patch("/me/profile")
def update_my_profile(
    body: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = db.query(CustomerProfile).filter(CustomerProfile.user_id == current_user.id).first()

    if not profile:
        profile = CustomerProfile(user_id=current_user.id)
        db.add(profile)

    if body.monthlyBudget is not None:
        profile.monthly_budget = body.monthlyBudget
    if body.minimumData is not None:
        profile.minimum_data = body.minimumData
    if body.minimumCallMinutes is not None:
        profile.minimum_call_minutes = body.minimumCallMinutes
    if body.minimumSms is not None:
        profile.minimum_sms = body.minimumSms
    if body.requires5G is not None:
        profile.requires_5g = body.requires5G
    if body.preferredOperator is not None:
        profile.preferred_operator = body.preferredOperator
    if body.currentPlan is not None:
        profile.current_plan_id = int(body.currentPlan) if body.currentPlan else None

    db.commit()
    db.refresh(profile)

    return api_success(data=profile.to_dict(), message="Profile updated successfully")
