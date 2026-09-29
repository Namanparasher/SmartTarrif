// Mirrors /api/v1/admin/* routes - dashboard aggregation endpoints
import { simulateRequest } from "./api";
import { collections, getAll } from "@/mockApi/db";

function monthLabel(key) {
  const [y, m] = key.split("-");
  return new Date(Number(y), Number(m) - 1).toLocaleString("default", { month: "short", year: "2-digit" });
}

export const adminApi = {
  dashboard: () =>
    simulateRequest(() => {
      const customers = getAll(collections.users).filter((u) => u.role === "customer");
      const plans = getAll(collections.plans);
      const recommendations = getAll(collections.recommendations);
      const feedback = getAll(collections.feedback);

      const totalCustomers = customers.length;
      const activePlans = plans.filter((p) => p.isActive).length;
      const totalRecommendations = recommendations.length;
      const allScores = recommendations.flatMap((r) => r.plans.map((p) => p.score));
      const avgScore = allScores.length ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : 0;

      // customers over time (by createdAt month, last 6 months)
      const months = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
      }
      const customersOverTime = months.map((key) => {
        const count = customers.filter((c) => {
          const created = new Date(c.createdAt);
          const k = `${created.getFullYear()}-${String(created.getMonth() + 1).padStart(2, "0")}`;
          return k <= key;
        }).length;
        return { month: monthLabel(key), customers: count };
      });

      // most recommended plans
      const planCounts = {};
      recommendations.forEach((r) => r.plans.forEach((p) => { planCounts[p.planId] = (planCounts[p.planId] || 0) + 1; }));
      const mostRecommended = Object.entries(planCounts)
        .map(([planId, count]) => ({ name: plans.find((p) => p._id === planId)?.name || "Unknown", count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6);

      // usage distribution (by category price bucket)
      const categoryCounts = {};
      plans.forEach((p) => { categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1; });
      const usageDistribution = Object.entries(categoryCounts).map(([name, value]) => ({ name, value }));

      // recommendation score distribution
      const buckets = { "0-50": 0, "50-70": 0, "70-85": 0, "85-100": 0 };
      allScores.forEach((s) => {
        if (s < 50) buckets["0-50"]++;
        else if (s < 70) buckets["50-70"]++;
        else if (s < 85) buckets["70-85"]++;
        else buckets["85-100"]++;
      });
      const scoreDistribution = Object.entries(buckets).map(([range, count]) => ({ range, count }));

      // feedback stats
      const up = feedback.filter((f) => f.rating === "up").length;
      const down = feedback.filter((f) => f.rating === "down").length;
      const feedbackStats = [
        { name: "Helpful", value: up },
        { name: "Not helpful", value: down },
      ];

      return {
        cards: { totalCustomers, activePlans, totalRecommendations, avgScore },
        customersOverTime,
        mostRecommended,
        usageDistribution,
        scoreDistribution,
        feedbackStats,
      };
    }),
};
