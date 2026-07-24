import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

import { AdminUserAvatar } from "@/components/admin/AdminUserAvatar";
import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uploadToCloudinary } from "@/lib/cloudinary-upload";

export const Route = createFileRoute("/profile")({
  component: AdminProfilePage,
  head: () => ({
    meta: [{ title: "Profile — SyncReach Admin" }],
  }),
});

function AdminProfilePage() {
  const { user, updateProfile } = useAdminAuth();
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user) return;
    setName(user.name);
    setEmail(user.email);
    setAvatarUrl(user.avatarUrl);
  }, [user]);

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
      toast.success("Photo ready — save to apply.");
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

    if (password && password !== confirm) {
      setError("New passwords do not match.");
      return;
    }

    setSaving(true);
    const result = await updateProfile({
      name,
      email,
      avatarUrl: avatarUrl ?? null,
      ...(password ? { password } : {}),
    });
    setSaving(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setPassword("");
    setConfirm("");
    toast.success("Profile updated");
  };

  if (!user) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
          Profile
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Update your name, email, password, and profile photo.
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="space-y-6 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_-18px_rgba(15,23,42,0.18)]"
      >
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <AdminUserAvatar
            name={name}
            avatarUrl={avatarUrl}
            className="h-24 w-24"
            iconClassName="h-10 w-10"
          />
          <div className="flex-1 space-y-3 text-center sm:text-left">
            <div>
              <div className="text-sm font-medium text-slate-900">Profile photo</div>
              <p className="mt-0.5 text-xs text-slate-500">
                Optional. Without a photo, a profile icon is shown in the header.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => void onPickFile(e.target.files?.[0])}
              />
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
              >
                {uploading ? (
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-1.5 h-4 w-4" />
                )}
                {avatarUrl ? "Change photo" : "Upload photo"}
              </Button>
              {avatarUrl ? (
                <Button
                  type="button"
                  variant="ghost"
                  className="rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => setAvatarUrl(undefined)}
                >
                  <Trash2 className="mr-1.5 h-4 w-4" />
                  Remove
                </Button>
              ) : null}
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="profile-name">Full name</Label>
            <Input
              id="profile-name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11 rounded-xl"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="profile-email">Email</Label>
            <Input
              id="profile-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-password">New password</Label>
            <Input
              id="profile-password"
              type="password"
              autoComplete="new-password"
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave blank to keep"
              className="h-11 rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-confirm">Confirm password</Label>
            <Input
              id="profile-confirm"
              type="password"
              autoComplete="new-password"
              minLength={6}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repeat if changing"
              className="h-11 rounded-xl"
            />
          </div>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </div>
        ) : null}

        <Button
          type="submit"
          disabled={saving}
          className="h-11 rounded-xl bg-[#0061FF] hover:bg-[#0052D6]"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save profile"}
        </Button>
      </form>
    </div>
  );
}
