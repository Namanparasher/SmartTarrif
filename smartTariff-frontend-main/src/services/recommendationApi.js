// Mirrors /api/v1/recommendations/* routes.
// This is the swap-point for a future ML-based recommendation microservice:
// only `generateRecommendations()` (imported from mockApi/recommendationEngine)
// would need to be replaced by a call to an ML API - controllers, routes and
// this frontend module stay identical.
import { simulateRequest } from "./api";
import { collections, getAll, findOne, findById, insert, genId, paginate } from "@/mockApi/db";
import { generateRecommendations } from "@/mockApi/recommendationEngine";

function getLatestUsage(customerId) {
  const records = getAll(collections.usage).filter((u) => u.customerId === customerId);
  if (!records.length) return null;
  return records.sort((a, b) => (a.month < b.month ? 1 : -1))[0];
}

function getPreferences(customerId) {
  const profile = findOne(collections.customerProfiles, (p) => p.userId === customerId);
  return profile || {};
}

export const recommendationApi = {
  generate: (customerId) =>
    simulateRequest(() => {
      let usage = getLatestUsage(customerId);
      const preferences = getPreferences(customerId);
      if (!usage) {
        const now = new Date();
        const curMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
        const callMins = preferences.minimumCallMinutes || 350;
        const numCalls = Math.max(5, Math.round(callMins / 4));
        usage = {
          _id: genId("usg"),
          customerId,
          month: curMonth,
          dataUsage: preferences.minimumData || 30,
          callMinutes: callMins,
          smsCount: preferences.minimumSms || 40,
          numberOfCalls: numCalls,
          averageCallDuration: Number((callMins / numCalls).toFixed(1)),
          currentSpending: preferences.currentSpending || preferences.monthlyBudget || 500,
          createdAt: new Date().toISOString(),
        };
        insert(collections.usage, usage);
      }
      const plans = getAll(collections.plans);

      const results = generateRecommendations({ usage, preferences, plans });

      const record = {
        _id: genId("rec"),
        customerId,
        plans: results.map((r) => ({ planId: r.planId, rank: r.rank, score: r.score, reasons: r.reasons })),
        generatedAt: new Date().toISOString(),
      };
      insert(collections.recommendations, record);

      return { ...record, plans: results.map((r) => ({ ...r })) };
    }, { latency: 600 }),

  getMine: (customerId) =>
    simulateRequest(() => {
      const records = getAll(collections.recommendations)
        .filter((r) => r.customerId === customerId)
        .sort((a, b) => new Date(b.generatedAt) - new Date(a.generatedAt));
      const latest = records[0];
      if (!latest) return null;
      const plans = getAll(collections.plans);
      return {
        ...latest,
        plans: latest.plans.map((p) => ({ ...p, plan: plans.find((pl) => pl._id === p.planId) })),
      };
    }),

  getById: (id) =>
    simulateRequest(() => {
      const record = findById(collections.recommendations, id);
      if (!record) throw Object.assign(new Error("Recommendation not found"), { status: 404 });
      const plans = getAll(collections.plans);
      return { ...record, plans: record.plans.map((p) => ({ ...p, plan: plans.find((pl) => pl._id === p.planId) })) };
    }),

  history: (customerId, { page = 1, limit = 10 } = {}) =>
    simulateRequest(() => {
      const plans = getAll(collections.plans);
      const records = getAll(collections.recommendations)
        .filter((r) => r.customerId === customerId)
        .sort((a, b) => new Date(b.generatedAt) - new Date(a.generatedAt))
        .map((r) => {
          const top = r.plans.find((p) => p.rank === 1);
          const plan = plans.find((pl) => pl._id === top?.planId);
          return { _id: r._id, generatedAt: r.generatedAt, topPlanName: plan?.name || "N/A", topScore: top?.score || 0 };
        });
      return paginate(records, page, limit);
    }),
};
