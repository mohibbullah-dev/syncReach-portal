/** Shared pricing / custom quote types + calculator (portal) */

export type PlanType = "fixed" | "custom";

export type CustomLeverKind = "slider" | "stepper" | "toggle";

export type CustomLever = {
  id: string;
  label: string;
  kind: CustomLeverKind;
  min: number;
  max: number;
  step: number;
  unitPrice: number;
};

export type CustomConfig = {
  basePrice: number;
  currencyPrefix: string;
  unitLabel: string;
  roundTo: number;
  estimateNote: string;
  defaults: Record<string, number | boolean>;
  levers: CustomLever[];
};

export type PricingPlan = {
  id: string;
  badge: string;
  name: string;
  desc: string;
  price: string;
  unit: string;
  extrasBadge: string;
  extrasNote: string;
  features: string[];
  cta: string;
  featured: boolean;
  sortOrder: number;
  published: boolean;
  planType?: PlanType;
  customConfig?: CustomConfig | null;
};

export function defaultCustomConfig(): CustomConfig {
  return {
    basePrice: 1500,
    currencyPrefix: "$",
    unitLabel: "/ month",
    roundTo: 50,
    estimateNote: "Estimated monthly · final quote confirmed by team",
    defaults: { emails: 50000, inboxes: 10, seats: 3, linkedin: false },
    levers: [
      {
        id: "emails",
        label: "Emails / month",
        kind: "slider",
        min: 25000,
        max: 200000,
        step: 25000,
        unitPrice: 0.008,
      },
      {
        id: "inboxes",
        label: "Warmed inboxes",
        kind: "stepper",
        min: 5,
        max: 50,
        step: 1,
        unitPrice: 40,
      },
      {
        id: "seats",
        label: "Seats",
        kind: "stepper",
        min: 1,
        max: 20,
        step: 1,
        unitPrice: 75,
      },
      {
        id: "linkedin",
        label: "LinkedIn outreach",
        kind: "toggle",
        min: 0,
        max: 1,
        step: 1,
        unitPrice: 300,
      },
    ],
  };
}
