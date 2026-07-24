import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import { AuthPageShell } from "@/components/admin/AuthPageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DEMO_CREDENTIALS } from "@/lib/admin-auth";

export const Route = createFileRoute("/login")({
  component: AdminLoginPage,
  head: () => ({
    meta: [{ title: "Sign in — SyncReach Admin" }],
  }),
});

function AdminLoginPage() {
  const { user, ready, signIn } = useAdminAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (ready && user) {
      void navigate({ to: "/" });
    }
  }, [ready, user, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const result = await signIn(email, password);
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    toast.success(`Welcome back, ${result.user.name}`);
    void navigate({ to: "/" });
  };

  const fillDemo = () => {
    setEmail(DEMO_CREDENTIALS.email);
    setPassword(DEMO_CREDENTIALS.password);
    setError("");
  };

  if (!ready || user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F7FB]">
        <Loader2 className="h-6 w-6 animate-spin text-[#0061FF]" />
      </div>
    );
  }

  return (
    <AuthPageShell
      title="Sign in"
      subtitle="Access the SyncReach CMS admin portal."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="font-semibold text-[#0061FF] hover:underline">
            Sign up
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="h-11 rounded-xl"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-11 rounded-xl pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </div>
        )}

        <Button
          type="submit"
          disabled={submitting}
          className="h-11 w-full rounded-xl bg-[#0061FF] text-sm font-semibold hover:bg-[#0052D6]"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
        </Button>

        <button
          type="button"
          onClick={fillDemo}
          className="w-full rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-2.5 text-left text-xs text-slate-500 transition hover:border-[#0061FF]/40 hover:bg-[#E8F0FF]/50"
        >
          <span className="font-semibold text-slate-700">Demo account</span>
          <br />
          {DEMO_CREDENTIALS.email} · {DEMO_CREDENTIALS.password}
        </button>
      </form>
    </AuthPageShell>
  );
}
