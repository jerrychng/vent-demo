"use client";

/**
 * One-time setup: POST /auth/setup to create the first super_admin.
 * Only works when no users exist; backend returns 403 with "Setup already completed" otherwise.
 */
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

type SetupResponse = {
  id: number;
  email: string;
  full_name: string;
  role: "super_admin";
};

export default function SetupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [full_name, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await apiFetch<SetupResponse>("/auth/setup", {
        method: "POST",
        body: JSON.stringify({ email, password, full_name }),
      });
      const t = toast({ title: "Successfully created. Sign in." });
      setTimeout(() => t.dismiss(), 4000);
      router.push("/login");
    } catch (err: any) {
      setError(err.message || "Setup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-100">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white shadow rounded p-6 space-y-4"
      >
        <h1 className="text-xl font-semibold">Initial setup</h1>
        <p className="text-sm text-slate-600">
          Create super admin account.
        </p>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="space-y-1 text-sm">
          <label className="block">
            Full name
            <input
              type="text"
              className="mt-1 w-full border rounded px-2 py-1"
              value={full_name}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </label>
        </div>
        <div className="space-y-1 text-sm">
          <label className="block">
            Email
            <input
              type="email"
              className="mt-1 w-full border rounded px-2 py-1"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
        </div>
        <div className="space-y-1 text-sm">
          <label className="block">
            Password
            <input
              type="password"
              className="mt-1 w-full border rounded px-2 py-1"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
        </div>
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Creating account..." : "Create super admin"}
        </Button>
        <p className="text-center text-sm text-slate-500">
          <Link href="/login" className="text-slate-700 hover:underline">
            Back to login
          </Link>
        </p>
      </form>
    </main>
  );
}
