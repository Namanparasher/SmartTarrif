from pydantic import BaseModel, Field
from typing import Optional, List


class CreatePlanRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=150)
    operator: Optional[str] = ""
    category: Optional[str] = "Standard"
    price: float = Field(..., ge=0)
    monthlyEquivalent: Optional[float] = None
    durationMonths: Optional[int] = 1
    validity: int = Field(..., ge=1)
    dataLimit: Optional[float] = None
    callMinutes: Optional[float] = None
    smsLimit: Optional[float] = None
    offerType: Optional[str] = "Standalone"
    individualCost: Optional[float] = None
    discountInr: Optional[float] = 0.0
    discountPercent: Optional[float] = 0.0
    fiveG: Optional[bool] = False
    description: Optional[str] = ""
    benefits: Optional[List[str]] = []
    image: Optional[str] = None
    popularity: Optional[int] = 0
    isActive: Optional[bool] = True
    planCode: Optional[str] = None


class UpdatePlanRequest(BaseModel):
    name: Optional[str] = None
    operator: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    monthlyEquivalent: Optional[float] = None
    durationMonths: Optional[int] = None
    validity: Optional[int] = None
    dataLimit: Optional[float] = None
    callMinutes: Optional[float] = None
    smsLimit: Optional[float] = None
    offerType: Optional[str] = None
    individualCost: Optional[float] = None
    discountInr: Optional[float] = None
    discountPercent: Optional[float] = None
    fiveG: Optional[bool] = None
    description: Optional[str] = None
    benefits: Optional[List[str]] = None
    image: Optional[str] = None
    popularity: Optional[int] = None
    isActive: Optional[bool] = None
    planCode: Optional[str] = None
