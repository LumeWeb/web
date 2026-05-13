/// <reference types="vitest/browser" />
import { render } from "vitest-browser-react";
import { describe, expect, it, vi } from "vitest";

import { PlanList } from "@/ui/components/PlanChange/PlanList";
import type { PublicPricingPlanResponse } from "@/types/subscription";

vi.mock("@lumeweb/portal-framework-ui-core", () => ({
  Skeleton: () => <div data-testid="skeleton">Loading...</div>,
  Spinner: () => <div data-testid="spinner">Loading...</div>,
  cn: (...args: (string | undefined)[]) => args.filter(Boolean).join(" "),
}));

describe("PlanList", () => {
  const mockPlans: PublicPricingPlanResponse[] = [
    {
      id: 1,
      name: "Basic",
      description: "Basic plan",
      currency: "USD",
      pricing_periods: [
        { id: 101, cadence: "monthly", price_usd: 10.00, quota_plan_id: 1, rolling_days: 30 },
      ],
    },
    {
      id: 2,
      name: "Pro",
      description: "Pro plan",
      currency: "USD",
      pricing_periods: [
        { id: 201, cadence: "monthly", price_usd: 29.99, quota_plan_id: 2, rolling_days: 30 },
      ],
    },
  ];

  it("renders list of plans", async () => {
    const screen = await render(
      <PlanList
        currentPeriodId={1}
        isLoading={false}
        plans={mockPlans}
        onSelectPeriod={vi.fn()}
      />,
    );

    // Use role to avoid matching description text ("Basic plan" contains "Basic")
    await expect.element(screen.getByRole("heading", { name: "Basic" })).toBeInTheDocument();
    await expect.element(screen.getByRole("heading", { name: "Pro" })).toBeInTheDocument();
  });

  it("calls onSelectPeriod with selected period id", async () => {
    const handleSelect = vi.fn();
    const screen = await render(
      <PlanList
        currentPeriodId={1}
        isLoading={false}
        plans={mockPlans}
        onSelectPeriod={handleSelect}
      />,
    );

    // Click on the Pro plan button - use getByRole with button and include price which is unique
    const proButton = screen.getByRole("button", { name: /monthly.*\$29\.99/i });
    await proButton.click();
    expect(handleSelect).toHaveBeenCalledWith(201);
  });

  it("marks current plan as selected", async () => {
    const screen = await render(
      <PlanList
        currentPeriodId={101}
        isLoading={false}
        plans={[mockPlans[0]]}
        onSelectPeriod={vi.fn()}
      />,
    );

    await expect.element(screen.getByText(/Current/)).toBeInTheDocument();
  });

  it("shows spinner on selected period while loading", async () => {
    const screen = await render(
      <PlanList
        currentPeriodId={1}
        isLoading={true}
        plans={mockPlans}
        onSelectPeriod={vi.fn()}
        selectedPeriodId={201}
      />,
    );

    const spinner = screen.container.querySelector('[data-testid="spinner"]');
    expect(spinner).toBeInTheDocument();
  });

  it("does not show spinner when no period is selected", async () => {
    const screen = await render(
      <PlanList
        currentPeriodId={1}
        isLoading={true}
        plans={mockPlans}
        onSelectPeriod={vi.fn()}
      />,
    );

    const spinner = screen.container.querySelector('[data-testid="spinner"]');
    expect(spinner).not.toBeInTheDocument();
  });

  it("shows skeleton when plans array is empty", async () => {
    const screen = await render(
      <PlanList
        currentPeriodId={1}
        isLoading={false}
        plans={[]}
        onSelectPeriod={vi.fn()}
      />,
    );

    const skeletons = screen.container.querySelectorAll('[data-testid="skeleton"]');
    expect(skeletons.length).toBe(2);
  });
});
