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
import { getPasswordValidationError, PASSWORD_POLICY } from "@/lib/passwordValidation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordField } from "@/components/ui/password-field";

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
  const passwordError = getPasswordValidationError(password);
  const canSubmit = !loading && !passwordError;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const validationError = getPasswordValidationError(password);
    if (validationError) {
      setError(validationError);
      return;
    }
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
    <main
      className="min-h-screen flex items-center justify-center py-5 px-3.5 bg-cover bg-center bg-[url('/assets/background.jpg')]"
    >
      <div
        className="w-[24rem] max-w-[calc(100vw-1.75rem)] rounded-[1.125rem] p-6 text-center text-dark-primary bg-white border border-subtle shadow-[0_18px_32px_rgba(23,50,94,0.18)]"
      >
        <div className="mb-6">
          <img
            src="/assets/aspectLogoIcon.svg"
            alt="ASPECT Logo"
            className="w-16 h-16 mx-auto object-contain"
          />
        </div>
        <h1 className="text-2xl font-bold leading-tight mb-1.5">Create Super Admin Account</h1>
        <p className="text-sm text-dark-primary/75 mb-5">Initial setup for first system access</p>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {error && <p className="text-sm font-medium text-destructive" role="alert">{error}</p>}
          <div className="space-y-2">
            <Label htmlFor="full_name" className="text-dark-primary">Full name</Label>
            <Input
              id="full_name"
              type="text"
              className="border-subtle bg-white text-dark-primary placeholder:text-dark-primary/60"
              value={full_name}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-dark-primary">Email</Label>
            <Input
              id="email"
              type="email"
              className="border-subtle bg-white text-dark-primary placeholder:text-dark-primary/60"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-dark-primary">Password</Label>
            <PasswordField
              id="password"
              className="border-subtle bg-white text-dark-primary placeholder:text-dark-primary/60"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              maxLength={PASSWORD_POLICY.maxLength}
              minLength={PASSWORD_POLICY.minLength}
              required
            />
            <p className="text-xs text-dark-primary/70">
              Use {PASSWORD_POLICY.minLength}-{PASSWORD_POLICY.maxLength} characters with uppercase, lowercase, number, and special character.
            </p>
            {password && passwordError && (
              <p className="text-xs text-destructive" role="alert">{passwordError}</p>
            )}
          </div>
          <Button
            type="submit"
            disabled={!canSubmit}
            className="w-full min-h-11 bg-primary text-white hover:bg-dark-primary"
          >
            {loading ? "Creating account..." : "Create super admin"}
          </Button>
        </form>

        <p className="mt-6 text-sm text-gray-500"> 📞 Chumley AI - +441908024199</p>
        <p className="mt-4 text-sm text-dark-primary/80">
          <Link href="/login" className="text-dark-primary hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </main>
  );
}
