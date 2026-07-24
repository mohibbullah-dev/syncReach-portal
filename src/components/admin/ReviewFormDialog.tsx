import { useEffect, useState } from "react";
import {
  Loader2,
  Mic,
  Star,
  Trash2,
  Type,
  Upload,
  User,
  Video,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { isRealProfileImage } from "@/lib/profile-image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { Review, ReviewType } from "@/data/reviews";
import { uploadToCloudinary } from "@/lib/cloudinary-upload";
import { newId } from "@/lib/cms-store";
import { cn } from "@/lib/utils";

const TYPES: Array<{ id: ReviewType; label: string; icon: typeof Type; hint: string }> = [
  { id: "text", label: "Text", icon: Type, hint: "Quote only" },
  { id: "audio", label: "Audio", icon: Mic, hint: "MP3 / URL" },
  { id: "video", label: "Video", icon: Video, hint: "MP4 / URL" },
];

export type ReviewFormValues = Omit<Review, "id"> & { id?: string };

const emptyValues = (): ReviewFormValues => ({
  type: "text",
  name: "",
  username: "",
  role: "",
  avatar: "",
  body: "",
  mediaUrl: "",
  thumbnailUrl: "",
  rating: 5,
  featured: false,
});

function fromReview(review: Review): ReviewFormValues {
  return {
    id: review.id,
    type: review.type,
    name: review.name,
    username: review.username,
    role: review.role,
    avatar: review.avatar,
    body: review.body,
    mediaUrl: review.mediaUrl ?? "",
    thumbnailUrl: review.thumbnailUrl ?? "",
    rating: review.rating,
    featured: review.featured,
  };
}

type ReviewFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: Review | null;
  onSave: (review: Review) => void | Promise<void>;
  onDelete?: (id: string) => void | Promise<void>;
};

