// Seeds realistic sample data on first load, mirroring `npm run seed` for the
// real backend (see README). Produces 24 tariff plans, 22 customers + 1 admin,
// usage history and a couple of historical recommendations/feedback entries.
import { collections, saveAll, getAll, genId, isSeeded, markSeeded } from "./db";

function hash(str) {
  // deterministic-ish pseudo hash for stable demo passwords (NOT secure, demo only)
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return `hashed_${h}`;
}

const SEED_VERSION_KEY = "smarttariff:v3_no_operators";

const PLAN_TEMPLATES = [
  { planId: "P01", name: "Basic Start", category: "Basic", durationMonths: 1, validity: 28, price: 199, monthlyEquivalent: 199.0, dataLimit: 2, callMinutes: 999999, smsLimit: 50, offerType: "Standalone", individualCost: 199, discountInr: 0, discountPercent: 0.0, fiveG: false },
  { planId: "P02", name: "Talk Max", category: "Caller", durationMonths: 1, validity: 28, price: 299, monthlyEquivalent: 299.0, dataLimit: 8, callMinutes: 999999, smsLimit: 150, offerType: "Standalone", individualCost: 299, discountInr: 0, discountPercent: 0.0, fiveG: false },
  { planId: "P03", name: "Talk Max Plus", category: "Caller+", durationMonths: 1, validity: 30, price: 349, monthlyEquivalent: 349.0, dataLimit: 15, callMinutes: 999999, smsLimit: 200, offerType: "Standalone", individualCost: 349, discountInr: 0, discountPercent: 0.0, fiveG: false },
  { planId: "P04", name: "Light Connect", category: "Light", durationMonths: 1, validity: 28, price: 349, monthlyEquivalent: 349.0, dataLimit: 28, callMinutes: 999999, smsLimit: 150, offerType: "Standalone", individualCost: 349, discountInr: 0, discountPercent: 0.0, fiveG: false },
  { planId: "P05", name: "Smart Daily", category: "Standard", durationMonths: 1, validity: 28, price: 370, monthlyEquivalent: 370.0, dataLimit: 45, callMinutes: 999999, smsLimit: 100, offerType: "Standalone", individualCost: 370, discountInr: 0, discountPercent: 0.0, fiveG: true },
  { planId: "P06", name: "Smart Plus", category: "Standard+", durationMonths: 1, validity: 28, price: 420, monthlyEquivalent: 420.0, dataLimit: 60, callMinutes: 999999, smsLimit: 150, offerType: "Standalone", individualCost: 420, discountInr: 0, discountPercent: 0.0, fiveG: true },
  { planId: "P07", name: "Stream 60", category: "Streamer", durationMonths: 1, validity: 28, price: 450, monthlyEquivalent: 450.0, dataLimit: 100, callMinutes: 999999, smsLimit: 100, offerType: "Standalone", individualCost: 450, discountInr: 0, discountPercent: 0.0, fiveG: true },
  { planId: "P08", name: "Stream 100", category: "Streamer+", durationMonths: 1, validity: 28, price: 499, monthlyEquivalent: 499.0, dataLimit: 150, callMinutes: 999999, smsLimit: 150, offerType: "Standalone", individualCost: 499, discountInr: 0, discountPercent: 0.0, fiveG: true },
  { planId: "P09", name: "Premium Pro", category: "Premium", durationMonths: 1, validity: 28, price: 549, monthlyEquivalent: 549.0, dataLimit: 200, callMinutes: 999999, smsLimit: 500, offerType: "Standalone", individualCost: 549, discountInr: 0, discountPercent: 0.0, fiveG: true },
  { planId: "P10", name: "Premium Max", category: "Premium+", durationMonths: 1, validity: 28, price: 649, monthlyEquivalent: 649.0, dataLimit: 250, callMinutes: 999999, smsLimit: 500, offerType: "Standalone", individualCost: 649, discountInr: 0, discountPercent: 0.0, fiveG: true },
  { planId: "P11", name: "Basic Saver 3M", category: "Basic Bundle", durationMonths: 3, validity: 90, price: 549, monthlyEquivalent: 183.0, dataLimit: 2, callMinutes: 999999, smsLimit: 50, offerType: "3-Month Bundle", individualCost: 597, discountInr: 48, discountPercent: 8.0, fiveG: false },
  { planId: "P12", name: "Talk Max Saver 3M", category: "Caller Bundle", durationMonths: 3, validity: 90, price: 799, monthlyEquivalent: 266.33, dataLimit: 8, callMinutes: 999999, smsLimit: 150, offerType: "3-Month Bundle", individualCost: 897, discountInr: 98, discountPercent: 10.9, fiveG: false },
  { planId: "P13", name: "Light Connect Saver 3M", category: "Light Bundle", durationMonths: 3, validity: 90, price: 899, monthlyEquivalent: 299.67, dataLimit: 28, callMinutes: 999999, smsLimit: 150, offerType: "3-Month Bundle", individualCost: 1047, discountInr: 148, discountPercent: 14.1, fiveG: false },
  { planId: "P14", name: "Smart Plus Saver 3M", category: "Standard+ Bundle", durationMonths: 3, validity: 90, price: 1099, monthlyEquivalent: 366.33, dataLimit: 60, callMinutes: 999999, smsLimit: 150, offerType: "3-Month Bundle", individualCost: 1260, discountInr: 161, discountPercent: 12.8, fiveG: true },
  { planId: "P15", name: "Stream 100 Saver 3M", category: "Streamer+ Bundle", durationMonths: 3, validity: 90, price: 1299, monthlyEquivalent: 433.0, dataLimit: 150, callMinutes: 999999, smsLimit: 150, offerType: "3-Month Bundle", individualCost: 1497, discountInr: 198, discountPercent: 13.2, fiveG: true },
  { planId: "P16", name: "Basic Saver Annual", category: "Basic Annual", durationMonths: 12, validity: 365, price: 1999, monthlyEquivalent: 166.58, dataLimit: 2, callMinutes: 999999, smsLimit: 50, offerType: "Annual Bundle", individualCost: 2388, discountInr: 389, discountPercent: 16.3, fiveG: false },
  { planId: "P17", name: "Talk Max Annual", category: "Caller Annual", durationMonths: 12, validity: 365, price: 2999, monthlyEquivalent: 249.92, dataLimit: 8, callMinutes: 999999, smsLimit: 150, offerType: "Annual Bundle", individualCost: 3588, discountInr: 589, discountPercent: 16.4, fiveG: false },
  { planId: "P18", name: "Light Connect Annual", category: "Light Annual", durationMonths: 12, validity: 365, price: 3499, monthlyEquivalent: 291.58, dataLimit: 28, callMinutes: 999999, smsLimit: 150, offerType: "Annual Bundle", individualCost: 4188, discountInr: 689, discountPercent: 16.5, fiveG: false },
  { planId: "P19", name: "Smart Plus Annual", category: "Standard+ Annual", durationMonths: 12, validity: 365, price: 4199, monthlyEquivalent: 349.92, dataLimit: 60, callMinutes: 999999, smsLimit: 150, offerType: "Annual Bundle", individualCost: 5040, discountInr: 841, discountPercent: 16.7, fiveG: true },
  { planId: "P20", name: "Stream 100 Annual", category: "Streamer+ Annual", durationMonths: 12, validity: 365, price: 4999, monthlyEquivalent: 416.58, dataLimit: 150, callMinutes: 999999, smsLimit: 150, offerType: "Annual Bundle", individualCost: 5988, discountInr: 989, discountPercent: 16.5, fiveG: true },
];

