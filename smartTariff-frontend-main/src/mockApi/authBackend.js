// Simulates JWT auth + bcrypt hashing + HTTP-only cookie session handling
// that would normally live in backend/src/controllers/authController.js
import { collections, insert, findOne, findById, genId } from "./db";
import { hashPassword } from "./seedData";

const TOKEN_KEY = "smarttariff:v1:token";

function simpleHash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return `hashed_${h}`;
}

function verifyPassword(plain, hashed) {
  return simpleHash(plain) === hashed;
}

function makeToken(user) {
  // Not a real JWT - just a base64 payload for demo session persistence.
  const payload = { sub: user._id, role: user.role, iat: Date.now() };
  return btoa(JSON.stringify(payload));
}

export function decodeToken(token) {
  try {
    return JSON.parse(atob(token));
  } catch {
    return null;
  }
}

export function setSessionToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getSessionToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearSessionToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function registerUser({ name, email, password, phone }) {
  const existing = findOne(collections.users, (u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    const err = new Error("An account with this email already exists");
    err.status = 409;
    throw err;
  }
  const user = {
    _id: genId("user"),
    name,
    email,
    password: hashPassword(password),
    phone,
    role: "customer",
    avatar: null,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  insert(collections.users, user);
  insert(collections.customerProfiles, {
    _id: genId("profile"),
    userId: user._id,
    currentPlan: null,
    monthlyBudget: 500,
    minimumData: 10,
    minimumCallMinutes: 500,
    minimumSms: 100,
    requires5G: false,
  });
  const token = makeToken(user);
  setSessionToken(token);
  return { user: sanitizeUser(user), token };
}

export function loginUser({ email, password }) {
  if (!email || !password) {
    const err = new Error("Please enter both email and password");
    err.status = 400;
    throw err;
  }

  const normalizedEmail = email.trim().toLowerCase();
  let user = findOne(collections.users, (u) => u.email.toLowerCase() === normalizedEmail);

  // Auto-provision standard demo accounts if not yet in localStorage
  if (!user) {
    const isDemoAdmin = normalizedEmail === "admin@smarttariff.com" && password === "admin123";
    const isDemoCustomer =
      normalizedEmail === "demo@smarttariff.com" ||
      normalizedEmail === "customer@smarttariff.com" ||
      normalizedEmail === "aarav.sharma@example.com" ||
      normalizedEmail === "aarav.sharma1@example.com" ||
      normalizedEmail === "neha.sharma@example.com";

    if (isDemoAdmin) {
      user = {
        _id: genId("user"),
        name: "SmartTariff Admin",
        email: "admin@smarttariff.com",
        password: hashPassword("admin123"),
        phone: "9000000000",
        role: "admin",
        avatar: null,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      insert(collections.users, user);
    } else if (isDemoCustomer || password === "password123") {
      const name = normalizedEmail.includes("sharma") ? "Aarav Sharma" : "Demo Customer";
      user = {
        _id: genId("user"),
        name,
        email: normalizedEmail,
        password: hashPassword(password),
        phone: "9876543210",
        role: "customer",
        avatar: null,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      insert(collections.users, user);
      insert(collections.customerProfiles, {
        _id: genId("profile"),
        userId: user._id,
        currentPlan: null,
        monthlyBudget: 500,
        minimumData: 20,
        minimumCallMinutes: 500,
        minimumSms: 100,
        requires5G: true,
      });
    }
  }

  if (!user || !verifyPassword(password, user.password)) {
    const err = new Error("Invalid email or password");
    err.status = 401;
    throw err;
  }

  if (!user.isActive) {
    const err = new Error("This account has been deactivated. Contact support.");
    err.status = 403;
    throw err;
  }

  const token = makeToken(user);
  setSessionToken(token);
  return { user: sanitizeUser(user), token };
}

export function getCurrentUser() {
  const token = getSessionToken();
  if (!token) return null;
  const payload = decodeToken(token);
  if (!payload) return null;
  const user = findById(collections.users, payload.sub);
  if (!user || !user.isActive) return null;
  return sanitizeUser(user);
}

export function logoutUser() {
  clearSessionToken();
}

export function sanitizeUser(user) {
  if (!user) return null;
  const { password, ...safe } = user;
  return safe;
}
