// Thin response envelope helper shared by all *Api.js modules.
// Mirrors the consistent API response shape the real Express backend returns:
//   { success, message, data } on success
//   { success, message } on error (thrown as ApiError)
import { delay } from "@/mockApi/db";

export class ApiError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

export async function simulateRequest(fn, { latency = 350 } = {}) {
  await delay(latency);
  try {
    const data = fn();
    return { success: true, message: "OK", data };
  } catch (err) {
    throw new ApiError(err.message || "Something went wrong", err.status || 500);
  }
}

export function ok(data, message = "OK") {
  return { success: true, message, data };
}
