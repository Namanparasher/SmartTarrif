from datetime import datetime
from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey
from ..database import Base


class Usage(Base):
    __tablename__ = "usages"

    id = Column(Integer, primary_key=True, autoincrement=True)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    data_usage = Column(Float, nullable=False)
    call_minutes = Column(Float, nullable=False)
    sms_count = Column(Float, nullable=False)
    number_of_calls = Column(Integer, default=0)
    average_call_duration = Column(Float, default=0)
    month = Column(String(7), nullable=False)  # YYYY-MM format
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "_id": str(self.id),
            "customerId": str(self.customer_id),
            "dataUsage": self.data_usage,
            "callMinutes": self.call_minutes,
            "smsCount": self.sms_count,
            "numberOfCalls": self.number_of_calls or 0,
            "averageCallDuration": self.average_call_duration or 0,
            "month": self.month,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }
