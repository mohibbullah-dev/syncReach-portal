import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
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
import {
  defaultCustomConfig,
  type CustomConfig,
  type CustomLever,
  type CustomLeverKind,
  type PricingPlan,
  type PlanType,
} from "@/data/pricing";
import { newId } from "@/lib/cms-store";

export type PricingFormValues = Omit<PricingPlan, "id" | "features" | "customConfig" | "planType"> & {
  id?: string;
  featuresText: string;
  planType: PlanType;
  customConfig: CustomConfig;
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
  planType: "fixed",
  customConfig: defaultCustomConfig(),
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
    planType: plan.planType === "custom" ? "custom" : "fixed",
    customConfig: plan.customConfig ? { ...defaultCustomConfig(), ...plan.customConfig, levers: plan.customConfig.levers?.length ? plan.customConfig.levers : defaultCustomConfig().levers } : defaultCustomConfig(),
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

  const setConfig = <K extends keyof CustomConfig>(key: K, value: CustomConfig[K]) => {
    setValues((v) => ({ ...v, customConfig: { ...v.customConfig, [key]: value } }));
  };

  const updateLever = (index: number, patch: Partial<CustomLever>) => {
    setValues((v) => {
      const levers = v.customConfig.levers.map((l, i) => (i === index ? { ...l, ...patch } : l));
      return { ...v, customConfig: { ...v.customConfig, levers } };
    });
  };

  const addLever = () => {
    const id = `lever_${Date.now().toString(36)}`;
    setValues((v) => ({
      ...v,
      customConfig: {
        ...v.customConfig,
        levers: [
          ...v.customConfig.levers,
          { id, label: "New option", kind: "stepper", min: 1, max: 10, step: 1, unitPrice: 50 },
        ],
        defaults: { ...v.customConfig.defaults, [id]: 1 },
      },
    }));
  };

  const removeLever = (index: number) => {
    setValues((v) => {
      const lever = v.customConfig.levers[index];
      const levers = v.customConfig.levers.filter((_, i) => i !== index);
      const defaults = { ...v.customConfig.defaults };
      if (lever) delete defaults[lever.id];
      return { ...v, customConfig: { ...v.customConfig, levers, defaults } };
    });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (values.name.trim().length < 2) {
      setError("Plan name is required.");
      return;
    }
    if (values.planType === "fixed" && !values.price.trim()) {
      setError("Price is required for fixed plans.");
      return;
    }
    if (!values.cta.trim()) {
      setError("CTA button text is required.");
      return;
    }
    if (values.planType === "custom" && values.customConfig.levers.length === 0) {
      setError("Add at least one custom pricing lever.");
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
      price: values.planType === "custom" ? values.price.trim() || "Custom" : values.price.trim(),
      unit: values.unit.trim() || "/ month",
      extrasBadge: values.extrasBadge.trim(),
      extrasNote: values.extrasNote.trim(),
      features,
      cta: values.cta.trim(),
      featured: values.featured,
      sortOrder: Number(values.sortOrder) || 1,
      published: values.published,
      planType: values.planType,
      customConfig: values.planType === "custom" ? values.customConfig : null,
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

  const isCustom = values.planType === "custom";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto rounded-[12px] border-slate-200 p-0 sm:max-w-lg">
        <div className="border-b border-slate-100 bg-gradient-to-br from-[#E8F0FF] via-white to-white px-6 py-5">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-slate-900">
              {editing ? "Edit plan" : "Add pricing plan"}
            </DialogTitle>
            <DialogDescription>
              Fixed plans show a set price. Custom plans let visitors build a live quote.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={submit} className="space-y-4 px-6 py-5">
          <div className="flex items-center justify-between rounded-[12px] border border-slate-200 px-4 py-3">
            <div>
              <div className="text-sm font-medium text-slate-900">Custom quote builder</div>
              <div className="text-xs text-slate-500">Replace fixed price with interactive levers</div>
            </div>
            <Switch
              checked={isCustom}
              onCheckedChange={(v) => {
                set("planType", v ? "custom" : "fixed");
                if (v && !values.badge) set("badge", "CUSTOM");
                if (v && !values.cta) set("cta", "Get this quote");
              }}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="plan-name">Plan name</Label>
              <Input
                id="plan-name"
                value={values.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder={isCustom ? "Custom" : "Growth"}
                className="h-11 rounded-[12px]"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plan-badge">Badge</Label>
              <Input
                id="plan-badge"
                value={values.badge}
                onChange={(e) => set("badge", e.target.value)}
                placeholder={isCustom ? "CUSTOM" : "MOST POPULAR"}
                className="h-11 rounded-[12px]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="plan-desc">Description</Label>
            <Textarea
              id="plan-desc"
              value={values.desc}
              onChange={(e) => set("desc", e.target.value)}
              placeholder="Build your own outbound stack…"
              className="min-h-[72px] rounded-[12px]"
            />
          </div>

          {!isCustom ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="plan-price">Price</Label>
                  <Input
                    id="plan-price"
                    value={values.price}
                    onChange={(e) => set("price", e.target.value)}
                    placeholder="$1,000"
                    className="h-11 rounded-[12px]"
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
                    className="h-11 rounded-[12px]"
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
                    className="h-11 rounded-[12px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plan-cta">CTA button</Label>
                  <Input
                    id="plan-cta"
                    value={values.cta}
                    onChange={(e) => set("cta", e.target.value)}
                    placeholder="Choose Growth"
                    className="h-11 rounded-[12px]"
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
                  className="h-11 rounded-[12px]"
                />
              </div>
            </>
          ) : (
            <div className="space-y-4 rounded-[12px] border border-slate-200 bg-slate-50/60 p-4">
              <div className="text-sm font-semibold text-slate-900">Quote calculator</div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Base price</Label>
                  <Input
                    type="number"
                    min={0}
                    value={values.customConfig.basePrice}
                    onChange={(e) => setConfig("basePrice", Number(e.target.value) || 0)}
                    className="h-11 rounded-[12px] bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Round to</Label>
                  <Input
                    type="number"
                    min={1}
                    value={values.customConfig.roundTo}
                    onChange={(e) => setConfig("roundTo", Number(e.target.value) || 50)}
                    className="h-11 rounded-[12px] bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Currency prefix</Label>
                  <Input
                    value={values.customConfig.currencyPrefix}
                    onChange={(e) => setConfig("currencyPrefix", e.target.value)}
                    className="h-11 rounded-[12px] bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Unit label</Label>
                  <Input
                    value={values.customConfig.unitLabel}
                    onChange={(e) => setConfig("unitLabel", e.target.value)}
                    className="h-11 rounded-[12px] bg-white"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Estimate note</Label>
                <Input
                  value={values.customConfig.estimateNote}
                  onChange={(e) => setConfig("estimateNote", e.target.value)}
                  className="h-11 rounded-[12px] bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label>CTA button</Label>
                <Input
                  value={values.cta}
                  onChange={(e) => set("cta", e.target.value)}
                  placeholder="Get this quote"
                  className="h-11 rounded-[12px] bg-white"
                  required
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Levers</Label>
                  <Button type="button" variant="outline" size="sm" className="rounded-[12px]" onClick={addLever}>
                    <Plus className="mr-1 h-3.5 w-3.5" /> Add
                  </Button>
                </div>
                {values.customConfig.levers.map((lever, index) => (
                  <div key={lever.id} className="space-y-2 rounded-[12px] border border-slate-200 bg-white p-3">
                    <div className="flex items-center justify-between gap-2">
                      <Input
                        value={lever.label}
                        onChange={(e) => updateLever(index, { label: e.target.value })}
                        className="h-9 rounded-[12px]"
                        placeholder="Label"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="shrink-0 text-red-600"
                        onClick={() => removeLever(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      <select
                        value={lever.kind}
                        onChange={(e) => updateLever(index, { kind: e.target.value as CustomLeverKind })}
                        className="h-9 rounded-[12px] border border-input bg-background px-2 text-sm"
                      >
                        <option value="slider">Slider</option>
                        <option value="stepper">Stepper</option>
                        <option value="toggle">Toggle</option>
                      </select>
                      <Input
                        type="number"
                        value={lever.unitPrice}
                        onChange={(e) => updateLever(index, { unitPrice: Number(e.target.value) || 0 })}
                        className="h-9 rounded-[12px]"
                        placeholder="Unit $"
                        title="Unit price"
                      />
                      {lever.kind !== "toggle" ? (
                        <>
                          <Input
                            type="number"
                            value={lever.min}
                            onChange={(e) => updateLever(index, { min: Number(e.target.value) || 0 })}
                            className="h-9 rounded-[12px]"
                            placeholder="Min"
                          />
                          <Input
                            type="number"
                            value={lever.max}
                            onChange={(e) => updateLever(index, { max: Number(e.target.value) || 0 })}
                            className="h-9 rounded-[12px]"
                            placeholder="Max"
                          />
                          <Input
                            type="number"
                            value={lever.step}
                            onChange={(e) => updateLever(index, { step: Number(e.target.value) || 1 })}
                            className="h-9 rounded-[12px]"
                            placeholder="Step"
                          />
                          <Input
                            type="number"
                            value={Number(values.customConfig.defaults[lever.id] ?? lever.min)}
                            onChange={(e) =>
                              setConfig("defaults", {
                                ...values.customConfig.defaults,
                                [lever.id]: Number(e.target.value) || 0,
                              })
                            }
                            className="h-9 rounded-[12px]"
                            placeholder="Default"
                          />
                        </>
                      ) : (
                        <div className="col-span-2 flex items-center gap-2 text-sm text-slate-600 sm:col-span-1">
                          <Switch
                            checked={Boolean(values.customConfig.defaults[lever.id])}
                            onCheckedChange={(checked) =>
                              setConfig("defaults", {
                                ...values.customConfig.defaults,
                                [lever.id]: checked,
                              })
                            }
                          />
                          Default on
                        </div>
                      )}
                    </div>
                    <Input
                      value={lever.id}
                      onChange={(e) => updateLever(index, { id: e.target.value.replace(/\s+/g, "_") })}
                      className="h-8 rounded-[12px] font-mono text-xs"
                      placeholder="id"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="plan-features">Features (one per line)</Label>
            <Textarea
              id="plan-features"
              value={values.featuresText}
              onChange={(e) => set("featuresText", e.target.value)}
              placeholder={"Flexible email volume\nWarmed inboxes on demand"}
              className="min-h-[120px] rounded-[12px] font-mono text-sm"
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
                className="h-11 rounded-[12px]"
              />
            </div>
            <div className="flex items-center justify-between rounded-[12px] border border-slate-200 px-4 py-3">
              <div>
                <div className="text-sm font-medium text-slate-900">Featured</div>
                <div className="text-xs text-slate-500">Blue “most popular” card</div>
              </div>
              <Switch checked={values.featured} onCheckedChange={(v) => set("featured", v)} />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-[12px] border border-slate-200 px-4 py-3">
            <div>
              <div className="text-sm font-medium text-slate-900">Published</div>
              <div className="text-xs text-slate-500">Show on public site</div>
            </div>
            <Switch checked={values.published} onCheckedChange={(v) => set("published", v)} />
          </div>

          {error && (
            <div className="rounded-[12px] border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
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
              <Button type="button" variant="outline" className="rounded-[12px]" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={busy}
                className="rounded-[12px] bg-[#0061FF] hover:bg-[#0052D6]"
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
