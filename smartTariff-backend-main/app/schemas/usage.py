from pydantic import BaseModel, Field
from typing import Optional


class CreateUsageRequest(BaseModel):
    dataUsage: float = Field(..., ge=0)
    callMinutes: float = Field(..., ge=0)
    smsCount: float = Field(..., ge=0)
    numberOfCalls: Optional[int] = None
    averageCallDuration: Optional[float] = None
    month: str = Field(..., pattern=r"^\d{4}-\d{2}$")


class UpdateUsageRequest(BaseModel):
    dataUsage: Optional[float] = None
    callMinutes: Optional[float] = None
    smsCount: Optional[float] = None
    numberOfCalls: Optional[int] = None
    averageCallDuration: Optional[float] = None
    month: Optional[str] = None
