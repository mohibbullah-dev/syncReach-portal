import { useEffect, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
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
import type { PricingPlan } from "@/data/pricing";
import { newId } from "@/lib/cms-store";

export type PricingFormValues = Omit<PricingPlan, "id" | "features"> & {
  id?: string;
  featuresText: string;
};

const emptyValues = (): PricingFormValues => ({
  badge: "",
  name: "",
  desc: "",
  price: "",
  unit: "/ month",
  extrasBadge: "",
  extrasNote: "",
  featuresText: "",
  cta: "",
  featured: false,
  sortOrder: 1,
  published: true,
});

function fromPlan(plan: PricingPlan): PricingFormValues {
  return {
    id: plan.id,
    badge: plan.badge,
    name: plan.name,
    desc: plan.desc,
    price: plan.price,
    unit: plan.unit,
    extrasBadge: plan.extrasBadge,
    extrasNote: plan.extrasNote,
    featuresText: plan.features.join("\n"),
    cta: plan.cta,
    featured: plan.featured,
    sortOrder: plan.sortOrder,
    published: plan.published,
  };
}

type PricingFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: PricingPlan | null;
  nextSortOrder?: number;
  onSave: (plan: PricingPlan) => void | Promise<void>;
  onDelete?: (id: string) => void | Promise<void>;
};

export function PricingFormDialog({
  open,
  onOpenChange,
  initial,
  nextSortOrder = 1,
  onSave,
  onDelete,
}: PricingFormDialogProps) {
  const editing = Boolean(initial);
  const [values, setValues] = useState<PricingFormValues>(emptyValues);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError("");
    if (initial) setValues(fromPlan(initial));
    else setValues({ ...emptyValues(), sortOrder: nextSortOrder });
  }, [open, initial, nextSortOrder]);

  const set = <K extends keyof PricingFormValues>(key: K, value: PricingFormValues[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (values.name.trim().length < 2) {
      setError("Plan name is required.");
      return;
    }
    if (!values.price.trim()) {
      setError("Price is required.");
      return;
    }
    if (!values.cta.trim()) {
      setError("CTA button text is required.");
      return;
    }

    const features = values.featuresText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const plan: PricingPlan = {
      id: values.id ?? newId("p"),
      badge: values.badge.trim() || values.name.trim().toUpperCase(),
      name: values.name.trim(),
      desc: values.desc.trim(),
      price: values.price.trim(),
      unit: values.unit.trim() || "/ month",
      extrasBadge: values.extrasBadge.trim(),
      extrasNote: values.extrasNote.trim(),
      features,
      cta: values.cta.trim(),
      featured: values.featured,
      sortOrder: Number(values.sortOrder) || 1,
      published: values.published,
    };

    try {
      setBusy(true);
      await onSave(plan);
      toast.success(editing ? "Plan updated" : "Plan added");
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto rounded-2xl border-slate-200 p-0 sm:max-w-lg">
        <div className="border-b border-slate-100 bg-gradient-to-br from-[#E8F0FF] via-white to-white px-6 py-5">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-slate-900">
              {editing ? "Edit plan" : "Add pricing plan"}
            </DialogTitle>
            <DialogDescription>
              Plans shown on the public Pricing section of the marketing site.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={submit} className="space-y-4 px-6 py-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="plan-name">Plan name</Label>
              <Input
                id="plan-name"
                value={values.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Growth"
                className="h-11 rounded-xl"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plan-badge">Badge</Label>
              <Input
                id="plan-badge"
                value={values.badge}
                onChange={(e) => set("badge", e.target.value)}
                placeholder="MOST POPULAR"
                className="h-11 rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="plan-desc">Description</Label>
            <Textarea
              id="plan-desc"
              value={values.desc}
              onChange={(e) => set("desc", e.target.value)}
              placeholder="For growing teams booking qualified meetings every week."
              className="min-h-[72px] rounded-xl"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="plan-price">Price</Label>
              <Input
                id="plan-price"
                value={values.price}
                onChange={(e) => set("price", e.target.value)}
                placeholder="$1,000"
                className="h-11 rounded-xl"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plan-unit">Unit</Label>
              <Input
                id="plan-unit"
                value={values.unit}
                onChange={(e) => set("unit", e.target.value)}
                placeholder="/ month"
                className="h-11 rounded-xl"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="plan-extras-badge">Highlight badge</Label>
              <Input
                id="plan-extras-badge"
                value={values.extrasBadge}
                onChange={(e) => set("extrasBadge", e.target.value)}
                placeholder="Unlimited warmed inboxes"
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plan-cta">CTA button</Label>
              <Input
                id="plan-cta"
                value={values.cta}
                onChange={(e) => set("cta", e.target.value)}
                placeholder="Choose Growth"
                className="h-11 rounded-xl"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="plan-extras-note">Note under highlight</Label>
            <Input
              id="plan-extras-note"
              value={values.extrasNote}
              onChange={(e) => set("extrasNote", e.target.value)}
              placeholder="Best value for scaling outbound teams"
              className="h-11 rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="plan-features">Features (one per line)</Label>
            <Textarea
              id="plan-features"
              value={values.featuresText}
              onChange={(e) => set("featuresText", e.target.value)}
              placeholder={"25,000 emails / mo\nUnlimited warmed inboxes\nPriority support"}
              className="min-h-[140px] rounded-xl font-mono text-sm"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="plan-order">Sort order</Label>
              <Input
                id="plan-order"
                type="number"
                min={1}
                value={values.sortOrder}
                onChange={(e) => set("sortOrder", Number(e.target.value) || 1)}
                className="h-11 rounded-xl"
              />
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3">
              <div>
                <div className="text-sm font-medium text-slate-900">Featured</div>
                <div className="text-xs text-slate-500">Blue “most popular” card</div>
              </div>
              <Switch checked={values.featured} onCheckedChange={(v) => set("featured", v)} />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3">
            <div>
              <div className="text-sm font-medium text-slate-900">Published</div>
              <div className="text-xs text-slate-500">Show on public site</div>
            </div>
            <Switch checked={values.published} onCheckedChange={(v) => set("published", v)} />
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
                  void onDelete(values.id!);
                  toast.success("Plan removed");
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
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : editing ? "Save plan" : "Add plan"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
