import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Image as ImageIcon, Plus, Search, Video } from "lucide-react";

import { GalleryFormDialog } from "@/components/admin/GalleryFormDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { GalleryItem, GalleryMediaType } from "@/data/gallery";
import {
  deleteCmsGalleryItem,
  getCmsGallery,
  upsertCmsGalleryItem,
} from "@/lib/cms-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/gallery")({
  component: AdminGalleryPage,
});

const filters: Array<{ id: "all" | GalleryMediaType | "draft"; label: string }> = [
  { id: "all", label: "All" },
  { id: "photo", label: "Photos" },
  { id: "video", label: "Videos" },
  { id: "draft", label: "Drafts" },
];

function AdminGalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [filter, setFilter] = useState<"all" | GalleryMediaType | "draft">("all");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<GalleryItem | null>(null);

  useEffect(() => {
    void getCmsGallery()
      .then(setItems)
      .catch((e) => console.error(e));
  }, []);

  const list = useMemo(() => {
    return items
      .filter((item) => {
        if (filter === "draft") return !item.published;
        if (filter === "photo" || filter === "video") return item.type === filter;
        return true;
      })
      .filter((item) => {
        const query = q.trim().toLowerCase();
        if (!query) return true;
        return (
          item.title.toLowerCase().includes(query) ||
          item.caption.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [items, filter, q]);

  const nextSortOrder =
    items.reduce((max, item) => Math.max(max, item.sortOrder), 0) + 1;

  const openCreate = () => {
    setEditing(null);
    setOpen(true);
  };

  const openEdit = (item: GalleryItem) => {
    setEditing(item);
    setOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">Gallery</h1>
          <p className="mt-1 text-sm text-slate-500">
            Publish photos and videos to the public gallery & home marquee.
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="rounded-[12px] bg-[#0061FF] hover:bg-[#0052D6]"
        >
          <Plus className="mr-1.5 h-4 w-4" /> Upload media
        </Button>
      </div>

      <div className="flex flex-col gap-3 rounded-[12px] border border-slate-200/80 bg-white p-4 shadow-[0_8px_30px_-18px_rgba(15,23,42,0.18)] sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search gallery…"
            className="h-10 rounded-[12px] border-slate-200 bg-slate-50 pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={cn(
                "rounded-[12px] px-3.5 py-1.5 text-sm font-medium transition",
                filter === f.id
                  ? "bg-[#0061FF] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <div className="rounded-[12px] border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
          <p className="text-sm text-slate-500">
            No gallery items yet. Click <strong>Upload media</strong> to add one.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((item) => (
            <article
              key={item.id}
              className="overflow-hidden rounded-[12px] border border-slate-200/80 bg-white shadow-[0_8px_30px_-18px_rgba(15,23,42,0.18)]"
            >
              <div className="relative aspect-[16/10] bg-slate-100">
                <img
                  src={item.thumbnailUrl ?? item.src}
                  alt={item.title}
                  className="h-full w-full object-cover"
                />
                <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-[12px] bg-white/95 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-700 shadow-sm">
                  {item.type === "video" ? (
                    <Video className="h-3 w-3" />
                  ) : (
                    <ImageIcon className="h-3 w-3" />
                  )}
                  {item.type}
                </span>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-slate-900">{item.title}</h3>
                  <Badge
                    className={cn(
                      "shrink-0 rounded-[12px]",
                      item.published
                        ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-100",
                    )}
                  >
                    {item.published ? "Published" : "Draft"}
                  </Badge>
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-slate-500">{item.caption}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Order #{item.sortOrder}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[#0061FF]"
                    onClick={() => openEdit(item)}
                  >
                    Edit
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <GalleryFormDialog
        open={open}
        onOpenChange={setOpen}
        initial={editing}
        nextSortOrder={nextSortOrder}
        onSave={async (item) => setItems(await upsertCmsGalleryItem(item))}
        onDelete={async (id) => setItems(await deleteCmsGalleryItem(id))}
      />
    </div>
  );
}
