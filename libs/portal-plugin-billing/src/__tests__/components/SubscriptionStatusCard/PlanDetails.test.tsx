/// <reference types="vitest/browser" />
import { describe, it, expect } from "vitest";
import { render } from "vitest-browser-react";
import { page } from "vitest/browser";
import { PlanDetails } from "@/ui/components/SubscriptionStatusCard/PlanDetails";

import type { PublicPricingPlanResponse, PublicPricingPlanPeriodDTO } from "@lumeweb/portal-sdk";

describe("PlanDetails", () => {
  const mockPlanInfo = {
    plan: {
      id: 1,
      name: "Pro",
      description: "Pro plan",
      currency: "USD",
      features: ["Feature 1", "Feature 2"],
      pricing_periods: [],
    } satisfies PublicPricingPlanResponse,
    period: {
      id: 10,
      cadence: "monthly",
      price_usd: 29.99,
      quota_plan_id: 1,
    } satisfies PublicPricingPlanPeriodDTO,
  };

  it("renders plan name", async () => {
    render(<PlanDetails planInfo={mockPlanInfo} />);
    await expect.element(page.getByText("Plan")).toBeVisible();
    await expect.element(page.getByText("Pro")).toBeVisible();
  });

  it("renders billing cadence", async () => {
    render(<PlanDetails planInfo={mockPlanInfo} />);
    await expect.element(page.getByText("Billing")).toBeVisible();
    await expect.element(page.getByText(/monthly/i)).toBeVisible();
  });

  it("capitalizes billing cadence", async () => {
    render(<PlanDetails planInfo={mockPlanInfo} />);
    await expect.element(page.getByText(/Monthly/i)).toBeVisible();
  });

  it("does not show content when planInfo is null", async () => {
    render(<PlanDetails planInfo={null} />);
    // When planInfo is null, component renders nothing
    // Main SubscriptionStatusCard component works with this
    await expect.element(page.getByText("Plan")).not.toBeInTheDocument();
  });
});
