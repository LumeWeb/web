/// <reference types="vitest/browser" />
import { describe, it, expect, beforeAll, beforeEach, afterAll, vi } from "vitest";
import { page } from "vitest/browser";
import React from "react";

import { PricingTableContainer } from "@/ui/components/PricingTableContainer";
import { CheckoutPhase, useBillingContext } from "@/ui/context/BillingContext";
import { SessionStatus } from "@/types/subscription";

import {
  initMSW,
  resetMSW,
  createTestFixture,
  setupNewSubscriptionScenario,
  setScenarioState,
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

afterAll(async () => {
  // Cleanup handled by vitest
});

beforeEach(() => {
  resetMSW();
  fixture = createTestFixture();
  setupNewSubscriptionScenario(fixture);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).__testBillingFixture = fixture;
});

// ============================================================================
// Phase indicator — read-only display for test assertions
// ============================================================================

/** Minimal read-only probe that exposes the current checkout phase via data-testid. */
function CheckoutPhaseIndicator() {
  const { checkout } = useBillingContext();
  return (
    <>
      <div data-testid="checkoutPhase">{checkout.phase}</div>
      <div data-testid="checkoutIsReady">{checkout.isReady ? "ready" : "loading"}</div>
      <div data-testid="checkoutSessionId">{checkout.checkoutSessionId ?? "none"}</div>
    </>
  );
}

/**
 * Simulate the payment gateway firing the `paymentCompleted` window event.
 * In production, Stripe.js / Atlos SDK dispatches this event after the user
 * completes payment in the embedded checkout form or popup.
 *
 * The usePaymentEvents hook in CheckoutFlow listens for this event and
 * calls completeCheckout(sessionId) where sessionId comes from
 * checkout.data?.session_id.
 */
function simulatePaymentCompleted() {
  window.dispatchEvent(new CustomEvent("paymentCompleted", { bubbles: true }));
}

// ============================================================================
// Helpers for driving the real UI
// ============================================================================

/** Find and click the "Subscribe" button for a specific plan by its name. */
async function clickSubscribeForPlan(planName: string) {
  // PlanCard renders: <h3>{plan.name}</h3> ... <Button>Subscribe</Button>
  // Wait for the plan heading to appear (plans load from MSW, may take a moment)
  const heading = page.getByRole("heading", { level: 3, name: planName });
  await vi.waitFor(async () => {
    await expect.element(heading).toBeInTheDocument();
  }, { timeout: 5000 });

  // PlanGrid renders cards in a grid. Each card has the plan name heading
  // and a Subscribe button. Find the correct card's button.
  const subscribeButtons = page.getByRole("button", { name: "Subscribe" });
  const headingEls = page.getByRole("heading", { level: 3 }).elements();
  let targetIndex = headingEls.findIndex(el => el.textContent?.trim() === planName);
  if (targetIndex === -1) targetIndex = 0;
  await subscribeButtons.nth(targetIndex).click();
}

/** Find and click a gateway by its name (e.g. "Stripe", "Atlos"). */
async function clickGateway(gatewayName: string) {
  // GatewayCard renders a <button> with <p className="font-medium">{gateway.name}</p>
  const btn = page.getByRole("button", { name: new RegExp(gatewayName, "i") });
  await vi.waitFor(async () => {
    await expect.element(btn).toBeInTheDocument();
  });
  await btn.click();
}

/** Wait for checkout phase to reach a specific value. */
async function waitForPhase(phase: string, timeout = 15000) {
  const phaseEl = page.getByTestId("checkoutPhase");
  await vi.waitFor(async () => {
    await expect.element(phaseEl).toHaveTextContent(phase);
  }, { timeout });
}

// ============================================================================
// Suite: Checkout Flow — New Subscription
// ============================================================================

