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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#27549d] via-[#4f71b7] to-[#9eb3dc] px-4 py-10 flex items-center justify-center">
      <Card className="relative z-10 w-full max-w-sm rounded-[12px] border border-[#D8E6FF] bg-white/50 text-[#17325e] backdrop-blur-[4px] shadow-2xl">
        <CardHeader>
          <CardTitle>Initial setup</CardTitle>
          <CardDescription className="text-muted-foreground">Create super admin account.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-sm font-medium text-destructive" role="alert">{error}</p>}
            <div className="space-y-2">
              <Label htmlFor="full_name" className="text-[#17325e]">Full name</Label>
              <div className="relative">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 bg-[#27549d]"
                  style={{
                    maskImage: "url('/assets/user_2.svg')",
                    WebkitMaskImage: "url('/assets/user_2.svg')",
                    maskRepeat: "no-repeat",
                    WebkitMaskRepeat: "no-repeat",
                    maskPosition: "center",
                    WebkitMaskPosition: "center",
                    maskSize: "contain",
                    WebkitMaskSize: "contain",
                  }}
                />
                <Input
                  id="full_name"
                  type="text"
                  className="border-[#D8E6FF] bg-white/70 pl-10 text-[#17325e] placeholder:text-[#17325e]/60"
                  value={full_name}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#17325e]">Email</Label>
              <div className="relative">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 bg-[#27549d]"
                  style={{
                    maskImage: "url('/assets/user_2.svg')",
                    WebkitMaskImage: "url('/assets/user_2.svg')",
                    maskRepeat: "no-repeat",
                    WebkitMaskRepeat: "no-repeat",
                    maskPosition: "center",
                    WebkitMaskPosition: "center",
                    maskSize: "contain",
                    WebkitMaskSize: "contain",
                  }}
                />
                <Input
                  id="email"
                  type="email"
                  className="border-[#D8E6FF] bg-white/70 pl-10 text-[#17325e] placeholder:text-[#17325e]/60"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#17325e]">Password</Label>
              <div className="relative">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 bg-[#27549d]"
                  style={{
                    maskImage: "url('/assets/lock_circle.svg')",
                    WebkitMaskImage: "url('/assets/lock_circle.svg')",
                    maskRepeat: "no-repeat",
                    WebkitMaskRepeat: "no-repeat",
                    maskPosition: "center",
                    WebkitMaskPosition: "center",
                    maskSize: "contain",
                    WebkitMaskSize: "contain",
                  }}
                />
                <Input
                  id="password"
                  type="password"
                  className="border-[#D8E6FF] bg-white/70 pl-10 text-[#17325e] placeholder:text-[#17325e]/60"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Creating account..." : "Create super admin"}
            </Button>
          </form>
          <p className="text-center text-sm text-[#17325e]/80">
            <Link href="/login" className="text-[#17325e] hover:underline">
              Back to login
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
