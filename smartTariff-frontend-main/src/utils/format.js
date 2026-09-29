export function formatCurrency(value) {
  if (value === undefined || value === null) return "₹0";
  return `₹${Number(value).toLocaleString("en-IN")}`;
}

export function formatData(gb) {
  if (gb === null || gb === undefined) return "Unlimited";
  if (typeof gb === "string" && (gb.toLowerCase() === "unlimited" || isNaN(Number(gb)))) return gb;
  const num = Number(gb);
  if (num >= 999) return "Unlimited";
  return `${num} GB`;
}

export function formatMinutes(min) {
  if (min === null || min === undefined) return "Unlimited";
  if (typeof min === "string" && (min.toLowerCase() === "unlimited" || isNaN(Number(min)))) return "Unlimited";
  const num = Number(min);
  if (num >= 999999) return "Unlimited";
  return `${num.toLocaleString("en-IN")} min`;
}

export function formatCount(n) {
  if (n === null || n === undefined) return "Unlimited";
  if (typeof n === "string" && (n.toLowerCase() === "unlimited" || isNaN(Number(n)))) return n;
  const num = Number(n);
  if (num >= 999999) return "Unlimited";
  return num.toLocaleString("en-IN");
}

export function formatDate(iso) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function monthKeyToLabel(key) {
  if (!key) return "-";
  const [y, m] = key.split("-");
  return new Date(Number(y), Number(m) - 1).toLocaleString("default", { month: "long", year: "numeric" });
}

export function scoreColor(score) {
  if (score >= 85) return "text-emerald-600";
  if (score >= 65) return "text-amber-600";
  return "text-rose-600";
}

export function scoreBg(score) {
  if (score >= 85) return "bg-emerald-50 border-emerald-200";
  if (score >= 65) return "bg-amber-50 border-amber-200";
  return "bg-rose-50 border-rose-200";
}
