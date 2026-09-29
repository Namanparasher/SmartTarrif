// Mirrors /api/v1/auth/* routes
import { simulateRequest } from "./api";
import { registerUser, loginUser, logoutUser, getCurrentUser } from "@/mockApi/authBackend";

export const authApi = {
  register: (payload) => simulateRequest(() => registerUser(payload)),
  login: (payload) => simulateRequest(() => loginUser(payload)),
  logout: () => simulateRequest(() => { logoutUser(); return null; }),
  me: () => simulateRequest(() => getCurrentUser(), { latency: 200 }),
};
