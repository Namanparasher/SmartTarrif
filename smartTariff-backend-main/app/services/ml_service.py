"""
ML Service — Integrates the SmartTariff V3.2 Random Forest Regressor ('smarttariff_improved_random_forest.pkl')
and model configuration ('smarttariff_v3_2_config.json') with transparent explainability and rule-based fallback.
"""

import os
import json
import warnings
from pathlib import Path
from typing import Any, Dict, List, Optional
import httpx
from ..config import settings

# Suppress unpickling version warnings for clean logs
warnings.filterwarnings("ignore", category=UserWarning)

# In-memory caches for loaded model and configuration
_LOADED_MODEL_CACHE: Optional[Any] = None
_LOADED_MODEL_PATH: Optional[str] = None
_LOADED_CONFIG_CACHE: Optional[Dict[str, Any]] = None
_LOADED_CONFIG_PATH: Optional[str] = None


def _resolve_file_path(filename: str) -> Optional[Path]:
    """Find a file in workspace root, backend root, or working directory."""
    if not filename:
        return None

    backend_root = Path(__file__).resolve().parent.parent.parent
    workspace_root = backend_root.parent

    candidate_paths = [
        workspace_root / filename,
        backend_root / filename,
        Path(filename),
        backend_root.parent / "smarttariff_improved_random_forest.pkl",
        backend_root / "smarttariff_improved_random_forest.pkl",
    ]

    for p in candidate_paths:
        if p.exists() and p.is_file():
            return p

    return None


def load_model_config() -> Optional[Dict[str, Any]]:
    """Loads and caches the SmartTariff V3.2 JSON model configuration."""
    global _LOADED_CONFIG_CACHE, _LOADED_CONFIG_PATH

    config_file = _resolve_file_path(settings.ml_config_path) or _resolve_file_path("smarttariff_v3_2_config.json")
    if not config_file:
        return None

    config_path_str = str(config_file.resolve())
    if _LOADED_CONFIG_CACHE is not None and _LOADED_CONFIG_PATH == config_path_str:
        return _LOADED_CONFIG_CACHE

    try:
        with open(config_path_str, "r", encoding="utf-8") as f:
            data = json.load(f)
        _LOADED_CONFIG_CACHE = data
        _LOADED_CONFIG_PATH = config_path_str
        return _LOADED_CONFIG_CACHE
    except Exception as e:
        print(f"[ML Service] Warning: Could not load ML config '{config_path_str}': {e}")
        return None


def load_local_model() -> Optional[Any]:
    """
    Safely loads and caches the Random Forest model from .pkl file.
    Returns the loaded model or None if the file is not yet provided.
    """
    global _LOADED_MODEL_CACHE, _LOADED_MODEL_PATH

    model_file = _resolve_file_path(settings.ml_model_path) or _resolve_file_path("smarttariff_improved_random_forest.pkl")
    if not model_file:
        return None

    model_path_str = str(model_file.resolve())
    if _LOADED_MODEL_CACHE is not None and _LOADED_MODEL_PATH == model_path_str:
        return _LOADED_MODEL_CACHE

    try:
        import joblib
        loaded = joblib.load(model_path_str)
        _LOADED_MODEL_CACHE = loaded
        _LOADED_MODEL_PATH = model_path_str
        cfg = load_model_config()
        model_name = cfg.get("model_name", "SmartTariff ML") if cfg else "SmartTariff ML"
        ver = cfg.get("version", "3.2.0") if cfg else "3.2"
        print(f"[ML Service] Loaded {model_name} v{ver} ({model_file.name})")
        return _LOADED_MODEL_CACHE
    except Exception as e:
        try:
            import pickle
            with open(model_path_str, "rb") as f:
                loaded = pickle.load(f)
            _LOADED_MODEL_CACHE = loaded
            _LOADED_MODEL_PATH = model_path_str
            print(f"[ML Service] Loaded local ML model via pickle: {model_file.name}")
            return _LOADED_MODEL_CACHE
        except Exception as err2:
            print(f"[ML Service] Warning: Could not load ML model file '{model_path_str}': {err2}")
            return None


