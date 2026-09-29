// Mirrors /api/v1/usage/* routes
import { simulateRequest } from "./api";
import { collections, getAll, findById, insert, updateById, removeById, genId, paginate } from "@/mockApi/db";

function sortByMonthDesc(records) {
  return [...records].sort((a, b) => (a.month < b.month ? 1 : -1));
}

export const usageApi = {
  getMine: (customerId) =>
    simulateRequest(() => sortByMonthDesc(getAll(collections.usage).filter((u) => u.customerId === customerId))),

  getForCustomer: (customerId) =>
    simulateRequest(() => sortByMonthDesc(getAll(collections.usage).filter((u) => u.customerId === customerId))),

  create: (payload) =>
    simulateRequest(() => {
      const record = {
        _id: genId("usage"),
        numberOfCalls: payload.numberOfCalls || Math.max(5, Math.round((payload.callMinutes || 0) / 4)),
        averageCallDuration: payload.callMinutes && payload.numberOfCalls ? Number((payload.callMinutes / payload.numberOfCalls).toFixed(1)) : 0,
        createdAt: new Date().toISOString(),
        ...payload,
      };
      insert(collections.usage, record);
      return record;
    }),

  update: (id, payload) =>
    simulateRequest(() => {
      const updated = updateById(collections.usage, id, payload);
      if (!updated) throw Object.assign(new Error("Usage record not found"), { status: 404 });
      return updated;
    }),

  remove: (id) =>
    simulateRequest(() => {
      const success = removeById(collections.usage, id);
      if (!success) throw Object.assign(new Error("Usage record not found"), { status: 404 });
      return { removed: true };
    }),

  listAll: ({ page = 1, limit = 10, search, month } = {}) =>
    simulateRequest(() => {
      const users = getAll(collections.users);
      let records = getAll(collections.usage).map((u) => {
        const customer = users.find((usr) => usr._id === u.customerId);
        return { ...u, customerName: customer?.name || "Unknown", customerEmail: customer?.email || "" };
      });
      if (month) records = records.filter((r) => r.month === month);
      if (search) {
        const q = search.toLowerCase();
        records = records.filter((r) => r.customerName.toLowerCase().includes(q) || r.customerEmail.toLowerCase().includes(q));
      }
      records = sortByMonthDesc(records);
      return paginate(records, page, limit);
    }),

  bulkImport: (rows) =>
    simulateRequest(() => {
      const users = getAll(collections.users);
      const created = [];
      const errors = [];
      rows.forEach((row, idx) => {
        const customer = users.find((u) => u._id === row.customerId || u.email === row.customerId);
        if (!customer) {
          errors.push({ row: idx + 1, message: `Customer '${row.customerId}' not found` });
          return;
        }
        const record = {
          _id: genId("usage"),
          customerId: customer._id,
          dataUsage: Number(row.dataUsage) || 0,
          callMinutes: Number(row.callMinutes) || 0,
          smsCount: Number(row.smsCount) || 0,
          numberOfCalls: Number(row.numberOfCalls) || Math.max(5, Math.round((Number(row.callMinutes) || 0) / 4)),
          averageCallDuration: 0,
          month: row.month,
          createdAt: new Date().toISOString(),
        };
        insert(collections.usage, record);
        created.push(record);
      });
      return { created: created.length, errors };
    }),
};
