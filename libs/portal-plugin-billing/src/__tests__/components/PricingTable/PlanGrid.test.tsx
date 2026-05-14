/// <reference types="vitest/browser" />
import { render } from "vitest-browser-react";
import { describe, expect, it, vi } from "vitest";

import type { PublicPricingPlanResponse } from "@/types/subscription";
import { PlanGrid } from "@/ui/components/PricingTable/PlanGrid";

vi.mock("@/ui/components/PricingTable/PlanCard", () => ({
  PlanCard: ({ plan, isCurrentPlan }: { plan: { name: string }; isCurrentPlan?: boolean }) => (
    <div data-current={String(isCurrentPlan)} data-testid="plan-card">
      {plan.name}
    </div>
  ),
}));

describe("PlanGrid", () => {
  const mockPlans: PublicPricingPlanResponse[] = [
    {
      id: 1,
      name: "Basic",
      description: "Basic plan",
      currency: "USD",
      pricing_periods: [
        { id: 101, cadence: "monthly", price_usd: 10, quota_plan_id: 1, rolling_days: 30 },
        { id: 102, cadence: "yearly", price_usd: 100, quota_plan_id: 1, rolling_days: 365 },
      ],
    },
    {
      id: 2,
      name: "Pro",
      description: "Pro plan",
      currency: "USD",
      pricing_periods: [
        { id: 201, cadence: "monthly", price_usd: 29, quota_plan_id: 2, rolling_days: 30 },
        { id: 202, cadence: "yearly", price_usd: 290, quota_plan_id: 2, rolling_days: 365 },
      ],
    },
  ];

  it("renders plan cards for matching cadence", async () => {
    const screen = await render(
      <PlanGrid
        cadence="monthly"
        onSubscribe={vi.fn()}
        plans={mockPlans}
      />,
    );

    await expect.element(screen.getByText("Basic")).toBeInTheDocument();
    await expect.element(screen.getByText("Pro")).toBeInTheDocument();
  });

  it("passes isCurrentPlan when period id matches currentPeriodId", async () => {
    const screen = await render(
      <PlanGrid
        cadence="monthly"
        currentPeriodId={101}
        onSubscribe={vi.fn()}
        plans={mockPlans}
      />,
    );

    const planCards = screen.container.querySelectorAll('[data-testid="plan-card"]');
    expect(planCards[0].getAttribute("data-current")).toBe("true");
    expect(planCards[1].getAttribute("data-current")).toBe("false");
  });

  it("does not render plan if no period matches cadence", async () => {
    const plansWithNoMatch: PublicPricingPlanResponse[] = [
      {
        id: 3,
        name: "Enterprise",
        description: "Enterprise plan",
        currency: "USD",
        pricing_periods: [
          { id: 301, cadence: "quarterly", price_usd: 500, quota_plan_id: 3, rolling_days: 90 },
        ],
      },
    ];

    const screen = await render(
      <PlanGrid
        cadence="monthly"
        onSubscribe={vi.fn()}
        plans={plansWithNoMatch}
      />,
    );

    // Enterprise should not be rendered since no monthly period matches
    const planCards = screen.container.querySelectorAll('[data-testid="plan-card"]');
    expect(planCards).toHaveLength(0);
  });
});