def get_model_status() -> Dict[str, Any]:
    """Returns runtime ML model status and configuration metadata."""
    model = load_local_model()
    cfg = load_model_config()

    if model is not None:
        features = getattr(model, "feature_names_in_", None)
        if features is not None:
            features = list(features)
        elif cfg and "model_features" in cfg:
            features = cfg["model_features"]

        return {
            "status": "active",
            "model_name": cfg.get("model_name", "SmartTariff V3.2") if cfg else "SmartTariff V3.2",
            "version": cfg.get("version", "3.2.0") if cfg else "3.2.0",
            "model_type": type(model).__name__,
            "n_features": getattr(model, "n_features_in_", 10),
            "features": features,
            "training_customers": cfg.get("training_customers", 20000) if cfg else 20000,
            "supported_durations": cfg.get("supported_durations", {"1": "Monthly", "3": "3 Months", "12": "Annual"}) if cfg else {},
            "plans_configured": len(cfg.get("plans", [])) if cfg else 20,
        }

    return {
        "status": "inactive",
        "message": "Local ML model not loaded — using rule-based recommendation fallback engine",
    }


def _generate_reasons(
    plan: Dict[str, Any],
    customer: Dict[str, Any],
    usage: Dict[str, Any],
    score: int,
) -> List[str]:
    """Generate human-understandable explainability insights for ML recommendations."""
    reasons = []

    discount_pct = float(plan.get("discountPercent") or plan.get("discount_percent") or 0.0)
    discount_inr = float(plan.get("discountInr") or plan.get("discount_inr") or 0.0)
    duration_months = int(plan.get("durationMonths") or plan.get("duration_months") or 1)

    if discount_pct > 0:
        reasons.append(f"Bundle deal: Save {discount_pct}% (₹{int(discount_inr)} discount)")

    data_limit = float(plan.get("dataLimit") or plan.get("data_per_month_gb") or 0.0)
    req_data = float(usage.get("dataUsage") or customer.get("minimumData") or 0.0)
    if data_limit >= req_data and req_data > 0:
        reasons.append(f"Matches your {int(data_limit)} GB monthly data needs")
    elif data_limit >= req_data * 0.75:
        reasons.append(f"Covers {int(data_limit)} GB of your required data")

    monthly_eq = float(plan.get("monthlyEquivalent") or plan.get("monthly_equivalent_inr") or plan.get("price") or 0.0)
    budget = float(customer.get("monthlyBudget") or 500.0)
    if monthly_eq <= budget:
        reasons.append("Fits your monthly budget")
    elif monthly_eq <= budget * 1.15:
        reasons.append("Close to your target monthly budget")

    reasons.append("Unlimited voice calling included")

    if plan.get("fiveG") and customer.get("requires5G"):
        reasons.append("Includes 5G as required")
    elif plan.get("fiveG"):
        reasons.append("5G ready high-speed network")

    if score >= 85:
        reasons.append(f"High ML Match Score ({score}%)")

    return reasons[:5]


