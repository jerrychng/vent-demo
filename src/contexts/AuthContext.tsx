"use client";

/**
 * Auth context: JWT-based auth.
 * - On load: read token from localStorage → decode JWT → if valid, set user from payload (or /auth/me).
 * - On login: POST /auth/login → store access_token → decode JWT and set user from payload (or response.user).
 * - Logout: clear token and user.
 * - isTokenValid(): true if token exists and not expired (uses JWT exp).
 */
import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { apiFetch } from "@/lib/api";
import type { User, UserRole } from "@/types/models";

export type { User } from "@/types/models";

/** Shape of our JWT payload (backend should put user id, email, full_name, role, exp in the token). */
type JWTPayload = {
  sub: string;
  email?: string;
  full_name?: string;
  role?: UserRole;
  exp: number;
  iat?: number;
  [key: string]: any;
};

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isTokenValid: () => boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/** Decode JWT without verifying signature (backend verifies; we only read claims). */
function decodeToken(token: string): JWTPayload | null {
  try {
    return jwtDecode<JWTPayload>(token);
  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
}

/** True if token is missing, invalid, or past exp (exp is Unix seconds). */
function isTokenExpired(token: string): boolean {
  const payload = decodeToken(token);
  if (!payload || !payload.exp) {
    return true;
  }
  const expirationTime = payload.exp * 1000;
  return Date.now() >= expirationTime;
}

/** Build User from JWT payload. Returns null if required claims (email, full_name, role) are missing. */
function extractUserFromToken(token: string): User | null {
  const payload = decodeToken(token);
  if (!payload) {
    return null;
  }

  // The JWT "sub" claim (subject, i.e. user id) should be a string. Parse to number for our User model.
  const userId = typeof payload.sub === "string" ? parseInt(payload.sub, 10) : payload.sub;

  if (!payload.email || !payload.full_name || !payload.role) {
    return null;
  }

  return {
    id: typeof userId === "number" ? userId : parseInt(payload.sub) || 0,
    email: payload.email,
    full_name: payload.full_name,
    role: payload.role as UserRole,
    is_active: true,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  /** For components that need to know if the current token is still valid (e.g. before a sensitive action). */
  function isTokenValid(): boolean {
    if (typeof window === "undefined") return false;
    const token = window.localStorage.getItem("token");
    if (!token) return false;
    return !isTokenExpired(token);
  }

  // On mount: restore session from JWT in localStorage (no password, no call if no token).
  useEffect(() => {
    if (typeof window === "undefined") {
      setLoading(false);
      return;
    }

    const token = window.localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    if (isTokenExpired(token)) {
      window.localStorage.removeItem("token");
      setLoading(false);
      return;
    }

    const userFromToken = extractUserFromToken(token);
    if (userFromToken) {
      setUser(userFromToken);
      apiFetch<User>("/auth/me")
        .then((u) => setUser(u))
        .catch(() => console.warn("Token validation failed, using token data"))
        .finally(() => setLoading(false));
    } else {
      apiFetch<User>("/auth/me")
        .then((u) => setUser(u))
        .catch(() => {
          window.localStorage.removeItem("token");
          setUser(null);
        })
        .finally(() => setLoading(false));
    }
  }, []);

  /** Login: POST credentials → store JWT → set user from decoded JWT (or from response.user). */
  async function login(email: string, password: string) {
    const res = await apiFetch<{
      access_token: string;
      token_type: string;
      user?: User;
    }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });

    if (typeof window !== "undefined") {
      window.localStorage.setItem("token", res.access_token);
    }

    const userFromToken = extractUserFromToken(res.access_token);
    if (userFromToken) {
      setUser(userFromToken);
    } else if (res.user) {
      setUser(res.user);
    }
  }

  /** Clear JWT and user; caller typically redirects to /login. */
  function logout() {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("token");
    }
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isTokenValid }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}

