import math
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User
from ..models.recommendation import Recommendation, RecommendationPlan
from ..models.tariff_plan import TariffPlan
from ..services.recommendation_service import generate_recommendations
from ..services.ml_service import get_model_status
from ..dependencies import get_current_user

router = APIRouter(prefix="/api/v1/recommendations", tags=["recommendations"])


def api_success(data=None, message="OK"):
    resp = {"success": True, "message": message}
    if data is not None:
        resp["data"] = data
    return resp


def _populate_recommendation(rec: Recommendation, db: Session) -> dict:
    """Populate plan details into a recommendation dict."""
    plan_ids = [rp.plan_id for rp in rec.plans]
    plans = db.query(TariffPlan).filter(TariffPlan.id.in_(plan_ids)).all() if plan_ids else []
    plan_dicts = {p.id: p.to_dict() for p in plans}
    return rec.to_dict(plan_dicts=plan_dicts)


@router.get("/model-status")
def model_status():
    """Returns active ML model status and loaded configuration metadata."""
    return api_success(data=get_model_status(), message="ML Model status")


@router.post("/generate", status_code=201)
async def generate(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    result = await generate_recommendations(current_user.id, db)
    return api_success(data=result, message="Recommendations generated")


@router.get("/me")
def get_my_latest(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rec = (
        db.query(Recommendation)
        .filter(Recommendation.customer_id == current_user.id)
        .order_by(Recommendation.generated_at.desc())
        .first()
    )

    if not rec:
        return api_success(data=None, message="No recommendations found")

    return api_success(data=_populate_recommendation(rec, db))


@router.get("/history")
def get_history(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    base_query = db.query(Recommendation).filter(Recommendation.customer_id == current_user.id)

    total_docs = base_query.count()
    total_pages = math.ceil(total_docs / limit) if total_docs > 0 else 1
    skip = (page - 1) * limit
    recs = base_query.order_by(Recommendation.generated_at.desc()).offset(skip).limit(limit).all()

    # Get all plan IDs for batch loading
    all_plan_ids = set()
    for rec in recs:
        for rp in rec.plans:
            all_plan_ids.add(rp.plan_id)

    plans = db.query(TariffPlan).filter(TariffPlan.id.in_(all_plan_ids)).all() if all_plan_ids else []
    plan_dicts = {p.id: p.to_dict() for p in plans}

    docs = []
    for rec in recs:
        rec_dict = rec.to_dict(plan_dicts=plan_dicts)
        # Add top plan info for history view
        top_plan = next((p for p in rec_dict["plans"] if p["rank"] == 1), None)
        rec_dict["topPlanName"] = top_plan["plan"]["name"] if top_plan and top_plan.get("plan") else "N/A"
        rec_dict["topScore"] = top_plan["score"] if top_plan else 0
        docs.append(rec_dict)

    return api_success(data={
        "docs": docs,
        "page": page,
        "limit": limit,
        "totalDocs": total_docs,
        "totalPages": total_pages,
        "hasNextPage": page < total_pages,
        "hasPrevPage": page > 1,
    })


@router.get("/{rec_id}")
def get_by_id(
    rec_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rec = db.query(Recommendation).filter(Recommendation.id == rec_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found.")

    # Verify ownership
    if current_user.role != "admin" and rec.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied.")

    return api_success(data=_populate_recommendation(rec, db))
