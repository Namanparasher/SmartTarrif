import math
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User
from ..models.usage import Usage
from ..schemas.usage import CreateUsageRequest, UpdateUsageRequest
from ..dependencies import get_current_user

router = APIRouter(prefix="/api/v1/usage", tags=["usage"])


def api_success(data=None, message="OK"):
    resp = {"success": True, "message": message}
    if data is not None:
        resp["data"] = data
    return resp


@router.get("/me")
def get_my_usage(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    month: str = Query("", alias="month"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Usage).filter(Usage.customer_id == current_user.id)
    if month:
        query = query.filter(Usage.month == month)

    total_docs = query.count()
    total_pages = math.ceil(total_docs / limit) if total_docs > 0 else 1
    skip = (page - 1) * limit
    docs = query.order_by(Usage.month.desc()).offset(skip).limit(limit).all()

    return api_success(data={
        "docs": [d.to_dict() for d in docs],
        "page": page,
        "limit": limit,
        "totalDocs": total_docs,
        "totalPages": total_pages,
        "hasNextPage": page < total_pages,
        "hasPrevPage": page > 1,
    })


@router.get("/me/latest")
def get_my_latest_usage(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    usage = (
        db.query(Usage)
        .filter(Usage.customer_id == current_user.id)
        .order_by(Usage.month.desc())
        .first()
    )
    return api_success(data=usage.to_dict() if usage else None)


@router.post("", status_code=201)
@router.post("/", status_code=201)
def create_usage(
    body: CreateUsageRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    number_of_calls = body.numberOfCalls
    if not number_of_calls and body.callMinutes:
        number_of_calls = max(5, round(body.callMinutes / 4))

    average_call_duration = body.averageCallDuration
    if body.callMinutes and number_of_calls:
        average_call_duration = round(body.callMinutes / number_of_calls, 1)

    usage = Usage(
        customer_id=current_user.id,
        data_usage=body.dataUsage,
        call_minutes=body.callMinutes,
        sms_count=body.smsCount,
        number_of_calls=number_of_calls or 0,
        average_call_duration=average_call_duration or 0,
        month=body.month,
    )
    db.add(usage)
    db.commit()
    db.refresh(usage)

    return api_success(data=usage.to_dict(), message="Usage record created")


@router.patch("/{usage_id}")
def update_usage(
    usage_id: int,
    body: UpdateUsageRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    usage = db.query(Usage).filter(Usage.id == usage_id).first()
    if not usage:
        raise HTTPException(status_code=404, detail="Usage record not found.")

    if body.dataUsage is not None:
        usage.data_usage = body.dataUsage
    if body.callMinutes is not None:
        usage.call_minutes = body.callMinutes
    if body.smsCount is not None:
        usage.sms_count = body.smsCount
    if body.numberOfCalls is not None:
        usage.number_of_calls = body.numberOfCalls
    if body.averageCallDuration is not None:
        usage.average_call_duration = body.averageCallDuration
    if body.month is not None:
        usage.month = body.month

    db.commit()
    db.refresh(usage)

    return api_success(data=usage.to_dict(), message="Usage record updated")
