/// <reference types="vitest/browser" />
import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";
import { page } from "vitest/browser";
import React from "react";

import { PricingTableContainer } from "@/ui/components/PricingTableContainer";
import { CheckoutPhase, useBillingContext } from "@/ui/context/BillingContext";
import { BillingSSEEventType, SessionStatus } from "@/types/subscription";

import {
  initMSW,
  resetMSW,
  createTestFixture,
  setupNewSubscriptionScenario,
  type TestFixture,
  createMockSessionStatus,
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
  setupNewSubscriptionScenario(fixture);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).__testBillingFixture = fixture;
});

// ============================================================================
// Read-only phase indicator + subscription state
// ============================================================================

function PhaseIndicator() {
  const { checkout, subscription } = useBillingContext();
  return (
    <>
      <div data-testid="checkoutPhase">{checkout.phase}</div>
      <div data-testid="checkoutIsReady">{checkout.isReady ? "ready" : "loading"}</div>
      <div data-testid="checkoutSessionId">{checkout.checkoutSessionId ?? "none"}</div>
      <div data-testid="isSubscribed">{subscription.data?.is_subscribed ? "yes" : "no"}</div>
    </>
  );
}

// ============================================================================
// Helpers for driving the real UI
// ============================================================================

async function clickSubscribeForPlan(planName: string) {
  const heading = page.getByRole("heading", { level: 3, name: planName });
  await vi.waitFor(async () => {
    await expect.element(heading).toBeInTheDocument();
  }, { timeout: 5000 });
  const subscribeButtons = page.getByRole("button", { name: "Subscribe" });
  const headingEls = page.getByRole("heading", { level: 3 }).elements();
  let targetIndex = headingEls.findIndex(el => el.textContent?.trim() === planName);
  if (targetIndex === -1) targetIndex = 0;
  await subscribeButtons.nth(targetIndex).click();
}

async function clickGateway(gatewayName: string) {
  const btn = page.getByRole("button", { name: new RegExp(gatewayName, "i") });
  await vi.waitFor(async () => { await expect.element(btn).toBeInTheDocument(); });
  await btn.click();
}

async function waitForPhase(phase: string, timeout = 15000) {
  const phaseEl = page.getByTestId("checkoutPhase");
  await vi.waitFor(async () => {
    await expect.element(phaseEl).toHaveTextContent(phase);
  }, { timeout });
}

function simulatePaymentCompleted() {
  window.dispatchEvent(new CustomEvent("paymentCompleted", { bubbles: true }));
}

/**
 * Full realistic flow to get into the Polling phase:
 * Subscribe → select gateway → Pay Now → Polling
 * @param gatewayName - Gateway to use
 * @param options.sessionStatus - Optional session status to set before entering Polling
 */
async function reachPollingPhase(
  gatewayName: "Stripe" | "Atlos",
  options?: { sessionStatus?: { status: SessionStatus } },
) {
  await waitForFrameworkInit();

  // 1. Click Subscribe on the Pro plan
  await clickSubscribeForPlan("Pro");
  await waitForPhase(CheckoutPhase.GatewaySelection);

  // 2. Select gateway
  await clickGateway(gatewayName);
  await waitForPhase(CheckoutPhase.Checkout);

  // 3. Wait for checkout data
  const readyEl = page.getByTestId("checkoutIsReady");
  await vi.waitFor(async () => {
    await expect.element(readyEl).toHaveTextContent("ready");
  });

  const checkoutResponses = fixture.state.checkoutResponses;
  const checkoutData = Array.from(checkoutResponses.values())[0];

  // For Atlos: pre-mark session as complete (no session status API)
  if (gatewayName === "Atlos") {
    if (checkoutData?.session_id) {
      fixture.setSessionStatus(
        checkoutData.session_id,
        createMockSessionStatus({ session_id: checkoutData.session_id }),
      );
    }
  }

  // Set custom session status if provided (prevents auto-complete race conditions)
  if (options?.sessionStatus && checkoutData?.session_id) {
    fixture.setSessionStatus(
      checkoutData.session_id,
      createMockSessionStatus({
        session_id: checkoutData.session_id,
        status: options.sessionStatus.status,
      }),
    );
  }

  // 4. Complete payment via the mock fragment button or direct event dispatch
  simulatePaymentCompleted();

  // 5. Wait for Polling
  await waitForPhase(CheckoutPhase.Polling);
}

