import io
import csv
import math
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import func, or_, and_
from ..database import get_db
from ..models.user import User
from ..models.tariff_plan import TariffPlan
from ..models.recommendation import Recommendation, RecommendationPlan
from ..models.feedback import Feedback
from ..models.usage import Usage
from ..dependencies import require_admin

router = APIRouter(prefix="/api/v1/admin", tags=["admin"])


def api_success(data=None, message="OK"):
    resp = {"success": True, "message": message}
    if data is not None:
        resp["data"] = data
    return resp


@router.get("/dashboard")
def get_dashboard(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    # Counts
    total_customers = db.query(User).filter(User.role == "customer").count()
    active_plans = db.query(TariffPlan).filter(TariffPlan.is_active == True).count()
    total_recommendations = db.query(Recommendation).count()

    # Average recommendation score
    avg_score_result = (
        db.query(func.avg(RecommendationPlan.score))
        .scalar()
    )
    avg_score = round(avg_score_result) if avg_score_result else 0

    # Customers over time (last 6 months)
    customers_over_time = []
    for i in range(5, -1, -1):
        now = datetime.utcnow()
        month_offset = now.month - i
        year_offset = now.year
        while month_offset <= 0:
            month_offset += 12
            year_offset -= 1
        end_date = datetime(year_offset, month_offset + 1, 1) if month_offset < 12 else datetime(year_offset + 1, 1, 1)
        count = db.query(User).filter(
            User.role == "customer",
            User.created_at < end_date,
        ).count()
        label = datetime(year_offset, month_offset, 1).strftime("%b '%y")
        customers_over_time.append({"month": label, "customers": count})

    # Most recommended plans
    most_recommended_query = (
        db.query(
            RecommendationPlan.plan_id,
            func.count(RecommendationPlan.id).label("count"),
        )
        .group_by(RecommendationPlan.plan_id)
        .order_by(func.count(RecommendationPlan.id).desc())
        .limit(6)
        .all()
    )
    plan_ids = [r[0] for r in most_recommended_query]
    plans_map = {}
    if plan_ids:
        plans_list = db.query(TariffPlan).filter(TariffPlan.id.in_(plan_ids)).all()
        plans_map = {p.id: p.name for p in plans_list}
    most_recommended = [
        {"name": plans_map.get(r[0], "Unknown"), "count": r[1]}
        for r in most_recommended_query
    ]

    # Plan category distribution
    usage_distribution = (
        db.query(
            TariffPlan.category,
            func.count(TariffPlan.id).label("value"),
        )
        .group_by(TariffPlan.category)
        .all()
    )
    usage_distribution_out = [{"name": r[0] or "Other", "value": r[1]} for r in usage_distribution]

    # Score distribution
    score_buckets = [
        {"range": "0-50", "count": 0},
        {"range": "50-70", "count": 0},
        {"range": "70-85", "count": 0},
        {"range": "85-100", "count": 0},
    ]
    all_scores = db.query(RecommendationPlan.score).all()
    for (score,) in all_scores:
        if score < 50:
            score_buckets[0]["count"] += 1
        elif score < 70:
            score_buckets[1]["count"] += 1
        elif score < 85:
            score_buckets[2]["count"] += 1
        else:
            score_buckets[3]["count"] += 1

    # Feedback stats
    fb_total = db.query(Feedback).count()
    fb_positive = db.query(Feedback).filter(Feedback.rating >= 4).count()
    fb_negative = db.query(Feedback).filter(Feedback.rating <= 2).count()
    feedback_stats = [
        {"name": "Helpful", "value": fb_positive},
        {"name": "Not helpful", "value": fb_negative},
    ]

    return api_success(data={
        "cards": {
            "totalCustomers": total_customers,
            "activePlans": active_plans,
            "totalRecommendations": total_recommendations,
            "avgScore": avg_score,
        },
        "customersOverTime": customers_over_time,
        "mostRecommended": most_recommended,
        "usageDistribution": usage_distribution_out,
        "scoreDistribution": score_buckets,
        "feedbackStats": feedback_stats,
    })


@router.get("/customers")
def get_customers(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    search: str = Query("", alias="search"),
    status: str = Query("", alias="status"),
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    query = db.query(User).filter(User.role == "customer")

    if status == "active":
        query = query.filter(User.is_active == True)
    elif status == "inactive":
        query = query.filter(User.is_active == False)

    if search:
        query = query.filter(
            or_(
                User.name.ilike(f"%{search}%"),
                User.email.ilike(f"%{search}%"),
                User.phone.ilike(f"%{search}%"),
            )
        )

    total_docs = query.count()
    total_pages = math.ceil(total_docs / limit) if total_docs > 0 else 1
    skip = (page - 1) * limit
    docs = query.order_by(User.created_at.desc()).offset(skip).limit(limit).all()

    return api_success(data={
        "docs": [u.to_dict() for u in docs],
        "page": page,
        "limit": limit,
        "totalDocs": total_docs,
        "totalPages": total_pages,
        "hasNextPage": page < total_pages,
        "hasPrevPage": page > 1,
    })


@router.get("/usage")
def get_usage(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    month: str = Query("", alias="month"),
    search: str = Query("", alias="search"),
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    query = db.query(Usage)

    if month:
        query = query.filter(Usage.month == month)

    if search:
        matching_users = (
            db.query(User.id)
            .filter(
                or_(
                    User.name.ilike(f"%{search}%"),
                    User.email.ilike(f"%{search}%"),
                )
            )
            .all()
        )
        user_ids = [u[0] for u in matching_users]
        query = query.filter(Usage.customer_id.in_(user_ids))

    total_docs = query.count()
    total_pages = math.ceil(total_docs / limit) if total_docs > 0 else 1
    skip = (page - 1) * limit
    docs = query.order_by(Usage.month.desc()).offset(skip).limit(limit).all()

    # Enrich with customer name
    customer_ids = list(set(d.customer_id for d in docs))
    users = db.query(User).filter(User.id.in_(customer_ids)).all() if customer_ids else []
    user_map = {u.id: u for u in users}

    enriched_docs = []
    for d in docs:
        d_dict = d.to_dict()
        user = user_map.get(d.customer_id)
        d_dict["customerName"] = user.name if user else "Unknown"
        d_dict["customerEmail"] = user.email if user else ""
        enriched_docs.append(d_dict)

    return api_success(data={
        "docs": enriched_docs,
        "page": page,
        "limit": limit,
        "totalDocs": total_docs,
        "totalPages": total_pages,
        "hasNextPage": page < total_pages,
        "hasPrevPage": page > 1,
    })


@router.get("/feedback")
def get_feedback(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    query = db.query(Feedback)

    total_docs = query.count()
    total_pages = math.ceil(total_docs / limit) if total_docs > 0 else 1
    skip = (page - 1) * limit
    docs = query.order_by(Feedback.created_at.desc()).offset(skip).limit(limit).all()

    # Enrich with customer name
    customer_ids = list(set(d.customer_id for d in docs))
    users = db.query(User).filter(User.id.in_(customer_ids)).all() if customer_ids else []
    user_map = {u.id: u for u in users}

    enriched_docs = []
    for d in docs:
        d_dict = d.to_dict()
        user = user_map.get(d.customer_id)
        d_dict["customerName"] = user.name if user else "Unknown"
        enriched_docs.append(d_dict)

    return api_success(data={
        "docs": enriched_docs,
        "page": page,
        "limit": limit,
        "totalDocs": total_docs,
        "totalPages": total_pages,
        "hasNextPage": page < total_pages,
        "hasPrevPage": page > 1,
    })


@router.post("/usage/import")
async def import_usage(
    file: UploadFile = File(...),
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed")

    content = await file.read()
    text = content.decode("utf-8")
    reader = csv.DictReader(io.StringIO(text))

    results = {
        "totalRows": 0,
        "successfulRows": 0,
        "failedRows": 0,
        "errors": [],
    }

    for i, row in enumerate(reader):
        results["totalRows"] += 1
        try:
            customer_id_raw = row.get("customerId", "")
            if not customer_id_raw:
                results["errors"].append({"row": i + 1, "message": "Missing customerId"})
                results["failedRows"] += 1
                continue

            # Try as ID or email
            try:
                customer_id = int(customer_id_raw)
            except ValueError:
                # Might be an email
                user = db.query(User).filter(User.email == customer_id_raw.lower()).first()
                if not user:
                    results["errors"].append({"row": i + 1, "message": f"Customer '{customer_id_raw}' not found"})
                    results["failedRows"] += 1
                    continue
                customer_id = user.id

            month = row.get("month", "")
            import re
            if not month or not re.match(r"^\d{4}-\d{2}$", month):
                results["errors"].append({"row": i + 1, "message": f"Invalid month format: {month}"})
                results["failedRows"] += 1
                continue

            call_minutes = float(row.get("callMinutes", 0) or 0)
            number_of_calls = int(row.get("numberOfCalls", 0) or 0)
            if not number_of_calls:
                number_of_calls = max(5, round(call_minutes / 4))

            usage = Usage(
                customer_id=customer_id,
                data_usage=float(row.get("dataUsage", 0) or 0),
                call_minutes=call_minutes,
                sms_count=float(row.get("smsCount", 0) or 0),
                number_of_calls=number_of_calls,
                average_call_duration=round(call_minutes / max(number_of_calls, 1), 1),
                month=month,
            )
            db.add(usage)
            results["successfulRows"] += 1

        except Exception as e:
            results["errors"].append({"row": i + 1, "message": str(e)})
            results["failedRows"] += 1

    db.commit()

    return api_success(data=results, message="CSV import completed")
