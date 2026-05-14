/// <reference types="vitest/browser" />
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render } from "vitest-browser-react";
import { page } from "vitest/browser";
import { BillingProvider, useBillingContext, CheckoutPhase } from "@/ui/context/BillingContext";
import type { ReactElement } from "react";

// Mock react-router's useSearchParams
const mockSearchParams = new Map<string, string>();
vi.mock("react-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router")>();
  return {
    ...actual,
    useSearchParams: () => [mockSearchParams, vi.fn()],
  };
});

// Mock the hooks — module-level spies for test assertions
const refetchSpy = vi.fn();
const silentRefetchSpy = vi.fn();

vi.mock("@/hooks/useSubscriptionStatus", () => ({
  useSubscriptionStatus: () => ({
    data: undefined,
    isReady: false,
    isBusy: false,
    hasError: false,
    error: null,
    refetch: refetchSpy,
    silentRefetch: silentRefetchSpy,
  }),
}));

vi.mock("@/hooks/usePricingPlans", () => ({
  usePricingPlans: () => ({
    data: undefined,
    isReady: false,
    isBusy: false,
    hasError: false,
    error: null,
  }),
}));

vi.mock("@/hooks/useCheckout", () => ({
  useCheckout: () => ({
    data: undefined,
    isReady: false,
    isBusy: false,
    hasError: false,
    error: null,
  }),
}));

vi.mock("@/hooks/useCheckoutSessionStatus", () => ({
  useCheckoutSessionStatus: () => ({
    data: undefined,
    isReady: false,
    isBusy: false,
    hasError: false,
    error: null,
  }),
}));

vi.mock("@/hooks/useSubscriptionEventFeed", () => ({
  useSubscriptionEventFeed: () => ({
    on: () => () => {},
    emit: () => {},
  }),
}));

// Test component
function TestComponent() {
  const ctx = useBillingContext();
  return (
    <div>
      <div data-testid="phase">{ctx.checkout.phase}</div>
      <div data-testid="sessionId">{ctx.checkout.sessionId ?? "null"}</div>
      <button
        data-testid="selectPlan"
        onClick={() =>
          ctx.selectPlan(
            { id: 1, name: "Test", description: "", currency: "USD", pricing_periods: [] },
            { id: 1, cadence: "monthly", price_usd: 10, quota_plan_id: 1 }
          )
        }
      >
        Select Plan
      </button>
      <button data-testid="completeCheckout" onClick={() => ctx.completeCheckout("sess-123")}>
        Complete Checkout
      </button>
      <button
        data-testid="selectGateway"
        onClick={() =>
          ctx.selectGateway({ id: "stripe", name: "Stripe", is_active: true, logo_url: "", description: "", abilities: { checkout: true, session_status: true, customer_portal: true } })
        }
      >
        Select Gateway
      </button>
      <button data-testid="resetCheckout" onClick={() => ctx.resetCheckout()}>
        Reset
      </button>
    </div>
  );
}

function renderWithBilling(element: ReactElement) {
  return render(<BillingProvider>{element}</BillingProvider>);
}