// ============================================================================
// Suite: SSE Event Handling
// ============================================================================

describe("SSE Event Handling", () => {
  it("payment.completed event: SSE fires during polling → Complete phase", async () => {
    renderWithBilling(
      <>
        <PhaseIndicator />
        <PricingTableContainer />
      </>
    );

    // Get into Polling phase via the real checkout flow
    await reachPollingPhase("Stripe");

    // Queue a PaymentCompleted SSE event — this simulates the backend
    // pushing the event through the SSE stream (EventSource)
    fixture.queueSSEEvent(BillingSSEEventType.PaymentCompleted, {
      amount: "19.99",
      gateway: "stripe",
      invoice_id: `inv_${Date.now()}`,
      external_id: `ext_${Date.now()}`,
      paid_at: new Date().toISOString(),
    });

    // SSE PaymentCompleted → Complete (if phase is Polling)
    await waitForPhase(CheckoutPhase.Complete, 20000);
  });

  it("subscription.active event: SSE fires → Complete phase", async () => {
    renderWithBilling(
      <>
        <PhaseIndicator />
        <PricingTableContainer />
      </>
    );

    await reachPollingPhase("Stripe");

    // Queue a SubscriptionActive SSE event
    fixture.queueSSEEvent(BillingSSEEventType.SubscriptionActive, {
      created_at: new Date().toISOString(),
    });

    // SSE SubscriptionActive → Complete (if phase is Polling or Checkout)
    await waitForPhase(CheckoutPhase.Complete, 20000);
  });

  it("subscription.cancelled event: SSE fires during polling → Error phase", async () => {
    renderWithBilling(
      <>
        <PhaseIndicator />
        <PricingTableContainer />
      </>
    );

    // Use Open status to prevent session polling from transitioning to Complete
    // before the SSE event can be processed
    await reachPollingPhase("Stripe", { sessionStatus: { status: SessionStatus.Open } });

    // Queue a SubscriptionCancelled SSE event
    fixture.queueSSEEvent(BillingSSEEventType.SubscriptionCancelled, {
      cancelled_at: new Date().toISOString(),
    });

    // SSE SubscriptionCancelled → Error (if phase is Polling or Checkout)
    await waitForPhase(CheckoutPhase.Error, 20000);
  });

  it("Polling fallback: No SSE event → subscription polling detects activation → Complete", async () => {
    renderWithBilling(
      <>
        <PhaseIndicator />
        <PricingTableContainer />
      </>
    );

    await waitForFrameworkInit();

    // Subscribe → select Stripe → checkout
    await clickSubscribeForPlan("Pro");
    await waitForPhase(CheckoutPhase.GatewaySelection);
    await clickGateway("Stripe");
    await waitForPhase(CheckoutPhase.Checkout);

    // Wait for checkout data
    const readyEl = page.getByTestId("checkoutIsReady");
    await vi.waitFor(async () => {
      await expect.element(readyEl).toHaveTextContent("ready");
    });

    // Pre-mark the session as complete so the subscription handler
    // returns is_subscribed=true after we enter Polling.
    // This simulates the backend completing the payment processing.
    const checkoutResponses = fixture.state.checkoutResponses;
    const checkoutData = Array.from(checkoutResponses.values())[0];
    if (checkoutData?.session_id) {
      fixture.setSessionStatus(
        checkoutData.session_id,
        createMockSessionStatus({
          session_id: checkoutData.session_id,
          status: "complete",
        }),
      );
    }
    // Activate subscription (the subscription hook polls this)
    fixture.state.subscription = {
      ...fixture.state.subscription,
      is_subscribed: true,
      gateway_type: "stripe",
      pricing_plan_period_id: 1,
    };

    // Complete checkout → enter Polling
    simulatePaymentCompleted();
    await waitForPhase(CheckoutPhase.Polling);

    // The subscription polling should detect is_subscribed=true → Complete
    // (no SSE event needed — this is the fallback path)
    await waitForPhase(CheckoutPhase.Complete, 20000);

    // Verify subscription is active
    const isSubscribedEl = page.getByTestId("isSubscribed");
    await vi.waitFor(async () => {
      await expect.element(isSubscribedEl).toHaveTextContent("yes");
    });
  });
});
