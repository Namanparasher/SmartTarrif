// Mirrors /api/v1/plans/* routes
import { simulateRequest } from "./api";
import { collections, getAll, findById, insert, updateById, removeById, genId, paginate } from "@/mockApi/db";

function applyFilters(plans, filters = {}) {
  let result = [...plans];
  const { search, minPrice, maxPrice, minData, minCalls, minSms, fiveG, operator, status, category, offerType, sortBy } = filters;

  if (search) {
    const rawQ = search.trim().toLowerCase();
    const cleanNum = rawQ.replace(/[^0-9.]/g, "");
    result = result.filter((p) => {
      const matchText =
        (p.planId && p.planId.toLowerCase().includes(rawQ)) ||
        (p.planCode && p.planCode.toLowerCase().includes(rawQ)) ||
        p.name.toLowerCase().includes(rawQ) ||
        (p.operator && p.operator.toLowerCase().includes(rawQ)) ||
        (p.category && p.category.toLowerCase().includes(rawQ)) ||
        (p.offerType && p.offerType.toLowerCase().includes(rawQ)) ||
        (p.description && p.description.toLowerCase().includes(rawQ)) ||
        (p.benefits && p.benefits.some((b) => b.toLowerCase().includes(rawQ)));

      const matchPrice =
        String(p.price).includes(rawQ) ||
        `₹${p.price}`.includes(rawQ) ||
        (p.monthlyEquivalent && String(p.monthlyEquivalent).includes(rawQ)) ||
        (cleanNum.length > 0 && (String(p.price) === cleanNum || String(p.price).includes(cleanNum)));

      return matchText || matchPrice;
    });
  }
  if (minPrice) result = result.filter((p) => p.price >= Number(minPrice) || (p.monthlyEquivalent && p.monthlyEquivalent >= Number(minPrice)));
  if (maxPrice) result = result.filter((p) => p.price <= Number(maxPrice) || (p.monthlyEquivalent && p.monthlyEquivalent <= Number(maxPrice)));
  if (minData) result = result.filter((p) => p.dataLimit >= Number(minData));
  if (minCalls) result = result.filter((p) => p.callMinutes >= Number(minCalls) || p.callMinutes === null);
  if (minSms) result = result.filter((p) => p.smsLimit >= Number(minSms));
  if (fiveG === "true" || fiveG === true) result = result.filter((p) => p.fiveG);
  if (operator) result = result.filter((p) => p.operator === operator);
  if (category) result = result.filter((p) => p.category === category);
  if (offerType) result = result.filter((p) => p.offerType === offerType);
  if (status === "active") result = result.filter((p) => p.isActive);
  if (status === "inactive") result = result.filter((p) => !p.isActive);
  if (!status) result = result.filter((p) => p.isActive); // public default: active only

  switch (sortBy) {
    case "price_asc":
      result.sort((a, b) => a.price - b.price);
      break;
    case "price_desc":
      result.sort((a, b) => b.price - a.price);
      break;
    case "popularity":
      result.sort((a, b) => b.popularity - a.popularity);
      break;
    case "data_desc":
      result.sort((a, b) => b.dataLimit - a.dataLimit);
      break;
    default:
      break;
  }
  return result;
}

export const planApi = {
  list: ({ page = 1, limit = 12, ...filters } = {}) =>
    simulateRequest(() => {
      const all = getAll(collections.plans);
      const filtered = applyFilters(all, filters);
      return paginate(filtered, page, limit);
    }),

  listAllActive: () =>
    simulateRequest(() => getAll(collections.plans).filter((p) => p.isActive)),

  getById: (id) =>
    simulateRequest(() => {
      const plan = findById(collections.plans, id);
      if (!plan) throw Object.assign(new Error("Plan not found"), { status: 404 });
      return plan;
    }),

  create: (payload) =>
    simulateRequest(() => {
      const plan = {
        _id: genId("plan"),
        popularity: 0,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        benefits: [],
        ...payload,
      };
      insert(collections.plans, plan);
      return plan;
    }),

  update: (id, payload) =>
    simulateRequest(() => {
      const updated = updateById(collections.plans, id, payload);
      if (!updated) throw Object.assign(new Error("Plan not found"), { status: 404 });
      return updated;
    }),

  deactivate: (id) =>
    simulateRequest(() => {
      const updated = updateById(collections.plans, id, { isActive: false });
      if (!updated) throw Object.assign(new Error("Plan not found"), { status: 404 });
      return updated;
    }),

  activate: (id) =>
    simulateRequest(() => {
      const updated = updateById(collections.plans, id, { isActive: true });
      if (!updated) throw Object.assign(new Error("Plan not found"), { status: 404 });
      return updated;
    }),

  remove: (id) =>
    simulateRequest(() => {
      const success = removeById(collections.plans, id);
      if (!success) throw Object.assign(new Error("Plan not found"), { status: 404 });
      return { removed: true };
    }),

  operators: () =>
    simulateRequest(() => [...new Set(getAll(collections.plans).map((p) => p.operator))]),
};
