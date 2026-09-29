"""
Recommendation Service — rule-based scoring engine (ported from JS) + ML fallback.
Same scoring weights and algorithm as the original Node.js/Express implementation.
"""
import json
import math
from datetime import datetime
from sqlalchemy.orm import Session
from ..models.customer_profile import CustomerProfile
from ..models.usage import Usage
from ..models.tariff_plan import TariffPlan
from ..models.recommendation import Recommendation, RecommendationPlan
from .ml_service import get_recommendations as ml_get_recommendations

# ─────────────────────────────────────────────────────────────────────────────
# Rule-Based Fallback Engine — same weights as frontend & original backend
# ─────────────────────────────────────────────────────────────────────────────

WEIGHTS = {
    "data": 0.4,
    "calls": 0.25,
    "sms": 0.1,
    "budget": 0.15,
    "value": 0.1,
}


def coverage_score(required: float, provided: float | None) -> float:
    if not required or required <= 0:
        return 100
    if provided is None:
        return 100  # null = unlimited
    if not math.isfinite(provided) or provided >= 999999:
        return 100
    ratio = provided / required
    if 1 <= ratio <= 1.8:
        return 100
    if 1.8 < ratio <= 3:
        return 90
    if ratio > 3:
        return 78
    return max(0, round(ratio * 100) - 5)


def budget_score_fn(budget: float, price: float) -> float:
    if not budget or budget <= 0:
        return 70
    if price <= budget:
        utilization = price / budget
        return round(60 + utilization * 40)
    over = (price - budget) / budget
    return max(0, round(100 - over * 140))


def value_score_fn(plan: TariffPlan) -> float:
    data_component = min(plan.data_limit or 0, 250)
    call_component = 100  # voice is unlimited on all plans
    sms_component = min(plan.sms_limit or 0, 500) / 10
    effective_price = plan.monthly_equivalent if plan.monthly_equivalent else plan.price
    raw = (data_component + call_component + sms_component) / max(effective_price, 1)
    return min(100, round(raw * 50))


def build_reasons(
    plan: TariffPlan,
    data_score: float,
    call_score: float,
    sms_score: float,
    budget_scr: float,
    preferences: CustomerProfile | None,
) -> list[str]:
    reasons = []

    if plan.discount_percent and plan.discount_percent > 0:
        reasons.append(f"Bundle deal: Save {plan.discount_percent}% (₹{int(plan.discount_inr)} discount)")

    if data_score >= 85:
        reasons.append(f"Matches your {plan.data_limit}GB data needs")
    elif data_score >= 60:
        reasons.append("Covers your data usage")
    else:
        reasons.append("May fall short on your data usage")

    if budget_scr >= 80:
        reasons.append("Fits your monthly budget")
    elif budget_scr >= 50:
        reasons.append("Close to your monthly budget")
    else:
        reasons.append("Priced above your usual budget")

    reasons.append("Unlimited voice calling included")

    if sms_score >= 85 and preferences and preferences.minimum_sms:
        reasons.append("Meets your SMS requirements")

    if plan.five_g and preferences and preferences.requires_5g:
        reasons.append("Includes 5G as required")
    elif plan.five_g:
        reasons.append("5G ready network")

    val_scr = value_score_fn(plan)
    if val_scr >= 70:
        reasons.append("High value per rupee")

    return reasons[:5]


def score_plan_rule_based(
    plan: TariffPlan,
    usage: Usage | None,
    preferences: CustomerProfile | None,
) -> dict:
    required_data = max(usage.data_usage if usage else 0, preferences.minimum_data if preferences else 0)
    required_calls = max(usage.call_minutes if usage else 0, preferences.minimum_call_minutes if preferences else 0)
    required_sms = max(usage.sms_count if usage else 0, preferences.minimum_sms if preferences else 0)
    budget = preferences.monthly_budget if preferences else 0

    effective_price = plan.monthly_equivalent if plan.monthly_equivalent else plan.price

    data_score = coverage_score(required_data, plan.data_limit)
    call_score = coverage_score(required_calls, plan.call_minutes)
    sms_score = coverage_score(required_sms, plan.sms_limit)
    budget_scr = budget_score_fn(budget, effective_price)
    val_scr = value_score_fn(plan)

    total = (
        data_score * WEIGHTS["data"]
        + call_score * WEIGHTS["calls"]
        + sms_score * WEIGHTS["sms"]
        + budget_scr * WEIGHTS["budget"]
        + val_scr * WEIGHTS["value"]
    )

    # Hard constraint: 5G requirement
    if preferences and preferences.requires_5g and not plan.five_g:
        total *= 0.7

    total = max(0, min(100, round(total)))
    reasons = build_reasons(plan, data_score, call_score, sms_score, budget_scr, preferences)

    return {"score": total, "reasons": reasons}


def run_fallback_engine(
    active_plans: list[TariffPlan],
    usage: Usage | None,
    preferences: CustomerProfile | None,
) -> list[dict]:
    scored = []
    for plan in active_plans:
        result = score_plan_rule_based(plan, usage, preferences)
        scored.append({
            "planId": plan.id,
            "score": result["score"],
            "reasons": result["reasons"],
        })

    scored.sort(key=lambda x: x["score"], reverse=True)

    return [
        {
            "planId": item["planId"],
            "rank": idx + 1,
            "score": item["score"],
            "reasons": item["reasons"],
        }
        for idx, item in enumerate(scored[:3])
    ]


# ─────────────────────────────────────────────────────────────────────────────
# Main Recommendation Service
# ─────────────────────────────────────────────────────────────────────────────

