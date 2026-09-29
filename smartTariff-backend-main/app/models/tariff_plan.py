import json
from datetime import datetime
from sqlalchemy import Column, Integer, Float, String, Boolean, DateTime, Text
from ..database import Base


class TariffPlan(Base):
    __tablename__ = "tariff_plans"

    id = Column(Integer, primary_key=True, autoincrement=True)
    plan_code = Column(String(50), nullable=True)
    name = Column(String(150), nullable=False)
    operator = Column(String(50), nullable=True, default="")
    category = Column(String(50), default="Standard")
    price = Column(Float, nullable=False)
    monthly_equivalent = Column(Float, nullable=True)
    duration_months = Column(Integer, default=1)
    validity = Column(Integer, nullable=False)  # days
    data_limit = Column(Float, nullable=True)  # GB, null = unlimited
    call_minutes = Column(Float, nullable=True)  # null = unlimited
    sms_limit = Column(Float, nullable=True)  # null = unlimited
    offer_type = Column(String(50), default="Standalone")
    individual_cost = Column(Float, nullable=True)
    discount_inr = Column(Float, default=0.0)
    discount_percent = Column(Float, default=0.0)
    five_g = Column(Boolean, default=False)
    description = Column(Text, default="")
    benefits = Column(Text, default="[]")  # JSON array stored as text
    image = Column(String(500), nullable=True)
    popularity = Column(Integer, default=0)
    is_active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def get_benefits(self) -> list:
        try:
            return json.loads(self.benefits) if self.benefits else []
        except (json.JSONDecodeError, TypeError):
            return []

    def set_benefits(self, benefits_list: list):
        self.benefits = json.dumps(benefits_list)

    def to_dict(self):
        return {
            "_id": str(self.id),
            "planId": self.plan_code or f"P{self.id:02d}",
            "planCode": self.plan_code or f"P{self.id:02d}",
            "name": self.name,
            "operator": self.operator,
            "category": self.category or "Standard",
            "price": self.price,
            "monthlyEquivalent": self.monthly_equivalent if self.monthly_equivalent is not None else self.price,
            "durationMonths": self.duration_months or 1,
            "validity": self.validity,
            "dataLimit": self.data_limit,
            "callMinutes": self.call_minutes,
            "smsLimit": self.sms_limit,
            "offerType": self.offer_type or "Standalone",
            "individualCost": self.individual_cost if self.individual_cost is not None else self.price,
            "discountInr": self.discount_inr or 0.0,
            "discountPercent": self.discount_percent or 0.0,
            "fiveG": self.five_g,
            "description": self.description or "",
            "benefits": self.get_benefits(),
            "image": self.image,
            "popularity": self.popularity or 0,
            "isActive": self.is_active,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }
