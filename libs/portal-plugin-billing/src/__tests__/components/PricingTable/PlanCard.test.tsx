import { describe, it, expect, vi } from "vitest";
import { render } from "vitest-browser-react";
import { page } from "vitest/browser";
import { PlanCard } from "@/ui/components/PricingTable/PlanCard";
import type { PublicPricingPlanResponse, PublicPricingPlanPeriodDTO } from "@/types/subscription";

vi.mock("@/ui/components/PricingTable/FeaturesList", () => ({
  FeaturesList: ({ features }: { features?: string[] }) => (
    <ul data-testid="features-list">{features?.length ?? 0} features</ul>
  ),
}));

describe("PlanCard", () => {
  const mockPlan: PublicPricingPlanResponse = {
    id: 1,
    name: "Test Plan",
    description: "A test plan",
    currency: "USD",
    pricing_periods: [],
    features: ["Feature 1", "Feature 2"],
  };

  const mockPeriod: PublicPricingPlanPeriodDTO = {
    id: 1,
    cadence: "monthly",
    price_usd: 1000,
    quota_plan_id: 1,
  };

  it("renders plan name and description", async () => {
    render(
      <PlanCard
        isCurrentPlan={false}
        onSubscribe={vi.fn()}
        period={mockPeriod}
        plan={mockPlan}
      />
    );

    await expect.element(await page.getByRole("heading", { name: "Test Plan" })).toBeInTheDocument();
    await expect.element(await page.getByText("A test plan")).toBeInTheDocument();
  });

  it("shows current badge when isCurrentPlan is true", async () => {
    render(
      <PlanCard
        isCurrentPlan={true}
        onSubscribe={vi.fn()}
        period={mockPeriod}
        plan={mockPlan}
      />
    );

    await expect.element(await page.getByText("Current")).toBeInTheDocument();
  });

  it("disables subscribe button for current plan", async () => {
    render(
      <PlanCard
        isCurrentPlan={true}
        onSubscribe={vi.fn()}
        period={mockPeriod}
        plan={mockPlan}
      />
    );

    const button = await page.getByRole("button", { name: "Current Plan" });
    await expect.element(button).toBeDisabled();
  });

  it("calls onSubscribe when subscribe button clicked", async () => {
    const onSubscribe = vi.fn();
    render(
      <PlanCard
        isCurrentPlan={false}
        onSubscribe={onSubscribe}
        period={mockPeriod}
        plan={mockPlan}
      />
    );

    const button = await page.getByRole("button", { name: "Subscribe" });
    await button.click();

    expect(onSubscribe).toHaveBeenCalledWith(mockPlan, mockPeriod);
  });
});
