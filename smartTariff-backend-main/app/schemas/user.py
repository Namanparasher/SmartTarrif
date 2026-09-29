from pydantic import BaseModel
from typing import Optional


class UpdateUserRequest(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    avatar: Optional[str] = None


class UpdateProfileRequest(BaseModel):
    monthlyBudget: Optional[float] = None
    minimumData: Optional[float] = None
    minimumCallMinutes: Optional[float] = None
    minimumSms: Optional[float] = None
    requires5G: Optional[bool] = None
    preferredOperator: Optional[str] = None
    currentPlan: Optional[str] = None
