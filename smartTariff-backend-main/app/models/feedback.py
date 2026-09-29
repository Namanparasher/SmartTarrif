from datetime import datetime
from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey
from ..database import Base


class Feedback(Base):
    __tablename__ = "feedbacks"

    id = Column(Integer, primary_key=True, autoincrement=True)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    recommendation_id = Column(Integer, ForeignKey("recommendations.id"), nullable=False)
    rating = Column(Integer, nullable=False)  # 1-5
    comment = Column(String(1000), default="")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "_id": str(self.id),
            "customerId": str(self.customer_id),
            "recommendationId": str(self.recommendation_id),
            "rating": self.rating,
            "comment": self.comment or "",
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }
