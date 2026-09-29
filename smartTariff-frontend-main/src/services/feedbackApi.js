// Mirrors /api/v1/feedback/* routes
import { simulateRequest } from "./api";
import { collections, getAll, insert, genId, paginate } from "@/mockApi/db";

export const feedbackApi = {
  submit: ({ customerId, recommendationId, rating, comment }) =>
    simulateRequest(() => {
      const record = {
        _id: genId("fb"),
        customerId,
        recommendationId,
        rating, // 'up' | 'down'
        comment: comment || "",
        createdAt: new Date().toISOString(),
      };
      insert(collections.feedback, record);
      return record;
    }),

  mine: (customerId) =>
    simulateRequest(() => getAll(collections.feedback).filter((f) => f.customerId === customerId)),

  listAll: ({ page = 1, limit = 10 } = {}) =>
    simulateRequest(() => {
      const users = getAll(collections.users);
      const records = getAll(collections.feedback)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .map((f) => ({ ...f, customerName: users.find((u) => u._id === f.customerId)?.name || "Unknown" }));
      return paginate(records, page, limit);
    }),
};
