import type { Cadence } from "@/components/pricing/utils";

export interface PricingPeriod {
  id: number;
  cadence: Cadence;
  price_usd: number;
  quota_plan_id: number;
}

export interface BillingPlan {
  id: number;
  name: string;
  description: string;
  currency: string;
  price_usd: number;
  features: string[] | null;
  pricing_periods: PricingPeriod[];
}

export interface BillingPlansResponse {
  data: BillingPlan[];
  total: number;
}
