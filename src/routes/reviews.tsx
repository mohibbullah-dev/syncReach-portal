import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Mic, Plus, Search, Star, Type, Video } from "lucide-react";

import { ReviewFormDialog } from "@/components/admin/ReviewFormDialog";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Review, ReviewType } from "@/data/reviews";
import {
  deleteCmsReview,
  getCmsReviews,
  upsertCmsReview,
} from "@/lib/cms-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/reviews")({
  component: AdminReviewsPage,
});

const filters: Array<{ id: "all" | ReviewType; label: string }> = [
  { id: "all", label: "All" },
  { id: "text", label: "Text" },
  { id: "audio", label: "Audio" },
  { id: "video", label: "Video" },
];

function TypeIcon({ type }: { type: ReviewType }) {
  if (type === "audio") return <Mic className="h-3.5 w-3.5" />;
  if (type === "video") return <Video className="h-3.5 w-3.5" />;
  return <Type className="h-3.5 w-3.5" />;
}

function AdminReviewsPage() {
  const [items, setItems] = useState<Review[]>([]);
  const [filter, setFilter] = useState<"all" | ReviewType>("all");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Review | null>(null);

  useEffect(() => {
    void getCmsReviews()
      .then(setItems)
      .catch((e) => console.error(e));
  }, []);

  const list = useMemo(() => {
    return items.filter((r) => {
      const matchType = filter === "all" || r.type === filter;
      const query = q.trim().toLowerCase();
      const matchQ =
        !query ||
        r.name.toLowerCase().includes(query) ||
        r.body.toLowerCase().includes(query) ||
        r.role.toLowerCase().includes(query);
      return matchType && matchQ;
    });
  }, [items, filter, q]);

  const openCreate = () => {
    setEditing(null);
    setOpen(true);
  };

  const openEdit = (review: Review) => {
    setEditing(review);
    setOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">Reviews</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage text, audio, and video testimonials for the public site.
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="rounded-xl bg-[#0061FF] hover:bg-[#0052D6]"
        >
          <Plus className="mr-1.5 h-4 w-4" /> Add review
        </Button>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_8px_30px_-18px_rgba(15,23,42,0.18)] sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search reviews…"
            className="h-10 rounded-xl border-slate-200 bg-slate-50 pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-sm font-medium transition",
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

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_30px_-18px_rgba(15,23,42,0.18)]">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
              <TableHead className="pl-5">Customer</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Quote</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="pr-5 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-sm text-slate-500">
                  No reviews yet. Click <strong>Add review</strong> to create one.
                </TableCell>
              </TableRow>
            ) : (
              list.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="pl-5">
                    <div className="flex items-center gap-3">
                      <ProfileAvatar name={r.name} src={r.avatar} className="h-9 w-9" />
                      <div>
                        <div className="font-medium text-slate-900">{r.name}</div>
                        <div className="text-xs text-slate-500">{r.role}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium capitalize text-slate-600">
                      <TypeIcon type={r.type} />
                      {r.type}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-[280px]">
                    <p className="truncate text-sm text-slate-600">{r.body}</p>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-amber-500">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      {r.rating}
                    </span>
                  </TableCell>
                  <TableCell>
                    {r.featured ? (
                      <Badge className="rounded-md bg-[#E8F0FF] text-[#0061FF] hover:bg-[#E8F0FF]">
                        Featured
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="rounded-md">
                        Listed
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="pr-5 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[#0061FF]"
                      onClick={() => openEdit(r)}
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ReviewFormDialog
        open={open}
        onOpenChange={setOpen}
        initial={editing}
        onSave={async (review) => setItems(await upsertCmsReview(review))}
        onDelete={async (id) => setItems(await deleteCmsReview(id))}
      />
    </div>
  );
}
