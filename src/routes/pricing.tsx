import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Star } from "lucide-react";

import { PricingFormDialog } from "@/components/admin/PricingFormDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { PricingPlan } from "@/data/pricing";
import {
  deleteCmsPricingPlan,
  getCmsPricing,
  upsertCmsPricingPlan,
} from "@/lib/cms-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pricing")({
  component: AdminPricingPage,
});

function AdminPricingPage() {
  const [items, setItems] = useState<PricingPlan[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PricingPlan | null>(null);

  useEffect(() => {
    void getCmsPricing()
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
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
            Pricing
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Packages on the public Pricing section. Fixed plans or a Custom quote builder.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
          className="rounded-[12px] bg-[#0061FF] hover:bg-[#0052D6]"
        >
          <Plus className="mr-1.5 h-4 w-4" /> Add plan
        </Button>
      </div>

      {list.length === 0 ? (
        <div className="rounded-[12px] border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
          <p className="text-sm text-slate-500">
            No plans yet. Click <strong>Add plan</strong> or run backend{" "}
            <code className="rounded bg-slate-100 px-1">npm run seed</code>.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {list.map((p) => (
            <article
              key={p.id}
              className={cn(
                "group relative flex flex-col overflow-hidden rounded-[12px] border bg-gradient-to-b from-white to-slate-50/40 p-6 transition duration-300 hover:-translate-y-0.5",
                "shadow-[0_12px_40px_-24px_rgba(15,23,42,0.28)] hover:shadow-[0_18px_44px_-22px_rgba(15,23,42,0.32)]",
                p.featured ? "border-[#0061FF] ring-4 ring-[#0061FF]/10" : "border-slate-200/80",
              )}
            >
              {p.featured ? (
                <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#E8F0FF] to-transparent" />
              ) : null}
              <div className="relative flex flex-wrap items-center gap-2">
                <Badge
                  className={cn(
                    "rounded-[12px] px-2.5 text-[10px]",
                    p.featured
                      ? "bg-[#0061FF] text-white hover:bg-[#0061FF]"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-100",
                  )}
                >
                  {p.badge}
                </Badge>
                {p.planType === "custom" ? (
                  <Badge className="rounded-[12px] bg-violet-50 text-[10px] text-violet-700 hover:bg-violet-50">
                    Quote builder
                  </Badge>
                ) : null}
                {p.featured && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#0061FF]">
                    <Star className="h-3 w-3 fill-current" /> Featured
                  </span>
                )}
                <Badge
                  className={cn(
                    "ml-auto rounded-[12px] text-[10px]",
                    p.published
                      ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-100",
                  )}
                >
                  {p.published ? "Live" : "Hidden"}
                </Badge>
              </div>
              <h3 className="relative mt-4 text-xl font-semibold text-slate-900">{p.name}</h3>
              <p className="relative mt-1 line-clamp-2 text-sm text-slate-500">{p.desc}</p>
              <div className="relative mt-5 flex items-end gap-1">
                <span className="text-3xl font-bold tracking-tight text-slate-900">
                  {p.planType === "custom" ? "Custom" : p.price}
                </span>
                <span className="mb-1 text-sm text-slate-500">{p.unit}</span>
              </div>
              {p.planType === "custom" ? (
                <p className="relative mt-3 text-xs font-medium text-slate-500">
                  {p.customConfig?.levers?.length ?? 0} levers · live estimate
                </p>
              ) : p.extrasBadge ? (
                <p className="relative mt-3 inline-flex w-fit rounded-[12px] bg-[#E8F0FF] px-2.5 py-1 text-xs font-semibold text-[#0061FF]">
                  {p.extrasBadge}
                </p>
              ) : null}
              <ul className="relative mt-5 space-y-2 border-t border-slate-100 pt-4 text-sm text-slate-600">
                {p.features.slice(0, 4).map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-[12px] bg-[#0061FF]" />
                    <span className="truncate">{f}</span>
                  </li>
                ))}
                {p.features.length > 4 && (
                  <li className="pl-3.5 text-xs text-slate-400">
                    +{p.features.length - 4} more
                  </li>
                )}
              </ul>
              <Button
                variant="outline"
                className="relative mt-5 w-full rounded-[12px] border-slate-200 group-hover:border-[#0061FF]/40 group-hover:bg-[#F4F8FF]"
                onClick={() => {
                  setEditing(p);
                  setOpen(true);
                }}
              >
                Edit plan
              </Button>
            </article>
          ))}
        </div>
      )}

      <PricingFormDialog
        open={open}
        onOpenChange={setOpen}
        initial={editing}
        nextSortOrder={nextSortOrder}
        onSave={async (plan) => setItems(await upsertCmsPricingPlan(plan))}
        onDelete={async (id) => setItems(await deleteCmsPricingPlan(id))}
      />
    </div>
  );
}
