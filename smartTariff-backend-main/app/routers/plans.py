import math
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from ..database import get_db
from ..models.user import User
from ..models.tariff_plan import TariffPlan
from ..schemas.plan import CreatePlanRequest, UpdatePlanRequest
from ..dependencies import get_current_user, require_admin

router = APIRouter(prefix="/api/v1/plans", tags=["plans"])


def api_success(data=None, message="OK"):
    resp = {"success": True, "message": message}
    if data is not None:
        resp["data"] = data
    return resp


@router.get("")
@router.get("/")
def list_plans(
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=100),
    search: str = Query("", alias="search"),
    operator: str = Query("", alias="operator"),
    category: str = Query("", alias="category"),
    minPrice: str = Query("", alias="minPrice"),
    maxPrice: str = Query("", alias="maxPrice"),
    minData: str = Query("", alias="minData"),
    fiveG: str = Query("", alias="fiveG"),
    status: str = Query("", alias="status"),
    sortBy: str = Query("", alias="sortBy"),
    db: Session = Depends(get_db),
):
    query = db.query(TariffPlan)

    # Status filter (default: active only)
    if status == "active":
        query = query.filter(TariffPlan.is_active == True)
    elif status == "inactive":
        query = query.filter(TariffPlan.is_active == False)
    elif not status:
        query = query.filter(TariffPlan.is_active == True)

    # Operator filter
    if operator:
        query = query.filter(TariffPlan.operator == operator)

    # Category filter
    if category:
        query = query.filter(TariffPlan.category == category)

    # Price range
    if minPrice:
        try:
            query = query.filter(TariffPlan.price >= float(minPrice))
        except ValueError:
            pass
    if maxPrice:
        try:
            query = query.filter(TariffPlan.price <= float(maxPrice))
        except ValueError:
            pass

    # Min data filter
    if minData:
        try:
            query = query.filter(TariffPlan.data_limit >= float(minData))
        except ValueError:
            pass

    # 5G filter
    if fiveG == "true":
        query = query.filter(TariffPlan.five_g == True)

    # Search
    if search:
        raw_search = search.strip()
        clean_num_str = "".join(c for c in raw_search if c.isdigit() or c == ".")
        conditions = [
            TariffPlan.name.ilike(f"%{raw_search}%"),
            TariffPlan.operator.ilike(f"%{raw_search}%"),
            TariffPlan.category.ilike(f"%{raw_search}%"),
            TariffPlan.description.ilike(f"%{raw_search}%"),
        ]
        if clean_num_str:
            try:
                num_val = float(clean_num_str)
                conditions.append(TariffPlan.price == num_val)
            except ValueError:
                pass
        query = query.filter(or_(*conditions))

    # Sort
    if sortBy == "price_asc":
        query = query.order_by(TariffPlan.price.asc())
    elif sortBy == "price_desc":
        query = query.order_by(TariffPlan.price.desc())
    elif sortBy == "popularity":
        query = query.order_by(TariffPlan.popularity.desc())
    elif sortBy == "data_desc":
        query = query.order_by(TariffPlan.data_limit.desc())
    else:
        query = query.order_by(TariffPlan.created_at.desc())

    # Pagination
    total_docs = query.count()
    total_pages = math.ceil(total_docs / limit) if total_docs > 0 else 1
    skip = (page - 1) * limit
    docs = query.offset(skip).limit(limit).all()

    return api_success(data={
        "docs": [p.to_dict() for p in docs],
        "page": page,
        "limit": limit,
        "totalDocs": total_docs,
        "totalPages": total_pages,
        "hasNextPage": page < total_pages,
        "hasPrevPage": page > 1,
    })


@router.get("/{plan_id}")
def get_plan(plan_id: int, db: Session = Depends(get_db)):
    plan = db.query(TariffPlan).filter(TariffPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found.")
    return api_success(data=plan.to_dict())


@router.post("", status_code=201)
@router.post("/", status_code=201)
def create_plan(
    body: CreatePlanRequest,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    plan = TariffPlan(
        plan_code=body.planCode,
        name=body.name,
        operator=body.operator,
        category=body.category or "Standard",
        price=body.price,
        monthly_equivalent=body.monthlyEquivalent if body.monthlyEquivalent is not None else body.price,
        duration_months=body.durationMonths or 1,
        validity=body.validity,
        data_limit=body.dataLimit,
        call_minutes=body.callMinutes,
        sms_limit=body.smsLimit,
        offer_type=body.offerType or "Standalone",
        individual_cost=body.individualCost if body.individualCost is not None else body.price,
        discount_inr=body.discountInr or 0.0,
        discount_percent=body.discountPercent or 0.0,
        five_g=body.fiveG or False,
        description=body.description or "",
        image=body.image,
        popularity=body.popularity or 0,
        is_active=body.isActive if body.isActive is not None else True,
    )
    plan.set_benefits(body.benefits or [])
    db.add(plan)
    db.commit()
    db.refresh(plan)

    return api_success(data=plan.to_dict(), message="Plan created successfully")


@router.patch("/{plan_id}")
def update_plan(
    plan_id: int,
    body: UpdatePlanRequest,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    plan = db.query(TariffPlan).filter(TariffPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found.")

    if body.planCode is not None:
        plan.plan_code = body.planCode
    if body.name is not None:
        plan.name = body.name
    if body.operator is not None:
        plan.operator = body.operator
    if body.category is not None:
        plan.category = body.category
    if body.price is not None:
        plan.price = body.price
    if body.monthlyEquivalent is not None:
        plan.monthly_equivalent = body.monthlyEquivalent
    if body.durationMonths is not None:
        plan.duration_months = body.durationMonths
    if body.validity is not None:
        plan.validity = body.validity
    if body.dataLimit is not None:
        plan.data_limit = body.dataLimit
    if body.callMinutes is not None:
        plan.call_minutes = body.callMinutes
    if body.smsLimit is not None:
        plan.sms_limit = body.smsLimit
    if body.offerType is not None:
        plan.offer_type = body.offerType
    if body.individualCost is not None:
        plan.individual_cost = body.individualCost
    if body.discountInr is not None:
        plan.discount_inr = body.discountInr
    if body.discountPercent is not None:
        plan.discount_percent = body.discountPercent
    if body.fiveG is not None:
        plan.five_g = body.fiveG
    if body.description is not None:
        plan.description = body.description
    if body.benefits is not None:
        plan.set_benefits(body.benefits)
    if body.image is not None:
        plan.image = body.image
    if body.popularity is not None:
        plan.popularity = body.popularity
    if body.isActive is not None:
        plan.is_active = body.isActive

    db.commit()
    db.refresh(plan)

    return api_success(data=plan.to_dict(), message="Plan updated successfully")


@router.delete("/{plan_id}")
def delete_plan(
    plan_id: int,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    plan = db.query(TariffPlan).filter(TariffPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found.")

    plan.is_active = False
    db.commit()
    db.refresh(plan)

    return api_success(data=plan.to_dict(), message="Plan deactivated successfully")
