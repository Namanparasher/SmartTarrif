from datetime import datetime
from sqlalchemy import Column, Integer, Float, Boolean, String, DateTime, ForeignKey
from ..database import Base


class CustomerProfile(Base):
    __tablename__ = "customer_profiles"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False, index=True)
    current_plan_id = Column(Integer, ForeignKey("tariff_plans.id"), nullable=True)
    monthly_budget = Column(Float, default=500)
    minimum_data = Column(Float, default=10)
    minimum_call_minutes = Column(Float, default=500)
    minimum_sms = Column(Float, default=100)
    requires_5g = Column(Boolean, default=False)
    preferred_operator = Column(String(50), default="")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "_id": str(self.id),
            "userId": str(self.user_id),
            "currentPlan": str(self.current_plan_id) if self.current_plan_id else None,
            "monthlyBudget": self.monthly_budget,
            "minimumData": self.minimum_data,
            "minimumCallMinutes": self.minimum_call_minutes,
            "minimumSms": self.minimum_sms,
            "requires5G": self.requires_5g,
            "preferredOperator": self.preferred_operator or "",
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }
