// -----------------------------------------------------------------------------
// SmartTariff "database" layer.
//
// In a real deployment this module is replaced by MongoDB Atlas + Mongoose
// models living in a Node/Express backend (see /backend in project docs).
// To keep this demo fully functional inside a static frontend sandbox, we
// persist the exact same document shapes to localStorage and expose a tiny
// query helper (find/filter/paginate) that mimics what Mongoose + Express
// controllers would return. Every API module in `src/services` talks to this
// layer exclusively - so swapping it for real HTTP calls later is a one-file
// change per service, not a redesign of the app.
// -----------------------------------------------------------------------------

const NAMESPACE = "smarttariff:v1:";

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(NAMESPACE + key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    return fallback;
  }
}

function write(key, value) {
  localStorage.setItem(NAMESPACE + key, JSON.stringify(value));
}

export const collections = {
  users: "users",
  customerProfiles: "customerProfiles",
  usage: "usage",
  plans: "plans",
  recommendations: "recommendations",
  feedback: "feedback",
  session: "session",
};

export function getAll(collection) {
  return read(collection, []);
}

export function saveAll(collection, docs) {
  write(collection, docs);
}

export function insert(collection, doc) {
  const docs = getAll(collection);
  docs.push(doc);
  saveAll(collection, docs);
  return doc;
}

export function updateById(collection, id, patch) {
  const docs = getAll(collection);
  const idx = docs.findIndex((d) => d._id === id);
  if (idx === -1) return null;
  docs[idx] = { ...docs[idx], ...patch, updatedAt: new Date().toISOString() };
  saveAll(collection, docs);
  return docs[idx];
}

export function removeById(collection, id) {
  const docs = getAll(collection);
  const next = docs.filter((d) => d._id !== id);
  saveAll(collection, next);
  return next.length !== docs.length;
}

export function findById(collection, id) {
  return getAll(collection).find((d) => d._id === id) || null;
}

export function findOne(collection, predicate) {
  return getAll(collection).find(predicate) || null;
}

export function find(collection, predicate = () => true) {
  return getAll(collection).filter(predicate);
}

export function genId(prefix = "id") {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

export function paginate(items, page = 1, limit = 10) {
  const p = Math.max(1, Number(page) || 1);
  const l = Math.max(1, Number(limit) || 10);
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / l));
  const start = (p - 1) * l;
  const data = items.slice(start, start + l);
  return {
    data,
    pagination: { page: p, limit: l, total, totalPages },
  };
}

export function isSeeded() {
  return read("__seeded__", false);
}

export function markSeeded() {
  write("__seeded__", true);
}

export function resetDatabase() {
  Object.values(collections).forEach((c) => localStorage.removeItem(NAMESPACE + c));
  localStorage.removeItem(NAMESPACE + "__seeded__");
}

// simulated network latency so loading states/skeletons are meaningful
export function delay(ms = 350) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
