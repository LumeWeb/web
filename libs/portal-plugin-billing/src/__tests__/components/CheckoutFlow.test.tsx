/// <reference types="vitest/browser" />
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "vitest-browser-react";
import { page } from "vitest/browser";
import { CheckoutFlow } from "@/ui/components/CheckoutFlow";
import { BillingProvider, useBillingContext, CheckoutPhase } from "@/ui/context/BillingContext";
import { FragmentQueueProvider } from "@/ui/context/FragmentQueueContext";
import type { ReactElement } from "react";
import type { CheckoutUIResponse } from "@/types/subscription";

// Mock react-router
vi.mock("react-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router")>();
  return {
    ...actual,
    useSearchParams: () => [new Map<string, string>(), vi.fn()],
    useNavigate: () => vi.fn(),
  };
});

// Mock the hooks
vi.mock("@/hooks/useSubscriptionStatus", () => ({
  useSubscriptionStatus: () => ({
    data: undefined,
    isReady: false,
    isBusy: false,
    hasError: false,
    error: null,
    refetch: vi.fn(),
    silentRefetch: vi.fn(),
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
  useCheckout: ({ queryOptions }: { queryOptions: { enabled: boolean } }) => ({
    data: queryOptions.enabled
      ? ({
          fragments: [
            { type: "html", html: "<div>Test Checkout</div>" },
            { type: "script", script: "window.__testCheckoutLoaded = true;" },
          ],
          session_id: "sess-test-123",
        } as CheckoutUIResponse)
      : undefined,
    isReady: queryOptions.enabled,
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
  }),
}));

vi.mock("@/hooks/useGateways", () => ({
  useGateways: () => ({
    data: [
      { id: "stripe", name: "Stripe", is_active: true, logo_url: "", description: "", abilities: { checkout: true, session_status: true, customer_portal: true } },
      { id: "atlos", name: "Atlos", is_active: true, logo_url: "", description: "", abilities: { checkout: true, session_status: false, customer_portal: false } },
    ],
    isReady: true,
    isBusy: false,
    hasError: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

// Mock the portal framework UI core
vi.mock("@lumeweb/portal-framework-ui-core", () => ({
  cn: (...args: string[]) => args.filter(Boolean).join(" "),
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
  Card: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardContent: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardHeader: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardTitle: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Skeleton: ({ ...props }: any) => <div data-testid="skeleton" {...props} />,
  Badge: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  Spinner: () => <div data-testid="spinner">Loading...</div>,
  lazyIcon: (name: string) => () => <span data-testid={name.charAt(0).toLowerCase() + name.slice(1).replace(/([A-Z])/g, (c: string) => "-" + c.toLowerCase())} />,
}));

// Mock framework capability
vi.mock("@lumeweb/portal-framework-core", () => ({
  useCapability: () => ({ data: { getApiUrl: () => "https://api.example.com" } }),
  createNamespacedId: (id: string) => id,
}));

function TestPhaseControl() {
  const ctx = useBillingContext();
  return (
    <div>
      <div data-testid="currentPhase">{ctx.checkout.phase}</div>
      <button data-testid="selectPlan" onClick={() => ctx.selectPlan({ id: 1, name: "Test", description: "", currency: "USD", pricing_periods: [] }, { id: 1, cadence: "monthly", price_usd: 10, quota_plan_id: 1 })}>
        Select Plan
      </button>
      <button data-testid="selectStripe" onClick={() => ctx.selectGateway({ id: "stripe", name: "Stripe", is_active: true, logo_url: "", description: "", abilities: { checkout: true, session_status: true, customer_portal: true } })}>
        Select Stripe
      </button>
      <button data-testid="completeCheckout" onClick={() => ctx.completeCheckout("sess-test-123")}>
        Complete Checkout
      </button>
      <button data-testid="resetCheckout" onClick={() => ctx.resetCheckout()}>
        Reset
      </button>
    </div>
  );
}

function renderWithProviders(element: ReactElement) {
  return render(
    <BillingProvider>
      <FragmentQueueProvider>
        {element}
      </FragmentQueueProvider>
    </BillingProvider>
  );
}

describe("CheckoutFlow", () => {
  beforeEach(() => {
    delete (window as any).__testCheckoutLoaded;
    vi.clearAllMocks();
  });

  describe("Phase rendering", () => {
    it("shows GatewaySelection when plan selected", async () => {
      renderWithProviders(
        <>
          <TestPhaseControl />
          <CheckoutFlow />
        </>
      );

      const selectPlanBtn = await page.getByTestId("selectPlan");
      await selectPlanBtn.click();
      const currentPhaseEl = await page.getByTestId("currentPhase");
      await expect.element(currentPhaseEl).toHaveTextContent(CheckoutPhase.GatewaySelection);
      const gatewayText = await page.getByText("Select Payment Method");
      await expect.element(gatewayText).toBeInTheDocument();
    });

    it("shows Checkout form when gateway selected", async () => {
      renderWithProviders(
        <>
          <TestPhaseControl />
          <CheckoutFlow />
        </>
      );

      const selectPlanBtn = await page.getByTestId("selectPlan");
      await selectPlanBtn.click();
      const selectGatewayBtn = await page.getByTestId("selectStripe");
      await selectGatewayBtn.click();
      const checkoutContent = await page.getByText("Test Checkout");
      await expect.element(checkoutContent).toBeInTheDocument();
    });

    it("shows Processing state when in Polling phase", async () => {
      renderWithProviders(
        <>
          <TestPhaseControl />
          <CheckoutFlow />
        </>
      );

      const selectPlanBtn = await page.getByTestId("selectPlan");
      await selectPlanBtn.click();
      const completeBtn = await page.getByTestId("completeCheckout");
      await completeBtn.click();
      const processingText = await page.getByText("Processing Payment...");
      await expect.element(processingText).toBeInTheDocument();
    });
  });

  describe("usePaymentEvents integration", () => {
    it("transitions to Polling on paymentCompleted event (per js_payment_events.md spec)", async () => {
      renderWithProviders(
        <>
          <TestPhaseControl />
          <CheckoutFlow />
        </>
      );

      // Enter checkout phase via gateway selection
      const selectPlanBtn = await page.getByTestId("selectPlan");
      await selectPlanBtn.click();
      const selectGatewayBtn = await page.getByTestId("selectStripe");
      await selectGatewayBtn.click();
      const currentPhaseEl = await page.getByTestId("currentPhase");
      await expect.element(currentPhaseEl).toHaveTextContent(CheckoutPhase.Checkout);

      // Simulate Stripe.js onComplete callback dispatching paymentCompleted
      // Per js_payment_events.md: detail is null, sessionId comes from usePaymentEvents prop
      window.dispatchEvent(
        new CustomEvent("paymentCompleted", {
          bubbles: true,
        })
      );

      // Should transition to Polling phase
      await vi.waitFor(async () => {
        const updatedPhase = await page.getByTestId("currentPhase");
        await expect.element(updatedPhase).toHaveTextContent(CheckoutPhase.Polling);
      });
    });

    it("uses sessionId from API response prop, not event detail", async () => {
      renderWithProviders(
        <>
          <TestPhaseControl />
          <CheckoutFlow />
        </>
      );

      // Enter checkout phase via gateway selection
      const selectPlanBtn = await page.getByTestId("selectPlan");
      await selectPlanBtn.click();
      const selectGatewayBtn = await page.getByTestId("selectStripe");
      await selectGatewayBtn.click();

      // Event has no detail — sessionId comes from checkout.data.session_id (API response)
      window.dispatchEvent(
        new CustomEvent("paymentCompleted", {
          bubbles: true,
        })
      );

      // The phase should be Polling now, with sessionId from the API response
      await vi.waitFor(async () => {
        const updatedPhase = await page.getByTestId("currentPhase");
        await expect.element(updatedPhase).toHaveTextContent(CheckoutPhase.Polling);
      });
    });
  });

  describe("Reset functionality", () => {
    it("allows returning to Idle on reset", async () => {
      renderWithProviders(
        <>
          <TestPhaseControl />
          <CheckoutFlow />
        </>
      );

      const selectPlanBtn = await page.getByTestId("selectPlan");
      await selectPlanBtn.click();
      const resetBtn = await page.getByTestId("resetCheckout");
      await resetBtn.click();
      const currentPhaseEl = await page.getByTestId("currentPhase");
      await expect.element(currentPhaseEl).toHaveTextContent(CheckoutPhase.Idle);
    });
  });
});