const BENEFITS_POOL = [
  "Free subscription to OTT app",
  "Unlimited 5G data (fair usage)",
  "Complimentary international roaming pack",
  "24x7 priority customer support",
  "Free caller tune service",
  "Handset protection insurance",
  "Cloud storage 100GB",
  "Access to partner lounges",
];

function pick(arr, n) {
  const copy = [...arr];
  const out = [];
  for (let i = 0; i < n && copy.length; i++) {
    out.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0]);
  }
  return out;
}

function buildPlans() {
  return PLAN_TEMPLATES.map((t) => {
    const discountNote = t.discountInr > 0 ? ` (Includes ${t.discountPercent}% bundle discount, save ₹${t.discountInr})` : "";
    return {
      _id: `plan_${t.planId}`,
      planId: t.planId,
      planCode: t.planId,
      name: t.name,
      operator: "",
      category: t.category,
      price: t.price,
      monthlyEquivalent: t.monthlyEquivalent,
      durationMonths: t.durationMonths,
      validity: t.validity,
      dataLimit: t.dataLimit,
      callMinutes: t.callMinutes,
      smsLimit: t.smsLimit,
      offerType: t.offerType,
      individualCost: t.individualCost,
      discountInr: t.discountInr,
      discountPercent: t.discountPercent,
      fiveG: t.fiveG,
      description: `${t.name} is a high-value ${t.category.toLowerCase()} plan with unlimited voice calling and ${t.dataLimit} GB data.${discountNote}`,
      benefits: pick(BENEFITS_POOL, 3),
      image: null,
      popularity: Math.floor(45 + Math.random() * 50),
      isActive: true,
      createdAt: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 120).toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });
}

const FIRST_NAMES = ["Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Krishna", "Ishaan", "Rohan", "Ananya", "Diya", "Aadhya", "Isha", "Kavya", "Meera", "Priya", "Riya", "Saanvi", "Tanvi", "Neha", "Pooja"];
const LAST_NAMES = ["Sharma", "Verma", "Iyer", "Reddy", "Nair", "Gupta", "Patel", "Singh", "Rao", "Menon", "Das", "Kapoor"];

