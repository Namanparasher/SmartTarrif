from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User
from ..models.feedback import Feedback
from ..models.recommendation import Recommendation
from ..schemas.feedback import SubmitFeedbackRequest
from ..dependencies import get_current_user

router = APIRouter(prefix="/api/v1/feedback", tags=["feedback"])


def api_success(data=None, message="OK"):
    resp = {"success": True, "message": message}
    if data is not None:
        resp["data"] = data
    return resp


@router.post("", status_code=201)
@router.post("/", status_code=201)
def submit(
    body: SubmitFeedbackRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Validate recommendation exists
    if body.recommendationId:
        rec = db.query(Recommendation).filter(Recommendation.id == int(body.recommendationId)).first()
        if not rec:
            raise HTTPException(status_code=404, detail="Recommendation not found.")

    feedback = Feedback(
        customer_id=current_user.id,
        recommendation_id=int(body.recommendationId),
        rating=body.rating,
        comment=body.comment or "",
    )
    db.add(feedback)
    db.commit()
    db.refresh(feedback)

    return api_success(data=feedback.to_dict(), message="Feedback submitted")


@router.get("/me")
def get_my_feedback(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    feedbacks = (
        db.query(Feedback)
        .filter(Feedback.customer_id == current_user.id)
        .order_by(Feedback.created_at.desc())
        .all()
    )
    return api_success(data=[f.to_dict() for f in feedbacks])
