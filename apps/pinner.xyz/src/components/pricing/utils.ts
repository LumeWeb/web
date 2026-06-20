import type { BillingPlan } from "@/lib/api";
import { config } from "@/lib/config";

export enum Cadence {
  Monthly = "monthly",
  Yearly = "yearly",
}

export function getPlansApiUrl(): string {
  return `${config.portalApiUrl}/api/billing/plans`;
}

export const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function isCustomPlan(plan: BillingPlan): boolean {
  return plan.pricing_periods.every((p) => p.price_usd === 0);
}

export function getPriceDisplay(plan: BillingPlan, cadence: Cadence) {
  if (isCustomPlan(plan)) {
    return { price: "$10", sub: "/TB" };
  }
  const period = plan.pricing_periods.find((p) => p.cadence === cadence);
  if (!period) {
    const fallback = plan.pricing_periods[0];
    if (!fallback) return { price: "Custom", sub: "" };
    return { price: `$${fallback.price_usd}`, sub: `/${fallback.cadence}` };
  }
  if (cadence === Cadence.Yearly) {
    const perMonth = period.price_usd / 12;
    return {
      price: perMonth % 1 === 0 ? `$${perMonth}` : `$${perMonth.toFixed(2)}`,
      sub: "/mo, billed annually",
    };
  }
  return {
    price:
      period.price_usd % 1 === 0
        ? `$${period.price_usd}`
        : `$${period.price_usd.toFixed(2)}`,
    sub: "/month",
  };
}

export function getCTA(plan: BillingPlan): { label: string; url: string } {
  if (isCustomPlan(plan)) {
    return { label: "Contact Us →", url: "/contact" };
  }
  return { label: "Start Pinning →", url: config.registerUrl("pinning") };
}

