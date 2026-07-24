import { useEffect, useState } from "react";
import {
  Image as ImageIcon,
  Loader2,
  Trash2,
  Upload,
  Video,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
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
import type { GalleryItem, GalleryMediaType } from "@/data/gallery";
import { uploadToCloudinary } from "@/lib/cloudinary-upload";
import { newId } from "@/lib/cms-store";
import { cn } from "@/lib/utils";

export type GalleryFormValues = Omit<GalleryItem, "id"> & { id?: string };

const emptyValues = (): GalleryFormValues => ({
  type: "photo",
  title: "",
  caption: "",
  src: "",
  thumbnailUrl: "",
  featured: false,
  sortOrder: 1,
  published: true,
});

function fromItem(item: GalleryItem): GalleryFormValues {
  return {
    id: item.id,
    type: item.type,
    title: item.title,
    caption: item.caption,
    src: item.src,
    thumbnailUrl: item.thumbnailUrl ?? "",
    featured: Boolean(item.featured),
    sortOrder: item.sortOrder,
    published: item.published,
  };
}

type GalleryFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: GalleryItem | null;
  nextSortOrder?: number;
  onSave: (item: GalleryItem) => void | Promise<void>;
  onDelete?: (id: string) => void | Promise<void>;
};

export function GalleryFormDialog({
  open,
  onOpenChange,
  initial,
  nextSortOrder = 1,
  onSave,
  onDelete,
}: GalleryFormDialogProps) {
  const editing = Boolean(initial);
  const [values, setValues] = useState<GalleryFormValues>(emptyValues);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError("");
    if (initial) setValues(fromItem(initial));
    else setValues({ ...emptyValues(), sortOrder: nextSortOrder });
  }, [open, initial, nextSortOrder]);

  const set = <K extends keyof GalleryFormValues>(key: K, value: GalleryFormValues[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
  };

  const onPickMain = async (file: File | null) => {
    if (!file) return;
    try {
      setBusy(true);
      const { url } = await uploadToCloudinary(file, "gallery");
      set("src", url);
      if (file.type.startsWith("image/")) {
        set("type", "photo");
        if (!values.thumbnailUrl) set("thumbnailUrl", url);
      } else if (file.type.startsWith("video/")) {
        set("type", "video");
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
      const { url } = await uploadToCloudinary(file, "gallery/thumbs");
      set("thumbnailUrl", url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  const preview = values.thumbnailUrl || (values.type === "photo" ? values.src : "");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (values.title.trim().length < 2) {
      setError("Title is required.");
      return;
    }
    if (!values.src.trim()) {
      setError("Upload a file or paste a media URL.");
      return;
    }

    const item: GalleryItem = {
      id: values.id ?? newId("g"),
      type: values.type,
      title: values.title.trim(),
      caption: values.caption.trim(),
      src: values.src.trim(),
      thumbnailUrl: values.thumbnailUrl?.trim() || undefined,
      featured: values.featured,
      sortOrder: Number(values.sortOrder) || 1,
      published: values.published,
    };

    try {
      setBusy(true);
      await onSave(item);
      toast.success(editing ? "Gallery item updated" : "Gallery item created");
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
              {editing ? "Edit gallery item" : "Upload to gallery"}
            </DialogTitle>
            <DialogDescription>
              Photos and videos for the public gallery and home marquee.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={submit} className="space-y-5 px-6 py-5">
          <div>
            <Label className="mb-2 block text-slate-700">Media type</Label>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { id: "photo" as GalleryMediaType, label: "Photo", icon: ImageIcon },
                  { id: "video" as GalleryMediaType, label: "Video", icon: Video },
                ] as const
              ).map((t) => {
                const Icon = t.icon;
                const active = values.type === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => set("type", t.id)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition",
                      active
                        ? "border-[#0061FF] bg-[#E8F0FF] shadow-sm"
                        : "border-slate-200 bg-white hover:border-slate-300",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-xl",
                        active ? "bg-[#0061FF] text-white" : "bg-slate-100 text-slate-500",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="font-semibold text-slate-900">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-dashed border-[#0061FF]/35 bg-[#E8F0FF]/30">
            <div className="relative aspect-[16/9] bg-slate-100/80">
              {preview ? (
                <img src={preview} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
                  <Upload className="h-8 w-8 text-[#0061FF]" />
                  <p className="text-sm font-medium text-slate-700">Drop or choose a file</p>
                  <p className="text-xs text-slate-500">Images work best under 3.5MB locally</p>
                </div>
              )}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200/60 bg-white/70 px-4 py-3">
              <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-[#0061FF]">
                <Upload className="h-4 w-4" />
                Choose file
                <input
                  type="file"
                  accept={values.type === "photo" ? "image/*" : "video/*,image/*"}
                  className="hidden"
                  onChange={(e) => void onPickMain(e.target.files?.[0] ?? null)}
                />
              </label>
              <span className="text-xs text-slate-400">or paste a URL below</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="gal-src">Media URL</Label>
            <Input
              id="gal-src"
              value={values.src}
              onChange={(e) => set("src", e.target.value)}
              placeholder={
                values.type === "photo" ? "https://…/photo.jpg" : "https://…/clip.mp4"
              }
              className="h-11 rounded-xl"
            />
          </div>

          {values.type === "video" && (
            <div className="space-y-2">
              <Label htmlFor="gal-thumb">Thumbnail URL / file</Label>
              <Input
                id="gal-thumb"
                value={values.thumbnailUrl}
                onChange={(e) => set("thumbnailUrl", e.target.value)}
                placeholder="https://…/cover.jpg"
                className="h-11 rounded-xl"
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

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="gal-title">Title</Label>
              <Input
                id="gal-title"
                value={values.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="Outbound war room"
                className="h-11 rounded-xl"
                required
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="gal-caption">Caption</Label>
              <Textarea
                id="gal-caption"
                value={values.caption}
                onChange={(e) => set("caption", e.target.value)}
                placeholder="Short description for the gallery tile"
                className="min-h-24 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gal-order">Sort order</Label>
              <Input
                id="gal-order"
                type="number"
                min={1}
                value={values.sortOrder}
                onChange={(e) => set("sortOrder", Number(e.target.value) || 1)}
                className="h-11 rounded-xl"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3">
              <div>
                <div className="text-sm font-medium text-slate-900">Published</div>
                <div className="text-xs text-slate-500">Visible on public site</div>
              </div>
              <Switch checked={values.published} onCheckedChange={(v) => set("published", v)} />
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3">
              <div>
                <div className="text-sm font-medium text-slate-900">Featured</div>
                <div className="text-xs text-slate-500">Large bento tile</div>
              </div>
              <Switch checked={Boolean(values.featured)} onCheckedChange={(v) => set("featured", v)} />
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
                  toast.success("Gallery item deleted");
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
                {busy ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : editing ? (
                  "Save changes"
                ) : (
                  "Publish to gallery"
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
