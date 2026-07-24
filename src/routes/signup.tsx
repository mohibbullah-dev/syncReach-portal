import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";

import { AdminUserAvatar } from "@/components/admin/AdminUserAvatar";
import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import { AuthPageShell } from "@/components/admin/AuthPageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uploadToCloudinary } from "@/lib/cloudinary-upload";

export const Route = createFileRoute("/signup")({
  component: AdminSignupPage,
  head: () => ({
    meta: [{ title: "Sign up — SyncReach Admin" }],
  }),
});

function AdminSignupPage() {
  const { user, ready, signUp } = useAdminAuth();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (ready && user) {
      void navigate({ to: "/" });
    }
  }, [ready, user, navigate]);

  const onPickFile = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    setUploading(true);
    try {
      const { url } = await uploadToCloudinary(file, "profiles");
      setAvatarUrl(url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not upload image.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    const result = await signUp({
      name,
      email,
      password,
      ...(avatarUrl ? { avatarUrl } : {}),
    });
    setSubmitting(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    toast.success("Account created — welcome to SyncReach Admin");
    void navigate({ to: "/" });
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
      title="Create account"
      subtitle="Sign up to manage SyncReach CMS content."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-[#0061FF] hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-5">
          <AdminUserAvatar
            name={name || "You"}
            avatarUrl={avatarUrl}
            className="h-20 w-20"
            iconClassName="h-8 w-8"
          />
          <div className="text-center">
            <div className="text-sm font-medium text-slate-900">Profile photo</div>
            <p className="mt-0.5 text-xs text-slate-500">Optional — you can add this later</p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => void onPickFile(e.target.files?.[0])}
          />
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-xl"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
            >
              {uploading ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Upload className="mr-1.5 h-3.5 w-3.5" />
              )}
              {avatarUrl ? "Change photo" : "Upload photo"}
            </Button>
            {avatarUrl ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="rounded-xl text-slate-500"
                onClick={() => setAvatarUrl(undefined)}
              >
                Remove
              </Button>
            ) : null}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="h-11 rounded-xl"
          />
        </div>

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
              autoComplete="new-password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
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

        <div className="space-y-2">
          <Label htmlFor="confirm">Confirm password</Label>
          <Input
            id="confirm"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            minLength={6}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Repeat password"
            className="h-11 rounded-xl"
          />
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
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create account"}
        </Button>
      </form>
    </AuthPageShell>
  );
}