function buildCustomers(plans) {
  const customers = [];
  for (let i = 0; i < 22; i++) {
    const first = FIRST_NAMES[i % FIRST_NAMES.length];
    const last = LAST_NAMES[i % LAST_NAMES.length];
    const email = `${first.toLowerCase()}.${last.toLowerCase()}${i}@example.com`;
    const userId = genId("user");
    const currentPlan = plans[Math.floor(Math.random() * plans.length)]._id;
    customers.push({
      user: {
        _id: userId,
        name: `${first} ${last}`,
        email,
        password: hash("password123"),
        phone: `9${Math.floor(100000000 + Math.random() * 899999999)}`,
        role: "customer",
        avatar: null,
        isActive: true,
        createdAt: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 200).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      profile: {
        _id: genId("profile"),
        userId,
        currentPlan,
        monthlyBudget: [299, 399, 499, 599, 799][Math.floor(Math.random() * 5)],
        minimumData: [5, 10, 20, 30, 50][Math.floor(Math.random() * 5)],
        minimumCallMinutes: [300, 500, 1000, 1500][Math.floor(Math.random() * 4)],
        minimumSms: [100, 300, 500][Math.floor(Math.random() * 3)],
        requires5G: Math.random() > 0.5,
      },
    });
  }
  return customers;
}

function monthKey(offset) {
  const d = new Date();
  d.setMonth(d.getMonth() - offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function buildUsage(customers) {
  const usage = [];
  customers.forEach(({ user }) => {
    for (let m = 0; m < 6; m++) {
      const baseData = 3 + Math.random() * 35;
      const baseCalls = 100 + Math.random() * 1400;
      const baseSms = 20 + Math.random() * 400;
      const numberOfCalls = Math.floor(baseCalls / (3 + Math.random() * 4));
      usage.push({
        _id: genId("usage"),
        customerId: user._id,
        dataUsage: Number(baseData.toFixed(1)),
        callMinutes: Math.floor(baseCalls),
        smsCount: Math.floor(baseSms),
        numberOfCalls: Math.max(numberOfCalls, 5),
        averageCallDuration: Number((baseCalls / Math.max(numberOfCalls, 5)).toFixed(1)),
        month: monthKey(m),
        createdAt: new Date().toISOString(),
      });
    }
  });
  return usage;
}

function buildAdmin() {
  return {
    _id: genId("user"),
    name: "SmartTariff Admin",
    email: "admin@smarttariff.com",
    password: hash("admin123"),
    phone: "9000000000",
    role: "admin",
    avatar: null,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function seedIfNeeded() {
  const existingUsers = getAll(collections.users);
  const existingPlans = getAll(collections.plans);
  const isCorrectSeedVersion = localStorage.getItem(SEED_VERSION_KEY) === "true";
  
  if (!isSeeded() || existingUsers.length === 0 || !isCorrectSeedVersion || existingPlans.length !== 20) {
    const plans = buildPlans();
    const customers = existingUsers.length > 0 ? [] : buildCustomers(plans);
    const usage = customers.length > 0 ? buildUsage(customers) : getAll(collections.usage);
    const admin = existingUsers.length > 0 ? null : buildAdmin();

    saveAll(collections.plans, plans);
    if (customers.length > 0 && admin) {
      saveAll(collections.users, [admin, ...customers.map((c) => c.user)]);
      saveAll(collections.customerProfiles, customers.map((c) => c.profile));
      saveAll(collections.usage, usage);
      saveAll(collections.recommendations, []);
      saveAll(collections.feedback, []);
    }

    markSeeded();
    localStorage.setItem(SEED_VERSION_KEY, "true");
  }

  // Ensure standard demo accounts are always present
  const users = getAll(collections.users);
  const profiles = getAll(collections.customerProfiles);
  const plans = getAll(collections.plans);
  const defaultPlan = plans[0]?._id || null;

  const demoAccounts = [
    { email: "admin@smarttariff.com", name: "SmartTariff Admin", password: "admin123", role: "admin" },
    { email: "aarav.sharma1@example.com", name: "Aarav Sharma", password: "password123", role: "customer" },
    { email: "aarav.sharma@example.com", name: "Aarav Sharma", password: "password123", role: "customer" },
    { email: "customer@smarttariff.com", name: "Demo Customer", password: "password123", role: "customer" },
    { email: "neha.sharma@example.com", name: "Neha Sharma", password: "password123", role: "customer" },
  ];

  let usersUpdated = false;
  demoAccounts.forEach((demo) => {
    const existing = users.find((u) => u.email.toLowerCase() === demo.email.toLowerCase());
    if (!existing) {
      const newId = genId("user");
      users.push({
        _id: newId,
        name: demo.name,
        email: demo.email,
        password: hash(demo.password),
        phone: "9876543210",
        role: demo.role,
        avatar: null,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      if (demo.role === "customer") {
        profiles.push({
          _id: genId("profile"),
          userId: newId,
          currentPlan: defaultPlan,
          monthlyBudget: 500,
          minimumData: 20,
          minimumCallMinutes: 500,
          minimumSms: 100,
          requires5G: true,
        });
      }
      usersUpdated = true;
    }
  });

  if (usersUpdated) {
    saveAll(collections.users, users);
    saveAll(collections.customerProfiles, profiles);
  }
}

export const DEMO_CREDENTIALS = {
  admin: { email: "admin@smarttariff.com", password: "admin123" },
  customer: { email: "aarav.sharma1@example.com", password: "password123" },
};

export function hashPassword(plain) {
  return hash(plain);
}