describe("Checkout Flow — New Subscription", () => {
  it("Stripe — happy path: Subscribe → select Stripe → Pay Now → Complete", async () => {
    renderWithBilling(
      <>
        <CheckoutPhaseIndicator />
        <PricingTableContainer />
      </>
    );

    await waitForFrameworkInit();

    // 1. User sees the pricing table with plan cards.
    //    Click "Subscribe" on the Pro plan.
    await clickSubscribeForPlan("Pro");

    // 2. PricingTableContainer detects non-Idle phase → renders CheckoutFlow
    //    CheckoutFlow shows GatewaySelector
    await waitForPhase(CheckoutPhase.GatewaySelection);

    // 3. User selects the Stripe gateway
    await clickGateway("Stripe");

    // 4. CheckoutFlow transitions to Checkout → renders CheckoutForm with fragments
    await waitForPhase(CheckoutPhase.Checkout);

    // Wait for checkout data (session ID) to be available
    const readyEl = page.getByTestId("checkoutIsReady");
    await vi.waitFor(async () => {
      await expect.element(readyEl).toHaveTextContent("ready");
    });

    // 5. The Stripe mock fragment renders a "Pay Now" button.
    //    In production, the Stripe embedded checkout form handles payment
    //    automatically and dispatches paymentCompleted on success.
    //    Our mock fragment simulates this — clicking "Pay Now" triggers
    //    the paymentCompleted window event after a short delay.
    const payNowBtn = page.getByRole("button", { name: "Pay Now" });
    await vi.waitFor(async () => {
      await expect.element(payNowBtn).toBeInTheDocument();
    });
    await payNowBtn.click();

    // 6. After paymentCompleted fires → usePaymentEvents hook →
    //    completeCheckout(sessionId) → Polling phase
    await waitForPhase(CheckoutPhase.Polling);

    // 7. MSW auto-activates subscription → is_subscribed=true → Complete
    await waitForPhase(CheckoutPhase.Complete, 30000);
  });

  it("Stripe — 3DS redirect: Subscribe → select Stripe → authenticate → Complete", async () => {
    setScenarioState({ simulate3DSRedirect: true });

    renderWithBilling(
      <>
        <CheckoutPhaseIndicator />
        <PricingTableContainer />
      </>
    );

    await waitForFrameworkInit();

    // 1. Select plan and gateway
    await clickSubscribeForPlan("Pro");
    await waitForPhase(CheckoutPhase.GatewaySelection);
    await clickGateway("Stripe");
    await waitForPhase(CheckoutPhase.Checkout);

    // Wait for checkout data
    const readyEl = page.getByTestId("checkoutIsReady");
    await vi.waitFor(async () => {
      await expect.element(readyEl).toHaveTextContent("ready");
    });

    // 2. The 3DS mock fragment renders an "Authenticate" button.
    //    In production, clicking it would redirect to the bank's 3DS page,
    //    then the bank redirects back to the subscription page with
    //    checkout_return=1&session_id=… in the URL.
    //    The mock simulates this by dispatching a checkout3DSRedirect event,
    //    which the RedirectListener translates into a history.push —
    //    the same in-app navigation that would occur on return from
    //    the external redirect, without a full page reload.
    const authBtn = page.getByRole("button", { name: "Authenticate" });
    await vi.waitFor(async () => {
      await expect.element(authBtn).toBeInTheDocument();
    });

    // Pre-mark the session as complete so the subscription handler
    // auto-activates is_subscribed=true during the Polling phase.
    // After the history.push redirect, BillingContext starts from Idle
    // (no gateway selected), so session_status polling is disabled —
    // the subscription handler's auto-activation on "complete" sessions
    // is the primary mechanism.
    const checkoutResponses = fixture.state.checkoutResponses;
    const sessionId = checkoutResponses.values().next().value?.session_id;
    if (sessionId) {
      fixture.setSessionStatus(sessionId, createMockSessionStatus({ session_id: sessionId, status: SessionStatus.Complete }));
    }

    await authBtn.click();

    // 3. checkout3DSRedirect → RedirectListener → history.push with
    //    checkout_return=1&session_id=… → BillingContext detects return →
    //    Polling → subscription is_subscribed → Complete
    await waitForPhase(CheckoutPhase.Complete, 20000);
  });

  it("Stripe — expired session: payment → session expires during polling → Error", async () => {
    setScenarioState({ simulateExpiredSession: true });

    renderWithBilling(
      <>
        <CheckoutPhaseIndicator />
        <PricingTableContainer />
      </>
    );

    await waitForFrameworkInit();

    // 1. Select plan and gateway
    await clickSubscribeForPlan("Pro");
    await waitForPhase(CheckoutPhase.GatewaySelection);
    await clickGateway("Stripe");
    await waitForPhase(CheckoutPhase.Checkout);

    // Wait for checkout data
    const readyEl = page.getByTestId("checkoutIsReady");
    await vi.waitFor(async () => {
      await expect.element(readyEl).toHaveTextContent("ready");
    });

    // 2. User completes payment (gateway fires paymentCompleted)
    simulatePaymentCompleted();

    // 3. Enters Polling phase
    await waitForPhase(CheckoutPhase.Polling);

    // 4. During polling, the sessionStatusHook checks the session.
    //    The MSW handler returns "expired" status (simulateExpiredSession).
    //    derivedPhase: gatewaySupportsSessionStatus=true, status=expired → Error
    await waitForPhase(CheckoutPhase.Error, 20000);
  });

  it("Atlos — happy path: Subscribe → select Atlos → Pay with Atlos → Complete", async () => {
    renderWithBilling(
      <>
        <CheckoutPhaseIndicator />
        <PricingTableContainer />
      </>
    );

    await waitForFrameworkInit();

    // 1. Select plan
    await clickSubscribeForPlan("Pro");
    await waitForPhase(CheckoutPhase.GatewaySelection);

    // 2. Select Atlos gateway
    await clickGateway("Atlos");
    await waitForPhase(CheckoutPhase.Checkout);

    // Wait for checkout data
    const readyEl = page.getByTestId("checkoutIsReady");
    await vi.waitFor(async () => {
      await expect.element(readyEl).toHaveTextContent("ready");
    });

    // 3. Atlos does NOT support session status polling (session_status=false).
    //    Pre-mark the session as complete so subscription handler returns
    //    is_subscribed=true after paymentCompleted fires.
    const checkoutResponses = fixture.state.checkoutResponses;
    const checkoutData = Array.from(checkoutResponses.values())[0];
    if (checkoutData?.session_id) {
      fixture.setSessionStatus(
        checkoutData.session_id,
        createMockSessionStatus({ session_id: checkoutData.session_id, status: SessionStatus.Complete }),
      );
    }

    // 4. The Atlos mock fragment renders a "Pay with Atlos" button
    //    in a fixed overlay. Clicking it dispatches paymentCompleted.
    const payBtn = page.getByRole("button", { name: "Pay with Atlos" });
    await vi.waitFor(async () => {
      await expect.element(payBtn).toBeInTheDocument();
    });
    await payBtn.click();

    // 5. paymentCompleted → Polling → subscription active → Complete
    await waitForPhase(CheckoutPhase.Complete, 30000);
  });

  it("Atlos — cancel: user cancels popup → stays in Checkout", async () => {
    renderWithBilling(
      <>
        <CheckoutPhaseIndicator />
        <PricingTableContainer />
      </>
    );

    await waitForFrameworkInit();

    // 1. Select plan and Atlos gateway
    await clickSubscribeForPlan("Pro");
    await waitForPhase(CheckoutPhase.GatewaySelection);
    await clickGateway("Atlos");
    await waitForPhase(CheckoutPhase.Checkout);

    // 2. User clicks Cancel in the Atlos popup
    const cancelBtn = page.getByRole("button", { name: "Cancel" });
    await vi.waitFor(async () => {
      await expect.element(cancelBtn).toBeInTheDocument();
    });
    await cancelBtn.click();

    // 3. Cancel dispatches paymentCanceled — usePaymentEvents handles it
    //    by staying in the current phase (Checkout)
    await new Promise((resolve) => setTimeout(resolve, 500));
    await waitForPhase(CheckoutPhase.Checkout);
  });

  it("Gateway selection: Multiple gateways shown → user picks one → Checkout", async () => {
    renderWithBilling(
      <>
        <CheckoutPhaseIndicator />
        <PricingTableContainer />
      </>
    );

    await waitForFrameworkInit();

    // 1. Select plan — should show gateway selection
    await clickSubscribeForPlan("Pro");
    await waitForPhase(CheckoutPhase.GatewaySelection);

    // 2. Both gateways should be visible
    const stripeBtn = page.getByRole("button", { name: /stripe/i });
    const atlosBtn = page.getByRole("button", { name: /atlos/i });
    await expect.element(stripeBtn).toBeInTheDocument();
    await expect.element(atlosBtn).toBeInTheDocument();

    // 3. Select Stripe → enters Checkout
    await stripeBtn.click();
    await waitForPhase(CheckoutPhase.Checkout);
  });

  it("Checkout error: API returns error → Error phase displayed", async () => {
    setScenarioState({ shouldFailCheckout: true });

    renderWithBilling(
      <>
        <CheckoutPhaseIndicator />
        <PricingTableContainer />
      </>
    );

    await waitForFrameworkInit();

    // 1. Select plan and gateway
    await clickSubscribeForPlan("Pro");
    await waitForPhase(CheckoutPhase.GatewaySelection);
    await clickGateway("Stripe");

    // 2. Should transition to Error due to API failure
    await waitForPhase(CheckoutPhase.Error, 10000);
  });

  it("Checkout reset: User in checkout → clicks Back to Plans → back to Idle", async () => {
    renderWithBilling(
      <>
        <CheckoutPhaseIndicator />
        <PricingTableContainer />
      </>
    );

    await waitForFrameworkInit();

    // 1. Select plan and gateway to get to Checkout
    await clickSubscribeForPlan("Pro");
    await waitForPhase(CheckoutPhase.GatewaySelection);
    await clickGateway("Stripe");
    await waitForPhase(CheckoutPhase.Checkout);

    // 2. Click the "Back to Plans" button in the CheckoutForm
    const backBtn = page.getByRole("button", { name: /back/i });
    await vi.waitFor(async () => {
      await expect.element(backBtn).toBeInTheDocument();
    });
    await backBtn.click();

    // 3. Should return to Idle
    await waitForPhase(CheckoutPhase.Idle);
  });
});
