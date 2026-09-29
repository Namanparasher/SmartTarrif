// -----------------------------------------------------------------------------
// Rule-based Recommendation Engine (NO ML / NO AI).
//
// This module intentionally mirrors what would live at:
//   backend/src/services/recommendationService.js
//
// Public contract (kept stable so it can later be swapped for an ML service
// without any change to controllers/routes/frontend):
//
//   generateRecommendations({ usage, preferences, plans }) -> Array<{
//     planId, score, rank, reasons: string[]
//   }>
//
// Scoring weights (sum to 100):
//   Data Match     = 40%
//   Call Match     = 25%
//   SMS Match      = 10%
//   Budget Match   = 15%
//   Overall Value  = 10%
// -----------------------------------------------------------------------------

const WEIGHTS = {
  data: 0.4,
  calls: 0.25,
  sms: 0.1,
  budget: 0.15,
  value: 0.1,
};

// Generic "how well does supply cover demand" scorer.
// Rewards plans that meet-or-exceed requirement, penalizes shortfall,
// and mildly penalizes extreme over-provisioning (poor value).
function coverageScore(required, provided) {
  if (!required || required <= 0) return 100;
  if (!isFinite(provided) || provided >= 999999) return 100; // unlimited
  const ratio = provided / required;
  if (ratio >= 1 && ratio <= 1.8) return 100;
  if (ratio > 1.8 && ratio <= 3) return 90;
  if (ratio > 3) return 78; // over-provisioned, not ideal value
  // shortfall - scale down proportionally, floor at 0
  return Math.max(0, Math.round(ratio * 100) - 5);
}

function budgetScore(budget, price) {
  if (!budget || budget <= 0) return 70; // no preference set, neutral score
  if (price <= budget) {
    // reward plans that use budget efficiently (closer to budget = better use, but cheaper still fine)
    const utilization = price / budget;
    return Math.round(60 + utilization * 40); // 60-100
  }
  const over = (price - budget) / budget;
  return Math.max(0, Math.round(100 - over * 140));
}

function valueScore(plan) {
  const dataComponent = Math.min(plan.dataLimit || 0, 250);
  const callComponent = 100; // unlimited calling across all plans
  const smsComponent = Math.min(plan.smsLimit || 0, 500) / 10;
  const effectivePrice = plan.monthlyEquivalent || plan.price;
  const raw = (dataComponent + callComponent + smsComponent) / Math.max(effectivePrice, 1);
  const normalized = Math.min(100, Math.round(raw * 50));
  return normalized;
}

function buildReasons({ plan, dataScore, callScore, smsScore, budgetScr, usage, preferences }) {
  const reasons = [];

  if (plan.discountPercent && plan.discountPercent > 0) {
    reasons.push(`Bundle deal: Save ${plan.discountPercent}% (₹${plan.discountInr} discount)`);
  }

  if (preferences?.preferredDuration && Number(preferences.preferredDuration) >= 300 && plan.validity >= 300) {
    reasons.push("Matches your 1 Year annual plan preference");
  } else if (preferences?.preferredDuration && Number(preferences.preferredDuration) >= 70 && Number(preferences.preferredDuration) < 300 && plan.validity >= 70 && plan.validity < 300) {
    reasons.push("Matches your 3-Month bundle preference");
  }

  if (dataScore >= 85) reasons.push(`Matches your ${plan.dataLimit} GB data usage`);
  else if (dataScore >= 60) reasons.push("Covers most of your data usage");
  else reasons.push("May fall short on your data usage");

  if (budgetScr >= 80) reasons.push("Fits your monthly budget");
  else if (budgetScr >= 50) reasons.push("Close to your monthly budget");
  else reasons.push("Priced above your usual budget");

  reasons.push("Unlimited voice calling included");

  if (smsScore >= 85 && preferences?.minimumSms) reasons.push("Meets your SMS requirements");

  if (plan.fiveG && preferences?.requires5G) reasons.push("Includes 5G as required");
  else if (plan.fiveG) reasons.push("5G ready network");

  const valueScr = valueScore(plan);
  if (valueScr >= 70) reasons.push("High value per rupee");

  return reasons.slice(0, 5);
}

/**
 * Score a single plan against usage + preferences.
 */
export function scorePlan({ plan, usage, preferences }) {
  const requiredData = Math.max(usage?.dataUsage || 0, preferences?.minimumData || 0);
  const requiredCalls = Math.max(usage?.callMinutes || 0, preferences?.minimumCallMinutes || 0);
  const requiredSms = Math.max(usage?.smsCount || 0, preferences?.minimumSms || 0);
  const budget = preferences?.monthlyBudget || 0;
  const effectivePrice = plan.monthlyEquivalent || plan.price;

  const dataScore = coverageScore(requiredData, plan.dataLimit);
  const callScore = coverageScore(requiredCalls, plan.callMinutes);
  const smsScore = coverageScore(requiredSms, plan.smsLimit);
  const budgetScr = budgetScore(budget, effectivePrice);
  const valueScr = valueScore(plan);

  let total =
    dataScore * WEIGHTS.data +
    callScore * WEIGHTS.calls +
    smsScore * WEIGHTS.sms +
    budgetScr * WEIGHTS.budget +
    valueScr * WEIGHTS.value;

  // Preferred duration weight boost
  if (preferences?.preferredDuration) {
    const pref = Number(preferences.preferredDuration);
    if (pref >= 300 && plan.validity >= 300) {
      total = Math.min(100, total * 1.25);
    } else if (pref >= 70 && pref < 300 && plan.validity >= 70 && plan.validity < 300) {
      total = Math.min(100, total * 1.2);
    } else if (pref < 70 && plan.validity < 70) {
      total = Math.min(100, total * 1.1);
    }
  }

  // hard constraint: if 5G required but plan doesn't have it, apply penalty
  if (preferences?.requires5G && !plan.fiveG) {
    total *= 0.7;
  }

  total = Math.max(0, Math.min(100, Math.round(total)));

  const reasons = buildReasons({ plan, dataScore, callScore, smsScore, budgetScr, usage, preferences });

  return { score: total, reasons, breakdown: { dataScore, callScore, smsScore, budgetScore: budgetScr, valueScore: valueScr } };
}

/**
 * generateRecommendations - main entry point used by recommendationApi.
 * Accepts already-resolved usage/preferences/plans (frontend simulation of a
 * backend controller assembling data before calling the service).
 */
export function generateRecommendations({ usage, preferences, plans }) {
  const activePlans = plans.filter((p) => p.isActive);

  const scored = activePlans.map((plan) => {
    const { score, reasons } = scorePlan({ plan, usage, preferences });
    return { planId: plan._id, plan, score, reasons };
  });

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, 3).map((item, idx) => ({
    planId: item.planId,
    plan: item.plan,
    score: item.score,
    rank: idx + 1,
    reasons: item.reasons,
  }));
}
