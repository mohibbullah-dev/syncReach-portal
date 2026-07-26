import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { FileAudio, FileImage, FileVideo, FolderOpen, Upload } from "lucide-react";
import { toast } from "sonner";

import { GalleryFormDialog } from "@/components/admin/GalleryFormDialog";
import { Button } from "@/components/ui/button";
import type { GalleryItem } from "@/data/gallery";
import type { Review } from "@/data/reviews";
import {
  getCmsGallery,
  getCmsReviews,
  upsertCmsGalleryItem,
} from "@/lib/cms-store";

export const Route = createFileRoute("/media")({
  component: AdminMediaPage,
});

type MediaRow = {
  id: string;
  name: string;
  kind: "image" | "video" | "audio";
  usedIn: string;
  src: string;
};

function AdminMediaPage() {
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [reviewsList, setReviewsList] = useState<Review[]>([]);
  const [open, setOpen] = useState(false);

  const refresh = () => {
    void Promise.all([getCmsGallery(), getCmsReviews()])
      .then(([g, r]) => {
        setGallery(g);
        setReviewsList(r);
      })
      .catch((e) => {
        console.error(e);
        toast.error(e instanceof Error ? e.message : "Failed to load media");
      });
  };

  useEffect(() => {
    refresh();
  }, []);

  const assets: MediaRow[] = useMemo(
    () => [
      ...gallery.map((g) => ({
        id: `g-${g.id}`,
        name: g.title,
        kind: g.type === "video" ? ("video" as const) : ("image" as const),
        usedIn: "Gallery",
        src: g.thumbnailUrl ?? g.src,
      })),
      ...reviewsList
        .filter((r) => Boolean(r.mediaUrl || r.thumbnailUrl))
        .map((r) => ({
          id: `r-${r.id}`,
          name: `${r.name} · ${r.type}`,
          kind:
            r.type === "video"
              ? ("video" as const)
              : ("image" as const),
          usedIn: "Reviews",
          src: (r.thumbnailUrl || r.mediaUrl) as string,
        })),
    ],
    [gallery, reviewsList],
  );

  const nextSortOrder =
    gallery.reduce((max, item) => Math.max(max, item.sortOrder), 0) + 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">Media</h1>
          <p className="mt-1 text-sm text-slate-500">
            Shared library for gallery & review assets. Cloudinary / YouTube wiring comes with the API.
          </p>
        </div>
        <Button
          onClick={() => setOpen(true)}
          className="rounded-[12px] bg-[#0061FF] hover:bg-[#0052D6]"
        >
          <Upload className="mr-1.5 h-4 w-4" /> Upload files
        </Button>
      </div>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-[12px] border border-dashed border-[#0061FF]/40 bg-[#E8F0FF]/40 p-8 text-center transition hover:border-[#0061FF]/70 hover:bg-[#E8F0FF]/70"
      >
        <FolderOpen className="mx-auto h-10 w-10 text-[#0061FF]" />
        <h2 className="mt-3 font-semibold text-slate-900">Drop files here</h2>
        <p className="mt-1 text-sm text-slate-500">
          Opens the gallery upload form: images, video, or paste a URL.
        </p>
        <span className="mt-4 inline-flex rounded-[12px] bg-[#0061FF] px-4 py-2 text-sm font-semibold text-white">
          Browse files
        </span>
      </button>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {assets.map((asset) => {
          const Icon =
            asset.kind === "video" ? FileVideo : asset.kind === "audio" ? FileAudio : FileImage;
          return (
            <div
              key={asset.id}
              className="overflow-hidden rounded-[12px] border border-slate-200/80 bg-white shadow-[0_8px_30px_-18px_rgba(15,23,42,0.18)]"
            >
              <div className="relative aspect-square bg-slate-100">
                <img src={asset.src} alt="" className="h-full w-full object-cover" />
                <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-[12px] bg-white/95 px-2 py-1 text-[10px] font-semibold uppercase text-slate-700">
                  <Icon className="h-3 w-3" />
                  {asset.kind}
                </span>
              </div>
              <div className="p-3">
                <div className="truncate text-sm font-medium text-slate-900">{asset.name}</div>
                <div className="mt-0.5 text-xs text-slate-500">Used in {asset.usedIn}</div>
              </div>
            </div>
          );
        })}
      </div>

      <GalleryFormDialog
        open={open}
        onOpenChange={setOpen}
        nextSortOrder={nextSortOrder}
        onSave={async (item) => {
          setGallery(await upsertCmsGalleryItem(item));
          toast.success("Uploaded to gallery library");
          refresh();
        }}
      />
    </div>
  );
}
