// Mirrors /api/v1/customers/* routes
import { simulateRequest } from "./api";
import { collections, getAll, findOne, updateById, findById, genId, insert, paginate } from "@/mockApi/db";
import { sanitizeUser } from "@/mockApi/authBackend";

export const customerApi = {
  getProfile: (userId) =>
    simulateRequest(() => {
      let profile = findOne(collections.customerProfiles, (p) => p.userId === userId);
      if (!profile) {
        profile = insert(collections.customerProfiles, {
          _id: genId("profile"),
          userId,
          currentPlan: null,
          monthlyBudget: 500,
          minimumData: 10,
          minimumCallMinutes: 500,
          minimumSms: 100,
          requires5G: false,
        });
      }
      return profile;
    }),

  updateProfile: (userId, payload) =>
    simulateRequest(() => {
      const profile = findOne(collections.customerProfiles, (p) => p.userId === userId);
      if (!profile) throw Object.assign(new Error("Profile not found"), { status: 404 });
      return updateById(collections.customerProfiles, profile._id, payload);
    }),

  updateUser: (userId, payload) =>
    simulateRequest(() => {
      const updated = updateById(collections.users, userId, payload);
      if (!updated) throw Object.assign(new Error("User not found"), { status: 404 });
      return sanitizeUser(updated);
    }),

  listAll: ({ page = 1, limit = 10, search, status } = {}) =>
    simulateRequest(() => {
      let customers = getAll(collections.users).filter((u) => u.role === "customer");
      if (search) {
        const q = search.toLowerCase();
        customers = customers.filter((c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.phone.includes(q));
      }
      if (status === "active") customers = customers.filter((c) => c.isActive);
      if (status === "inactive") customers = customers.filter((c) => !c.isActive);

      const profiles = getAll(collections.customerProfiles);
      const plans = getAll(collections.plans);
      const usage = getAll(collections.usage);

      const enriched = customers.map((c) => {
        const profile = profiles.find((p) => p.userId === c._id);
        const plan = plans.find((p) => p._id === profile?.currentPlan);
        const latestUsage = usage.filter((u) => u.customerId === c._id).sort((a, b) => (a.month < b.month ? 1 : -1))[0];
        return {
          ...sanitizeUser(c),
          currentPlan: plan?.name || "No plan",
          dataUsage: latestUsage?.dataUsage || 0,
          callMinutes: latestUsage?.callMinutes || 0,
        };
      });

      return paginate(enriched, page, limit);
    }),

  getDetail: (userId) =>
    simulateRequest(() => {
      const user = findById(collections.users, userId);
      if (!user) throw Object.assign(new Error("Customer not found"), { status: 404 });
      const profile = findOne(collections.customerProfiles, (p) => p.userId === userId);
      const usage = getAll(collections.usage).filter((u) => u.customerId === userId).sort((a, b) => (a.month < b.month ? 1 : -1));
      const recommendations = getAll(collections.recommendations).filter((r) => r.customerId === userId).sort((a, b) => new Date(b.generatedAt) - new Date(a.generatedAt));
      const feedback = getAll(collections.feedback).filter((f) => f.customerId === userId);
      const plans = getAll(collections.plans);
      const currentPlan = plans.find((p) => p._id === profile?.currentPlan) || null;
      return { user: sanitizeUser(user), profile, usage, recommendations, feedback, currentPlan };
    }),

  setStatus: (userId, isActive) =>
    simulateRequest(() => {
      const updated = updateById(collections.users, userId, { isActive });
      if (!updated) throw Object.assign(new Error("Customer not found"), { status: 404 });
      return sanitizeUser(updated);
    }),
};