describe("BillingContext", () => {
  beforeEach(() => {
    mockSearchParams.clear();
  });

  afterEach(() => {
    mockSearchParams.clear();
  });

  describe("Initial state", () => {
    it("starts in Idle phase", async () => {
      renderWithBilling(<TestComponent />);
      const phaseEl = await page.getByTestId("phase");
      await expect.element(phaseEl).toHaveTextContent(CheckoutPhase.Idle);
    });

    it("sessionId is null initially", async () => {
      renderWithBilling(<TestComponent />);
      const sessionIdEl = await page.getByTestId("sessionId");
      await expect.element(sessionIdEl).toHaveTextContent("null");
    });
  });

  describe("checkout flow", () => {
    it("selectPlan transitions to GatewaySelection phase", async () => {
      renderWithBilling(<TestComponent />);

      const selectPlanBtn = await page.getByTestId("selectPlan");
      await selectPlanBtn.click();

      const phaseEl = await page.getByTestId("phase");
      await expect.element(phaseEl).toHaveTextContent(CheckoutPhase.GatewaySelection);
    });

    it("selectGateway transitions to Checkout phase", async () => {
      renderWithBilling(<TestComponent />);

      const selectPlanBtn = await page.getByTestId("selectPlan");
      await selectPlanBtn.click();
      const selectGatewayBtn = await page.getByTestId("selectGateway");
      await selectGatewayBtn.click();

      const phaseEl = await page.getByTestId("phase");
      await expect.element(phaseEl).toHaveTextContent(CheckoutPhase.Checkout);
    });

    it("completeCheckout transitions to Polling phase", async () => {
      renderWithBilling(<TestComponent />);

      const selectPlanBtn = await page.getByTestId("selectPlan");
      await selectPlanBtn.click();
      const selectGatewayBtn = await page.getByTestId("selectGateway");
      await selectGatewayBtn.click();

      const completeBtn = await page.getByTestId("completeCheckout");
      await completeBtn.click();

      const phaseEl = await page.getByTestId("phase");
      await expect.element(phaseEl).toHaveTextContent(CheckoutPhase.Polling);
    });

    it("completeCheckout sets sessionId", async () => {
      renderWithBilling(<TestComponent />);

      const selectPlanBtn = await page.getByTestId("selectPlan");
      await selectPlanBtn.click();
      const selectGatewayBtn = await page.getByTestId("selectGateway");
      await selectGatewayBtn.click();

      const completeBtn = await page.getByTestId("completeCheckout");
      await completeBtn.click();

      const sessionIdEl = await page.getByTestId("sessionId");
      await expect.element(sessionIdEl).toHaveTextContent("sess-123");
    });

    it("resetCheckout clears sessionId and returns to Idle", async () => {
      renderWithBilling(<TestComponent />);

      const selectPlanBtn = await page.getByTestId("selectPlan");
      await selectPlanBtn.click();
      const selectGatewayBtn = await page.getByTestId("selectGateway");
      await selectGatewayBtn.click();
      const completeBtn = await page.getByTestId("completeCheckout");
      await completeBtn.click();

      const resetBtn = await page.getByTestId("resetCheckout");
      await resetBtn.click();

      const phaseEl = await page.getByTestId("phase");
      const sessionIdEl = await page.getByTestId("sessionId");
      await expect.element(phaseEl).toHaveTextContent(CheckoutPhase.Idle);
      await expect.element(sessionIdEl).toHaveTextContent("null");
    });

    it("calling completeCheckout again still keeps the newest sessionId", async () => {
      renderWithBilling(<TestComponent />);

      const selectPlanBtn = await page.getByTestId("selectPlan");
      await selectPlanBtn.click();
      const selectGatewayBtn = await page.getByTestId("selectGateway");
      await selectGatewayBtn.click();
      const completeBtn = await page.getByTestId("completeCheckout");
      await completeBtn.click();

      // Reset and do it again — sessionId should always be set
      const resetBtn = await page.getByTestId("resetCheckout");
      await resetBtn.click();

      await selectPlanBtn.click();
      await completeBtn.click();
      const sessionIdEl = await page.getByTestId("sessionId");
      await expect.element(sessionIdEl).toHaveTextContent("sess-123");
    });
  });

  describe("Polling behavior with completeCheckout", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("starts polling immediately when completeCheckout is called (skips 10s delay)", async () => {
      renderWithBilling(<TestComponent />);
      const selectPlanBtn = await page.getByTestId("selectPlan");
      await selectPlanBtn.click();
      const selectGatewayBtn = await page.getByTestId("selectGateway");
      await selectGatewayBtn.click();

      // Reset spy before completing checkout
      silentRefetchSpy.mockClear();

      const completeBtn = await page.getByTestId("completeCheckout");
      await completeBtn.click();

      // completeCheckout sets skipInitialPollDelayRef = true, so polling starts immediately
      // The first silentRefetch happens via setInterval which runs after the render cycle
      // Advance just a bit to let the interval setup happen
      vi.advanceTimersByTime(0);
      
      // After 5s: should have polled once (interval started immediately)
      vi.advanceTimersByTime(5_000);
      expect(silentRefetchSpy.mock.calls.length).toBeGreaterThanOrEqual(1);
    });

    it("polls every 5s after entering Polling via completeCheckout", async () => {
      renderWithBilling(<TestComponent />);
      const selectPlanBtn = await page.getByTestId("selectPlan");
      await selectPlanBtn.click();
      const selectGatewayBtn = await page.getByTestId("selectGateway");
      await selectGatewayBtn.click();

      // Reset spy before completing checkout
      silentRefetchSpy.mockClear();

      const completeBtn = await page.getByTestId("completeCheckout");
      await completeBtn.click();

      // Collect call count after initial interval setup
      vi.advanceTimersByTime(5_000);
      const callsAfter5s = silentRefetchSpy.mock.calls.length;
      expect(callsAfter5s).toBeGreaterThanOrEqual(1);

      // After another 5s: should have polled again
      vi.advanceTimersByTime(5_000);
      expect(silentRefetchSpy.mock.calls.length).toBeGreaterThanOrEqual(callsAfter5s + 1);
    });

    it("transitions to Error after 30s hard timeout if still Polling", async () => {
      renderWithBilling(<TestComponent />);
      const selectPlanBtn = await page.getByTestId("selectPlan");
      await selectPlanBtn.click();
      const selectGatewayBtn = await page.getByTestId("selectGateway");
      await selectGatewayBtn.click();
      const completeBtn = await page.getByTestId("completeCheckout");
      await completeBtn.click();

      const phaseEl = await page.getByTestId("phase");
      await expect.element(phaseEl).toHaveTextContent(CheckoutPhase.Polling);

      vi.advanceTimersByTime(30_000);
      await expect.element(phaseEl).toHaveTextContent(CheckoutPhase.Error);
    });

    it("does not transition to Error before 30s", async () => {
      renderWithBilling(<TestComponent />);
      const selectPlanBtn = await page.getByTestId("selectPlan");
      await selectPlanBtn.click();
      const selectGatewayBtn = await page.getByTestId("selectGateway");
      await selectGatewayBtn.click();
      const completeBtn = await page.getByTestId("completeCheckout");
      await completeBtn.click();

      const phaseEl = await page.getByTestId("phase");
      await expect.element(phaseEl).toHaveTextContent(CheckoutPhase.Polling);

      vi.advanceTimersByTime(29_999);
      await expect.element(phaseEl).toHaveTextContent(CheckoutPhase.Polling);
    });

    it("stops polling interval when phase leaves Polling", async () => {
      renderWithBilling(<TestComponent />);
      const selectPlanBtn = await page.getByTestId("selectPlan");
      await selectPlanBtn.click();
      const selectGatewayBtn = await page.getByTestId("selectGateway");
      await selectGatewayBtn.click();

      // Reset spy before completing checkout
      silentRefetchSpy.mockClear();

      const completeBtn = await page.getByTestId("completeCheckout");
      await completeBtn.click();

      // Let it poll
      vi.advanceTimersByTime(5_000);
      const callsBeforeReset = silentRefetchSpy.mock.calls.length;
      expect(callsBeforeReset).toBeGreaterThanOrEqual(1);

      // Reset (leaves Polling)
      const resetBtn = await page.getByTestId("resetCheckout");
      await resetBtn.click();

      // Advance more time — no more calls since we left Polling
      vi.advanceTimersByTime(10_000);
      expect(silentRefetchSpy.mock.calls.length).toBe(callsBeforeReset);
    });
  });

  describe("Query param detection - checkout_return", () => {
    it("enters Polling phase when checkout_return=1 and session_id present", async () => {
      mockSearchParams.set("checkout_return", "1");
      mockSearchParams.set("session_id", "returned-session-456");

      renderWithBilling(<TestComponent />);
      const phaseEl = await page.getByTestId("phase");
      await expect.element(phaseEl).toHaveTextContent(CheckoutPhase.Polling);
      const sessionIdEl = await page.getByTestId("sessionId");
      await expect.element(sessionIdEl).toHaveTextContent("returned-session-456");
    });

    it("stays in Idle when checkout_return=1 but no session_id", async () => {
      mockSearchParams.set("checkout_return", "1");

      renderWithBilling(<TestComponent />);
      const phaseEl = await page.getByTestId("phase");
      await expect.element(phaseEl).toHaveTextContent(CheckoutPhase.Idle);
    });

    it("ignores query params if not checkout_return", async () => {
      mockSearchParams.set("some_other_param", "1");

      renderWithBilling(<TestComponent />);
      const phaseEl = await page.getByTestId("phase");
      await expect.element(phaseEl).toHaveTextContent(CheckoutPhase.Idle);
    });
  });
});
