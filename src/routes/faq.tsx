import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { HelpCircle, Plus } from "lucide-react";

import { FaqFormDialog } from "@/components/admin/FaqFormDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { FaqItem } from "@/data/faq";
import { deleteCmsFaqItem, getCmsFaq, upsertCmsFaqItem } from "@/lib/cms-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/faq")({
  component: AdminFaqPage,
});

function AdminFaqPage() {
  const [items, setItems] = useState<FaqItem[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<FaqItem | null>(null);

  useEffect(() => {
    void getCmsFaq()
      .then(setItems)
      .catch((e) => console.error(e));
  }, []);

  const list = useMemo(
    () => [...items].sort((a, b) => a.sortOrder - b.sortOrder),
    [items],
  );

  const nextSortOrder =
    items.reduce((max, item) => Math.max(max, item.sortOrder), 0) + 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">FAQ</h1>
          <p className="mt-1 text-sm text-slate-500">
            Questions and answers on the public FAQ section. Drag order via sort number.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
          className="rounded-[12px] bg-[#0061FF] hover:bg-[#0052D6]"
        >
          <Plus className="mr-1.5 h-4 w-4" /> Add FAQ
        </Button>
      </div>

      {list.length === 0 ? (
        <div className="rounded-[12px] border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
          <HelpCircle className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 text-sm text-slate-500">
            No FAQs yet. Click <strong>Add FAQ</strong> to create one.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((item, index) => (
            <article
              key={item.id}
              className="flex flex-col gap-3 rounded-[12px] border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_-18px_rgba(15,23,42,0.18)] sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-[12px] bg-[#E8F0FF] text-xs font-semibold text-[#0061FF]">
                    {index + 1}
                  </span>
                  <Badge
                    className={cn(
                      "rounded-[12px] text-[10px]",
                      item.published
                        ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-100",
                    )}
                  >
                    {item.published ? "Live" : "Hidden"}
                  </Badge>
                  <span className="text-[11px] text-slate-400">Order {item.sortOrder}</span>
                </div>
                <h3 className="mt-2 text-base font-semibold text-slate-900">{item.question}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-slate-500">{item.answer}</p>
              </div>
              <Button
                variant="outline"
                className="shrink-0 rounded-[12px]"
                onClick={() => {
                  setEditing(item);
                  setOpen(true);
                }}
              >
                Edit
              </Button>
            </article>
          ))}
        </div>
      )}

      <FaqFormDialog
        open={open}
        onOpenChange={setOpen}
        initial={editing}
        nextSortOrder={nextSortOrder}
        onSave={async (item) => setItems(await upsertCmsFaqItem(item))}
        onDelete={async (id) => setItems(await deleteCmsFaqItem(id))}
      />
    </div>
  );
}
