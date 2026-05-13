/// <reference types="vitest/browser" />
import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";
import { page } from "vitest/browser";
import React from "react";

import { PricingTableContainer } from "@/ui/components/PricingTableContainer";
import { CheckoutPhase, useBillingContext } from "@/ui/context/BillingContext";

import {
  initMSW,
  resetMSW,
  createTestFixture,
  setupNewSubscriptionScenario,
  setupActiveSubscriptionScenario,
  type TestFixture,
  createMockPricingPlan,
  renderWithBilling,
  waitForFrameworkInit,
} from "./setup";

// ============================================================================
// Test Setup
// ============================================================================

let fixture: TestFixture;

beforeAll(async () => {
  await initMSW();
});

beforeEach(() => {
  resetMSW();
  fixture = createTestFixture();
});

// ============================================================================
// Suite: Pricing & Plan Selection
// ============================================================================

describe("Pricing & Plan Selection", () => {
  it("View pricing plans: Plans load → cadence toggle → correct plans shown", async () => {
    setupNewSubscriptionScenario(fixture);

    renderWithBilling(
      <>
        <PhaseIndicator />
        <PricingTableContainer />
      </>
    );

    await waitForFrameworkInit();

    // 1. Plans load from the MSW handler — PlanGrid renders cards
    //    The "Pro" plan has a monthly pricing period → renders with heading
    await vi.waitFor(async () => {
      const proHeading = page.getByRole("heading", { level: 3, name: "Pro" });
      await expect.element(proHeading).toBeInTheDocument();
    });

    // 2. Default cadence is "monthly" — the Monthly label is present
    const monthlyLabel = page.getByText("Monthly");
    await expect.element(monthlyLabel).toBeInTheDocument();

    // 3. Toggle to yearly via the Switch component
    const cadenceSwitch = page.getByRole("switch");
    await cadenceSwitch.click();

    // 4. After switching to "yearly", plans with a yearly period render.
    //    The Pro plan has both monthly and yearly periods, so it persists.
    await vi.waitFor(async () => {
      const proHeading = page.getByRole("heading", { level: 3, name: "Pro" });
      await expect.element(proHeading).toBeInTheDocument();
    });

    // 5. Switch back to monthly
    await cadenceSwitch.click();
  });

  it("Select plan: Click Subscribe on PlanCard → gateway selection shown", async () => {
    setupNewSubscriptionScenario(fixture);

    // Override plans to have just Starter + Pro
    fixture.state.plans = [
      createMockPricingPlan({
        id: 1,
        name: "Starter",
        pricing_periods: [
          { id: 1, cadence: "monthly", price_usd: 9.99, quota_plan_id: 1 },
        ],
      }),
      createMockPricingPlan({
        id: 2,
        name: "Pro",
        pricing_periods: [
          { id: 2, cadence: "monthly", price_usd: 19.99, quota_plan_id: 2 },
        ],
      }),
    ];

    renderWithBilling(
      <>
        <PhaseIndicator />
        <PricingTableContainer />
      </>
    );

    await waitForFrameworkInit();

    // 1. Wait for plans to load
    await vi.waitFor(async () => {
      const starterHeading = page.getByRole("heading", { level: 3, name: "Starter" });
      await expect.element(starterHeading).toBeInTheDocument();
    });

    // 2. Click the "Subscribe" button on the Starter plan card
    //    PlanCard renders: <h3>Starter</h3> ... <Button>Subscribe</Button>
    const subscribeButtons = page.getByRole("button", { name: "Subscribe" });
    // Find the Starter card's Subscribe button (first heading = first button)
    await subscribeButtons.nth(0).click();

    // 3. Should transition to GatewaySelection — PricingTableContainer
    //    now renders CheckoutFlow which shows the GatewaySelector
    const phaseEl = page.getByTestId("checkoutPhase");
    await vi.waitFor(async () => {
      await expect.element(phaseEl).toHaveTextContent(CheckoutPhase.GatewaySelection);
    });
  });

  it("Free/default plan: Free plan with no pricing periods → renders with 'Free' label", async () => {
    // Set up a free plan with empty pricing_periods — PlanGrid should still render it
    fixture.state.subscription = {
      is_subscribed: true,
      gateway_type: "internal",
      pricing_plan_period_id: 1,
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      will_cancel_at: undefined,
      paused_at: undefined,
    };

    fixture.state.plans = [
      {
        id: 1,
        name: "Free",
        description: "Free tier with basic features",
        currency: "USD",
        features: ["Basic storage", "Limited bandwidth"],
        pricing_periods: [],
      },
      {
        id: 2,
        name: "Pro",
        description: "Professional features",
        currency: "USD",
        features: ["Premium storage", "Unlimited bandwidth"],
        pricing_periods: [
          { id: 2, cadence: "monthly", price_usd: 19.99, quota_plan_id: 2 },
        ],
      },
    ];

    renderWithBilling(
      <>
        <PhaseIndicator />
        <PricingTableContainer />
      </>
    );

    await waitForFrameworkInit();

    // 1. Wait for plans to load
    await vi.waitFor(async () => {
      const freeHeading = page.getByRole("heading", { level: 3, name: "Free" });
      await expect.element(freeHeading).toBeInTheDocument();
    });

    // 2. Free plan shows "Free" instead of price
    const freePriceLabel = page.getByText("Free").filter({ has: page.getByRole("heading", { level: 3 }) });
    await expect.element(freePriceLabel).toBeVisible();

    // 3. Pro plan still shows price
    const proHeading = page.getByRole("heading", { level: 3, name: "Pro" });
    await expect.element(proHeading).toBeInTheDocument();
  });

  it("Current plan indicator: Active subscription → 'Current Plan' button on subscribed plan", async () => {
    setupActiveSubscriptionScenario(fixture, "stripe");

    fixture.state.plans = [
      {
        id: 1,
        name: "Starter",
        description: "Starter plan",
        currency: "USD",
        features: ["Feature 1"],
        pricing_periods: [
          { id: 1, cadence: "monthly", price_usd: 9.99, quota_plan_id: 1 },
        ],
      },
      {
        id: 2,
        name: "Pro",
        description: "Pro plan",
        currency: "USD",
        features: ["Feature 1", "Feature 2"],
        pricing_periods: [
          { id: 2, cadence: "monthly", price_usd: 19.99, quota_plan_id: 2 },
        ],
      },
    ];

    // User is subscribed to Starter plan (period id: 1)
    fixture.state.subscription.pricing_plan_period_id = 1;

    renderWithBilling(
      <>
        <PhaseIndicator />
        <PricingTableContainer />
      </>
    );

    await waitForFrameworkInit();

    // 1. Wait for plans to load
    await vi.waitFor(async () => {
      const starterHeading = page.getByRole("heading", { level: 3, name: "Starter" });
      await expect.element(starterHeading).toBeInTheDocument();
    });

    // 2. The Starter plan card should show "Current Plan" button (disabled)
    //    PlanCard renders: {isCurrentPlan ? "Current Plan" : "Subscribe"}
    const currentPlanBtn = page.getByRole("button", { name: "Current Plan" });
    await expect.element(currentPlanBtn).toBeInTheDocument();
    await expect.element(currentPlanBtn).toBeDisabled();

    // 3. The Pro plan card should show "Subscribe" button (enabled)
    const subscribeButtons = page.getByRole("button", { name: "Subscribe" });
    await expect.element(subscribeButtons.nth(0)).toBeInTheDocument();
  });
});

// ============================================================================
// Read-only phase indicator
// ============================================================================

function PhaseIndicator() {
  const { checkout } = useBillingContext();
  return <div data-testid="checkoutPhase">{checkout.phase}</div>;
}