def predict_with_local_model(model_obj: Any, payload: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """
    Runs in-process inference using the SmartTariff V3.2 RandomForestRegressor.
    Builds the exact (customer, plan) feature matrix expected by the model.
    """
    try:
        import pandas as pd

        customer = payload.get("customer", {})
        usage = payload.get("usage", {})
        plans = payload.get("plans", [])
        if not plans:
            return None

        cfg = load_model_config()
        feature_names = (
            cfg.get("model_features")
            if cfg and "model_features" in cfg
            else [
                "internet_usage_gb",
                "monthly_call_duration",
                "sms_usage_per_month",
                "monthly_spending",
                "budget_inr",
                "data_per_month_gb",
                "sms_per_month",
                "monthly_equivalent_inr",
                "duration_months",
                "discount_percent",
            ]
        )

        # 1. Customer Input Features
        cust_internet = float(usage.get("dataUsage") or customer.get("minimumData") or 0.0)
        cust_calls = float(usage.get("callMinutes") or customer.get("minimumCallMinutes") or 0.0)
        cust_sms = float(usage.get("smsCount") or customer.get("minimumSms") or 0.0)
        cust_budget = float(customer.get("monthlyBudget") or 500.0)
        cust_spending = float(usage.get("currentSpending") or customer.get("currentSpending") or cust_budget)

        preferred_duration = customer.get("preferredDuration")
        requires_5g = bool(customer.get("requires5G"))

        # 2. Build Plan Feature Rows
        feature_rows = []
        for p in plans:
            # Monthly data allowance (null/high = unlimited, default 250 GB)
            data_allowance = p.get("dataLimit")
            if data_allowance is None or data_allowance >= 999:
                data_val = 250.0
            else:
                data_val = float(data_allowance)

            # Monthly SMS allowance
            sms_allowance = p.get("smsLimit")
            if sms_allowance is None or sms_allowance >= 999:
                sms_val = 500.0
            else:
                sms_val = float(sms_allowance)

            # Duration in months
            dur_months = p.get("durationMonths")
            if not dur_months:
                validity = p.get("validity", 28)
                if validity >= 300:
                    dur_months = 12
                elif validity >= 70:
                    dur_months = 3
                else:
                    dur_months = 1
            dur_months = int(dur_months)

            # Monthly equivalent price
            m_eq = p.get("monthlyEquivalent")
            if not m_eq:
                m_eq = p.get("price", 199.0)
            m_eq = float(m_eq)

            # Discount percent
            disc_pct = float(p.get("discountPercent", 0.0) or 0.0)

            row = {
                "internet_usage_gb": cust_internet,
                "monthly_call_duration": cust_calls,
                "sms_usage_per_month": cust_sms,
                "monthly_spending": cust_spending,
                "budget_inr": cust_budget,
                "data_per_month_gb": data_val,
                "sms_per_month": sms_val,
                "monthly_equivalent_inr": m_eq,
                "duration_months": dur_months,
                "discount_percent": disc_pct,
            }
            feature_rows.append(row)

        df_input = pd.DataFrame(feature_rows)[feature_names]

        # 3. Model Inference (Random Forest Regressor)
        predictions = model_obj.predict(df_input)

        scored_plans = []
        for plan_info, pred in zip(plans, predictions):
            raw_score = float(pred)

            # Apply duration preference weight if customer configured it
            if preferred_duration:
                pref_dur = int(preferred_duration)
                plan_validity = int(plan_info.get("validity", 28))
                if pref_dur >= 300 and plan_validity >= 300:
                    raw_score *= 1.15
                elif 70 <= pref_dur < 300 and 70 <= plan_validity < 300:
                    raw_score *= 1.12
                elif pref_dur < 70 and plan_validity < 70:
                    raw_score *= 1.05

            # Apply 5G constraint penalty if user mandates 5G
            if requires_5g and not plan_info.get("fiveG"):
                raw_score *= 0.75

            bounded_score = max(0, min(100, int(round(raw_score))))
            scored_plans.append({
                "planId": plan_info.get("planId") or plan_info.get("id"),
                "planCode": plan_info.get("planCode") or plan_info.get("plan_code"),
                "score": bounded_score,
                "rawScore": round(float(pred), 2),
                "plan": plan_info,
            })

        # Sort descending by score
        scored_plans.sort(key=lambda x: x["score"], reverse=True)

        # Assemble top recommendations with explainability reasons
        final_recs = []
        for rank_idx, item in enumerate(scored_plans[:3]):
            reasons = _generate_reasons(item["plan"], customer, usage, item["score"])
            final_recs.append({
                "planId": item["planId"],
                "rank": rank_idx + 1,
                "score": item["score"],
                "reasons": reasons,
            })

        if final_recs:
            model_name = cfg.get("model_name", "SmartTariff V3.2") if cfg else "SmartTariff V3.2"
            return {
                "recommendations": final_recs,
                "generatedBy": "ml",
                "model": model_name,
            }

    except Exception as e:
        print(f"[ML Service] Local prediction error: {e}")

    return None


async def get_recommendations(payload: dict) -> dict | None:
    """
    Primary ML recommendation dispatcher:
    1. Runs inference using local SmartTariff V3.2 Random Forest model.
    2. If unavailable, falls back to external ML_API_URL if configured.
    3. Returns None if neither is available, allowing rule-based engine to execute.
    """
    # ── 1. Try Local Model File ──────────────────────────────────────────
    model = load_local_model()
    if model is not None:
        local_result = predict_with_local_model(model, payload)
        if local_result and local_result.get("recommendations"):
            print(f"[ML Service] In-process Random Forest generated {len(local_result['recommendations'])} plan recommendations")
            return local_result

    # ── 2. Try External ML API (if configured) ───────────────────────────
    if settings.ml_api_url:
        try:
            headers = {"Content-Type": "application/json"}
            if settings.ml_api_key:
                headers["Authorization"] = f"Bearer {settings.ml_api_key}"

            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(
                    f"{settings.ml_api_url}/predict",
                    json=payload,
                    headers=headers,
                )
                response.raise_for_status()

            data = response.json()
            print(f"[ML Service] External ML API responded: status={response.status_code}")
            return data

        except httpx.TimeoutException:
            print("[ML Service] External ML API timeout (10s exceeded)")
        except httpx.HTTPStatusError as e:
            print(f"[ML Service] External ML API error: status={e.response.status_code}")
        except Exception as e:
            print(f"[ML Service] External ML Service error: {e}")

    # ── 3. Signal rule-based fallback ─────────────────────────────────────
    print("[ML Service] No active ML model found — using rule-based recommendation engine")
    return None