async def generate_recommendations(customer_id: int, db: Session) -> dict:
    """
    Generate recommendations for a customer.
    Attempts ML API first; falls back to rule-based engine on failure.
    """
    # Step 1: Fetch customer profile
    profile = db.query(CustomerProfile).filter(CustomerProfile.user_id == customer_id).first()
    if not profile:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Customer profile not found. Please complete your profile first.")

    # Step 2: Fetch latest usage
    latest_usage = (
        db.query(Usage)
        .filter(Usage.customer_id == customer_id)
        .order_by(Usage.month.desc())
        .first()
    )
    if not latest_usage:
        current_m = datetime.utcnow().strftime("%Y-%m")
        call_min = profile.minimum_call_minutes or 350
        num_calls = max(5, int(call_min / 4))
        latest_usage = Usage(
            customer_id=customer_id,
            data_usage=float(profile.minimum_data or 30.0),
            call_minutes=int(call_min),
            sms_count=int(profile.minimum_sms or 40),
            number_of_calls=num_calls,
            average_call_duration=round(call_min / num_calls, 1),
            month=current_m,
        )
        db.add(latest_usage)
        db.flush()

    # Step 3: Fetch all active tariff plans
    active_plans = db.query(TariffPlan).filter(TariffPlan.is_active == True).all()
    if not active_plans:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="No active tariff plans available.")

    # Build plan map for quick lookups
    active_plan_map = {p.id: p for p in active_plans}

    # Step 4: Build ML payload
    ml_payload = {
        "customer": {
            "customerId": str(customer_id),
            "monthlyBudget": profile.monthly_budget,
            "minimumData": profile.minimum_data,
            "minimumCallMinutes": profile.minimum_call_minutes,
            "minimumSms": profile.minimum_sms,
            "requires5G": profile.requires_5g,
            "preferredOperator": profile.preferred_operator or "Any",
        },
        "usage": {
            "dataUsage": latest_usage.data_usage,
            "callMinutes": latest_usage.call_minutes,
            "smsCount": latest_usage.sms_count,
            "numberOfCalls": latest_usage.number_of_calls,
            "averageCallDuration": latest_usage.average_call_duration,
        },
        "plans": [
            {
                "planId": p.id,
                "planCode": p.plan_code,
                "name": p.name,
                "operator": p.operator,
                "price": p.price,
                "monthlyEquivalent": p.monthly_equivalent,
                "durationMonths": p.duration_months,
                "discountPercent": p.discount_percent,
                "discountInr": p.discount_inr,
                "dataLimit": p.data_limit,
                "callMinutes": p.call_minutes,
                "smsLimit": p.sms_limit,
                "fiveG": p.five_g,
                "validity": p.validity,
            }
            for p in active_plans
        ],
    }

    recommended_plans = []
    generated_by = "rule-based"

    # Step 5: Try ML API
    ml_response = await ml_get_recommendations(ml_payload)

    if ml_response and "recommendations" in ml_response:
        recs = ml_response["recommendations"]
        # Validate ML response
        valid_recs = []
        for rec in recs:
            plan_id = rec.get("planId")
            if plan_id and int(plan_id) in active_plan_map:
                score = rec.get("score", 0)
                if 0 <= score <= 100:
                    valid_recs.append({
                        "planId": int(plan_id),
                        "score": score,
                        "reasons": rec.get("reasons", []),
                    })

        if valid_recs:
            valid_recs.sort(key=lambda x: x["score"], reverse=True)
            recommended_plans = [
                {
                    "planId": item["planId"],
                    "rank": idx + 1,
                    "score": item["score"],
                    "reasons": item["reasons"],
                }
                for idx, item in enumerate(valid_recs[:3])
            ]
            generated_by = "ml"
            print("✅ Using ML-based recommendations")
        else:
            print("⚠️  ML response validation failed")
            print("↩️  Falling back to rule-based engine")

    # Step 6: Fallback to rule-based if ML didn't work
    if not recommended_plans:
        recommended_plans = run_fallback_engine(active_plans, latest_usage, profile)
        generated_by = "rule-based"
        print("✅ Using rule-based fallback recommendations")

    # Step 7: Build input snapshot
    input_snapshot = {
        "usage": {
            "dataUsage": latest_usage.data_usage,
            "callMinutes": latest_usage.call_minutes,
            "smsCount": latest_usage.sms_count,
            "month": latest_usage.month,
        },
        "preferences": {
            "monthlyBudget": profile.monthly_budget,
            "minimumData": profile.minimum_data,
            "minimumCallMinutes": profile.minimum_call_minutes,
            "minimumSms": profile.minimum_sms,
            "requires5G": profile.requires_5g,
        },
    }

    # Step 8: Save recommendation to DB
    recommendation = Recommendation(
        customer_id=customer_id,
        generated_by=generated_by,
        generated_at=datetime.utcnow(),
    )
    recommendation.set_input_snapshot(input_snapshot)
    db.add(recommendation)
    db.flush()  # Get the ID

    for rp_data in recommended_plans:
        rp = RecommendationPlan(
            recommendation_id=recommendation.id,
            plan_id=rp_data["planId"],
            rank=rp_data["rank"],
            score=rp_data["score"],
        )
        rp.set_reasons(rp_data["reasons"])
        db.add(rp)

    db.commit()
    db.refresh(recommendation)

    # Step 9: Build response with populated plan details
    plan_dicts = {p.id: p.to_dict() for p in active_plans}
    return recommendation.to_dict(plan_dicts=plan_dicts)
