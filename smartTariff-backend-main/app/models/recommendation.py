import json
from datetime import datetime
from sqlalchemy import Column, Integer, Float, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base


class RecommendationPlan(Base):
    """Normalized join table — replaces MongoDB's embedded plans[] array."""
    __tablename__ = "recommendation_plans"

    id = Column(Integer, primary_key=True, autoincrement=True)
    recommendation_id = Column(Integer, ForeignKey("recommendations.id", ondelete="CASCADE"), nullable=False, index=True)
    plan_id = Column(Integer, ForeignKey("tariff_plans.id"), nullable=False)
    rank = Column(Integer, nullable=False)
    score = Column(Float, nullable=False)
    reasons = Column(Text, default="[]")  # JSON array

    recommendation = relationship("Recommendation", back_populates="plans")

    def get_reasons(self) -> list:
        try:
            return json.loads(self.reasons) if self.reasons else []
        except (json.JSONDecodeError, TypeError):
            return []

    def set_reasons(self, reasons_list: list):
        self.reasons = json.dumps(reasons_list)

    def to_dict(self, plan_dict=None):
        result = {
            "planId": str(self.plan_id),
            "rank": self.rank,
            "score": self.score,
            "reasons": self.get_reasons(),
        }
        if plan_dict is not None:
            result["plan"] = plan_dict
        return result


class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    input_snapshot = Column(Text, default="{}")  # JSON
    generated_by = Column(String(20), default="rule-based")  # 'ml' | 'rule-based'
    generated_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    plans = relationship("RecommendationPlan", back_populates="recommendation", cascade="all, delete-orphan", lazy="joined")

    def get_input_snapshot(self) -> dict:
        try:
            return json.loads(self.input_snapshot) if self.input_snapshot else {}
        except (json.JSONDecodeError, TypeError):
            return {}

    def set_input_snapshot(self, snapshot: dict):
        self.input_snapshot = json.dumps(snapshot)

    def to_dict(self, plan_dicts: dict = None):
        """
        plan_dicts: optional mapping of plan_id -> plan.to_dict() for populating plan details
        """
        plans_out = []
        for rp in sorted(self.plans, key=lambda p: p.rank):
            pd = plan_dicts.get(rp.plan_id) if plan_dicts else None
            plans_out.append(rp.to_dict(plan_dict=pd))

        return {
            "_id": str(self.id),
            "customerId": str(self.customer_id),
            "generatedAt": self.generated_at.isoformat() if self.generated_at else None,
            "generatedBy": self.generated_by,
            "inputSnapshot": self.get_input_snapshot(),
            "plans": plans_out,
        }