export function ReviewFormDialog({
  open,
  onOpenChange,
  initial,
  onSave,
  onDelete,
}: ReviewFormDialogProps) {
  const editing = Boolean(initial);
  const [values, setValues] = useState<ReviewFormValues>(emptyValues);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError("");
    setValues(initial ? fromReview(initial) : emptyValues());
  }, [open, initial]);

  const set = <K extends keyof ReviewFormValues>(key: K, value: ReviewFormValues[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
  };

  const onPickAvatar = async (file: File | null) => {
    if (!file) return;
    try {
      setBusy(true);
      const { url } = await uploadToCloudinary(file, "reviews/avatars");
      set("avatar", url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  const onPickMedia = async (file: File | null) => {
    if (!file) return;
    try {
      setBusy(true);
      const { url } = await uploadToCloudinary(file, "reviews/media");
      set("mediaUrl", url);
      if (file.type.startsWith("image/") && !values.thumbnailUrl) {
        set("thumbnailUrl", url);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  const onPickThumb = async (file: File | null) => {
    if (!file) return;
    try {
      setBusy(true);
      const { url } = await uploadToCloudinary(file, "reviews/thumbs");
      set("thumbnailUrl", url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (values.name.trim().length < 2) {
      setError("Customer name is required.");
      return;
    }
    if (values.body.trim().length < 8) {
      setError("Please add a longer quote / caption.");
      return;
    }
    if ((values.type === "audio" || values.type === "video") && !values.mediaUrl?.trim()) {
      setError("Upload a file or paste a media URL for audio/video reviews.");
      return;
    }

    const username =
      values.username.trim() ||
      `@${values.name.trim().toLowerCase().replace(/\s+/g, "").slice(0, 16)}`;

    const review: Review = {
      id: values.id ?? newId("r"),
      type: values.type,
      name: values.name.trim(),
      username: username.startsWith("@") ? username : `@${username}`,
      role: values.role.trim() || "Customer",
      avatar: values.avatar.trim(),
      body: values.body.trim(),
      mediaUrl: values.mediaUrl?.trim() || undefined,
      thumbnailUrl: values.thumbnailUrl?.trim() || undefined,
      rating: Math.min(5, Math.max(1, Number(values.rating) || 5)),
      featured: values.featured,
    };

    try {
      setBusy(true);
      await onSave(review);
      toast.success(editing ? "Review updated" : "Review created");
      onOpenChange(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto rounded-2xl border-slate-200 p-0 sm:max-w-xl">
        <div className="border-b border-slate-100 bg-gradient-to-br from-[#E8F0FF] via-white to-white px-6 py-5">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-slate-900">
              {editing ? "Edit review" : "Add review"}
            </DialogTitle>
            <DialogDescription>
              Text, audio, or video testimonials for the public site.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={submit} className="space-y-5 px-6 py-5">
          <div>
            <Label className="mb-2 block text-slate-700">Review type</Label>
            <div className="grid grid-cols-3 gap-2">
              {TYPES.map((t) => {
                const Icon = t.icon;
                const active = values.type === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => set("type", t.id)}
                    className={cn(
                      "rounded-xl border px-3 py-3 text-left transition",
                      active
                        ? "border-[#0061FF] bg-[#E8F0FF] shadow-sm"
                        : "border-slate-200 bg-white hover:border-slate-300",
                    )}
                  >
                    <Icon className={cn("h-4 w-4", active ? "text-[#0061FF]" : "text-slate-400")} />
                    <div className="mt-1.5 text-sm font-semibold text-slate-900">{t.label}</div>
                    <div className="text-[11px] text-slate-500">{t.hint}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="rev-name">Customer name</Label>
              <Input
                id="rev-name"
                value={values.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Amina Rahman"
                className="h-11 rounded-xl"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rev-user">Username</Label>
              <Input
                id="rev-user"
                value={values.username}
                onChange={(e) => set("username", e.target.value)}
                placeholder="@amina"
                className="h-11 rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rev-role">Role / company</Label>
            <Input
              id="rev-role"
              value={values.role}
              onChange={(e) => set("role", e.target.value)}
              placeholder="Head of Growth · SaaS agency"
              className="h-11 rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label>Avatar</Label>
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100">
                {isRealProfileImage(values.avatar) ? (
                  <img src={values.avatar} alt="" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-6 w-6 text-slate-400" />
                )}
              </div>
              <div className="flex-1 space-y-2">
                <Input
                  value={values.avatar}
                  onChange={(e) => set("avatar", e.target.value)}
                  placeholder="https://… or upload"
                  className="h-10 rounded-xl"
                />
                <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-[#0061FF]">
                  <Upload className="h-3.5 w-3.5" />
                  Upload image
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => void onPickAvatar(e.target.files?.[0] ?? null)}
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rev-body">Quote / caption</Label>
            <Textarea
              id="rev-body"
              value={values.body}
              onChange={(e) => set("body", e.target.value)}
              placeholder="What did they say about SyncReach?"
              className="min-h-28 rounded-xl"
              required
            />
          </div>

          {(values.type === "audio" || values.type === "video") && (
            <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
              <div className="space-y-2">
                <Label htmlFor="rev-media">
                  {values.type === "audio" ? "Audio URL / file" : "Video URL / file"}
                </Label>
                <Input
                  id="rev-media"
                  value={values.mediaUrl}
                  onChange={(e) => set("mediaUrl", e.target.value)}
                  placeholder={
                    values.type === "audio"
                      ? "https://…/clip.mp3"
                      : "https://…/clip.mp4 or YouTube later"
                  }
                  className="h-11 rounded-xl bg-white"
                />
                <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-[#0061FF]">
                  <Upload className="h-3.5 w-3.5" />
                  Upload {values.type} file
                  <input
                    type="file"
                    accept={values.type === "audio" ? "audio/*" : "video/*"}
                    className="hidden"
                    onChange={(e) => void onPickMedia(e.target.files?.[0] ?? null)}
                  />
                </label>
              </div>

              {values.type === "video" && (
                <div className="space-y-2">
                  <Label htmlFor="rev-thumb">Thumbnail / poster</Label>
                  <Input
                    id="rev-thumb"
                    value={values.thumbnailUrl}
                    onChange={(e) => set("thumbnailUrl", e.target.value)}
                    placeholder="https://…/cover.jpg"
                    className="h-11 rounded-xl bg-white"
                  />
                  <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-[#0061FF]">
                    <Upload className="h-3.5 w-3.5" />
                    Upload thumbnail
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => void onPickThumb(e.target.files?.[0] ?? null)}
                    />
                  </label>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 px-4 py-3">
            <div>
              <div className="text-sm font-medium text-slate-900">Featured on homepage</div>
              <div className="text-xs text-slate-500">Show in the 3D marquee</div>
            </div>
            <Switch checked={values.featured} onCheckedChange={(v) => set("featured", v)} />
          </div>

          <div className="space-y-2">
            <Label>Rating</Label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => set("rating", n)}
                  className="rounded-lg p-1.5 transition hover:bg-amber-50"
                  aria-label={`${n} stars`}
                >
                  <Star
                    className={cn(
                      "h-5 w-5",
                      n <= values.rating ? "fill-amber-400 text-amber-400" : "text-slate-300",
                    )}
                  />
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
            {editing && onDelete && values.id ? (
              <Button
                type="button"
                variant="ghost"
                className="text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={() => {
                  onDelete(values.id!);
                  toast.success("Review deleted");
                  onOpenChange(false);
                }}
              >
                <Trash2 className="mr-1.5 h-4 w-4" />
                Delete
              </Button>
            ) : (
              <span />
            )}
            <div className="ml-auto flex gap-2">
              <Button type="button" variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={busy}
                className="rounded-xl bg-[#0061FF] hover:bg-[#0052D6]"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : editing ? "Save changes" : "Create review"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
