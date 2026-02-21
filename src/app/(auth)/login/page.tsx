"use client";

/**
 * Login page: calls AuthContext.login(email, password).
 * - login() POSTs to /auth/login, stores JWT in localStorage, sets user from JWT (or response).
 * - On success we redirect to /dashboard (protected layout will allow it because user is set).
 */
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const loggedInUser = await login(email, password); // stores JWT, sets user in context
      router.push(loggedInUser.role === "engineer" ? "/engineer-home" : "/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card text-[#17325e]">
        <div className="mb-6">
          <img
            src="/assets/aspectLogoIcon.svg"
            alt="ASPECT Logo"
            className="auth-logo"
          />
        </div>
        <h1 className="auth-title font-bold">Chumley Navigator for Vent Hygiene</h1>
        <p className="auth-subtitle text-sm text-[#17325e]/75">Sign in to access the dashboard</p>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {error && (
            <p className="text-sm text-red-700" role="alert">
              {error}
            </p>
          )}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-[#17325e]">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="border-[#D8E6FF] bg-white text-[#17325e] placeholder:text-[#17325e]/60"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-[#17325e]">Password</Label>
            <Input
              id="password"
              type="password"
              className="border-[#D8E6FF] bg-white text-[#17325e] placeholder:text-[#17325e]/60"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button
            type="submit"
            className="auth-primary-btn w-full bg-[var(--color-primary)] text-white hover:bg-[#17325e]"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <p className="mt-6 text-sm text-gray-500"> 📞 Chumley AI - +441908024199</p>
        <p className="mt-4 text-sm text-[#17325e]/80">
          <Link href="/setup" className="text-[#17325e] hover:underline">
            Super Admin Sign Up
          </Link>
        </p>
      </div>
    </main>
  );
}
