import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  WifiOff,
} from "lucide-react";
import { toast } from "sonner";

import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import { AuthPageShell } from "@/components/admin/AuthPageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/login")({
  component: AdminLoginPage,
  head: () => ({
    meta: [{ title: "Sign in: SyncReach Admin" }],
  }),
});

type AuthNotice = {
  tone: "error" | "success";
  title: string;
  detail: string;
};

function humanizeLoginError(raw: string): AuthNotice {
  const msg = (raw || "").trim();
  const lower = msg.toLowerCase();

  if (
    lower.includes("failed to fetch") ||
    lower.includes("networkerror") ||
    lower.includes("network request failed") ||
    lower.includes("load failed") ||
    lower.includes("fetch failed")
  ) {
    return {
      tone: "error",
      title: "Can't reach the SyncReach API",
      detail:
        "The backend looks offline or blocked. Start the API server, then confirm VITE_API_URL points to /api.",
    };
  }

  if (
    lower.includes("invalid email or password") ||
    lower.includes("invalid credentials") ||
    lower.includes("unauthorized") ||
    lower.includes("401")
  ) {
    return {
      tone: "error",
      title: "Incorrect email or password",
      detail: "Check both fields carefully. Passwords are case-sensitive.",
    };
  }

  if (lower.includes("admin access required") || lower.includes("403")) {
    return {
      tone: "error",
      title: "Admin access required",
      detail: "This account cannot open the CMS. Ask a Super Admin for access.",
    };
  }

  if (lower.includes("too many") || lower.includes("rate")) {
    return {
      tone: "error",
      title: "Too many attempts",
      detail: "Please wait a moment, then try signing in again.",
    };
  }

  return {
    tone: "error",
    title: "Sign in failed",
    detail: msg || "Something went wrong. Please try again.",
  };
}

function AuthAlert({ notice }: { notice: AuthNotice }) {
  const isError = notice.tone === "error";
  const Icon =
    isError && notice.title.toLowerCase().includes("can't reach")
      ? WifiOff
      : isError
        ? AlertCircle
        : CheckCircle2;

  return (
    <div
      role="alert"
      className={cn(
        "flex gap-3 rounded-[12px] border px-3.5 py-3 text-left",
        isError
          ? "border-red-200 bg-red-50 text-red-800"
          : "border-emerald-200 bg-emerald-50 text-emerald-800",
      )}
    >
      <Icon
        className={cn(
          "mt-0.5 h-4 w-4 shrink-0",
          isError ? "text-red-500" : "text-emerald-600",
        )}
      />
      <div className="min-w-0">
        <div className="text-sm font-semibold leading-snug">{notice.title}</div>
        <p className="mt-0.5 text-xs leading-relaxed opacity-90">{notice.detail}</p>
      </div>
    </div>
  );
}

function AdminLoginPage() {
  const { user, ready, signIn } = useAdminAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState<AuthNotice | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (ready && user) {
      void navigate({ to: "/" });
    }
  }, [ready, user, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotice(null);
    setSubmitting(true);
    const result = await signIn(email, password);
    setSubmitting(false);

    if (!result.ok) {
      setNotice(humanizeLoginError(result.error));
      return;
    }

    const firstName = result.user.name.split(" ")[0] || result.user.name;
    setNotice({
      tone: "success",
      title: `Welcome back, ${firstName}`,
      detail: "Signed in successfully. Opening your CMS dashboard…",
    });
    toast.success(`Welcome back, ${result.user.name}`, {
      description: "You're signed in to the SyncReach Admin CMS.",
    });
    window.setTimeout(() => {
      void navigate({ to: "/" });
    }, 450);
  };

  if (!ready || user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#EEF2F8]">
        <Loader2 className="h-6 w-6 animate-spin text-[#0061FF]" />
      </div>
    );
  }

  return (
    <AuthPageShell
      title="Sign in"
      subtitle="Secure access to reviews, gallery, pricing, FAQ, and team content."
      footer={
        <>
          Accounts are created by a Super Admin only.
          <span className="mt-1 block text-xs text-slate-400">
            Need help? Ask your Super Admin for an invite.
          </span>
        </>
      }
    >
      <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-slate-600">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (notice) setNotice(null);
            }}
            placeholder="you@company.com"
            className="h-11 rounded-[12px] border-slate-200 bg-slate-50/70 focus-visible:bg-white"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-slate-600">
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (notice) setNotice(null);
              }}
              placeholder="Enter your password"
              className="h-11 rounded-[12px] border-slate-200 bg-slate-50/70 pr-10 focus-visible:bg-white"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-[12px] p-0.5 text-slate-400 transition hover:text-slate-600"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {notice ? <AuthAlert notice={notice} /> : null}

        <Button
          type="submit"
          disabled={submitting || notice?.tone === "success"}
          className="h-11 w-full rounded-[12px] bg-[#0061FF] text-sm font-semibold shadow-[0_10px_24px_-12px_rgba(0,97,255,0.8)] hover:bg-[#0052D6]"
        >
          {submitting ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing in…
            </span>
          ) : notice?.tone === "success" ? (
            "Opening dashboard…"
          ) : (
            "Sign in"
          )}
        </Button>
      </form>
    </AuthPageShell>
  );
}
