/**
 * API client: all requests use JWT Bearer token from localStorage.
 * - When NEXT_PUBLIC_USE_MOCK_API=true, uses in-memory mock (no backend).
 * - Otherwise: decodes JWT to check expiration, sends Bearer token, clears on 401.
 */

import { jwtDecode } from "jwt-decode";
import { mockApiFetch } from "./mockApi";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";
/** Use mock when not explicitly set to "false" so the app works without a backend by default. */
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_API !== "false";

/** JWT payload has exp (expiration) in seconds. We treat missing/invalid token as expired. */
function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwtDecode<{ exp?: number }>(token);
    if (!decoded.exp) {
      return true;
    }
    const expirationTime = decoded.exp * 1000; // exp is seconds, Date.now() is ms
    return Date.now() >= expirationTime;
  } catch {
    return true;
  }
}

/** Fetch with JWT: attach Bearer token, reject if token expired, clear token on 401. */
export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== "undefined" ? window.localStorage.getItem("token") : null;

  if (token && isTokenExpired(token)) {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("token");
    }
    throw new Error("Token expired. Please login again.");
  }

  if (USE_MOCK) {
    return mockApiFetch<T>(path, options);
  }

  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    if (res.status === 401 && typeof window !== "undefined") {
      window.localStorage.removeItem("token");
    }

    let detail: string | undefined;
    try {
      const body = await res.json();
      detail = body.detail as string | undefined;
    } catch {
      // ignore
    }
    throw new Error(detail || `Request failed with status ${res.status}`);
  }

  return res.json() as Promise<T>;
}

