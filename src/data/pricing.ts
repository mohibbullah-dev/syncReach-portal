/** CMS pricing plans shown on the public Pricing section. */

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
};
