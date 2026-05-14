// E2E Test Setup for Billing Plugin
// Shared utilities, MSW setup, and test fixtures for browser-based e2e tests

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import dataProvider from "@lumeweb/advanced-rest-provider";
import { DATA_PROVIDER_NAME } from "@lumeweb/portal-framework-auth";
import { FrameworkProvider, useFramework } from "@lumeweb/portal-framework-core";
import type { AuthProvider, NotificationProvider } from "@refinedev/core";
import { Refine } from "@refinedev/core";
import { setupWorker, type SetupWorker } from "msw/browser";
import { init as mfInit } from "@module-federation/enhanced/runtime";
import React, { type ReactElement, useState, useEffect } from "react";
import { MemoryRouter, useNavigate } from "react-router";
import { render } from "vitest-browser-react";

import { BillingProvider, CheckoutPhase, useBillingContext } from "@/ui/context/BillingContext";
import { FragmentQueueProvider } from "@/ui/context/FragmentQueueContext";

import { billingHandlers } from "./msw-handlers";
import {
  createTestFixture,
  resetScenarioState,
  scenarioState,
  setScenarioState,
  type TestFixture,
} from "./msw-helpers";

// Re-export for convenience
export { scenarioState, resetScenarioState, setScenarioState, createTestFixture };
export type { TestFixture };
export { billingHandlers } from "./msw-handlers";
export * from "./msw-helpers";
export * from "./mock-fragments";

// ============================================================================
// Module Federation Runtime Setup
// ============================================================================

let mfInitialized = false;

/**
 * Initialize the Module Federation runtime for tests.
 * The FrameworkProvider expects MF runtime to be initialized before it can work.
 */
export function initModuleFederation(): void {
  if (mfInitialized) {
    return;
  }

  try {
    // Bootstrap MF runtime via init() (not createInstance) so that
    // getInstance() in framework-initializer.ts can find the instance.
    // createInstance() only pushes to window.__FEDERATION__.__INSTANCES__
    // but does NOT set the module-scoped FederationInstance variable that
    // getInstance() reads. See: https://github.com/module-federation/vite/pull/678
    mfInit({
      name: "billing-e2e-test",
      remotes: [],
    });

    mfInitialized = true;
  } catch (error) {
    // If already initialized, that's fine
    if ((error as Error).message?.includes("already initialized")) {
      mfInitialized = true;
    } else {
      console.warn("[E2E Setup] Module Federation init failed:", error);
    }
  }
}

// ============================================================================
// MSW Worker Setup
// ============================================================================

let mswWorker: SetupWorker | null = null;

interface UnhandledRequest {
  url: string;
  method: string;
}

interface PrintFns {
  warning(): void;
}

/**
 * Initialize MSW worker for browser-based e2e tests
 * Call this once at the start of your test file
 */
export async function initMSW(): Promise<SetupWorker> {
  if (mswWorker) {
    return mswWorker;
  }

  // Initialize Module Federation runtime before MSW
  initModuleFederation();

  mswWorker = setupWorker(...billingHandlers);

  await mswWorker.start({
    serviceWorker: {
      url: "/mockServiceWorker.js",
    },
    onUnhandledRequest(request: UnhandledRequest, print: PrintFns) {
      // Ignore non-API requests
      if (!request.url.includes("/billing/") && !request.url.includes("/account/billing/")) {
        return;
      }

      // Log unhandled API requests for debugging
      console.warn(`[MSW] Unhandled billing API request: ${request.method} ${request.url}`);
      print.warning();
    },
  });

  return mswWorker;
}

/**
 * Stop MSW worker
 * Call this in test cleanup
 */
export async function stopMSW(): Promise<void> {
  if (mswWorker) {
    await mswWorker.stop();
    mswWorker = null;
  }
}

/**
 * Reset MSW handlers to default state
 * Call this in beforeEach to ensure test isolation
 */
export async function resetMSW(): Promise<void> {
  if (!mswWorker) {
    throw new Error("MSW not initialized. Call initMSW() first.");
  }

  mswWorker.resetHandlers();
  resetScenarioState();
}

// ============================================================================
// Refine Provider Setup
// ============================================================================

// Create a QueryClient for react-query
function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

const baseURL = "http://localhost:8787/api";

// Mock auth provider for Refine
const mockAuthProvider: AuthProvider = {
  login: async () => ({ success: true, redirectTo: "/" }),
  logout: async () => ({ success: true, redirectTo: "/login" }),
  check: async () => ({ authenticated: true }),
  onError: async () => ({}),
  getPermissions: async () => null,
  getIdentity: async () => ({ id: "test-user", name: "Test User" }),
};

// Minimal notification provider
const mockNotificationProvider: NotificationProvider = {
  open: () => () => {},
  close: () => () => {},
};

// ============================================================================
// 3DS Redirect Listener
// ============================================================================

/**
 * Listens for the `checkout3DSRedirect` custom event dispatched by mock 3DS
 * fragments and translates it into an in-app navigation via React Router's
 * history.push. This simulates the "user returns from external 3DS redirect"
 * flow without actually leaving the page (which would crash the vitest iframe).
 *
 * The redirect URL is augmented with `checkout_return=1&session_id=…` so that
 * BillingContext's existing search-param detection picks it up.
 *
 * In production, a 3DS redirect causes a full page navigation away from the SPA.
 * When the user returns with the checkout_return query params, the app re-mounts
 * from scratch (Idle phase). In the test environment, the SPA stays mounted, so
 * we reset the checkout phase to Idle before navigating so the BillingContext's
 * checkout_return detection can transition to Polling — matching production behavior.
 */
function RedirectListener() {
  const navigate = useNavigate();
  const { resetCheckout } = useBillingContext();

  React.useEffect(() => {
    function handle3DSRedirect(e: Event) {
      const { sessionId, redirectUrl } = (e as CustomEvent<{ sessionId: string; redirectUrl: string }>).detail;

      // In production, a 3DS redirect causes a full page navigation away from the SPA.
      // When the user returns with checkout_return query params, the app re-mounts
      // from scratch (Idle phase). In the test environment, the SPA stays mounted, so
      // we simulate this by resetting to Idle before navigating so that
      // BillingContext's checkout_return detection can transition to Polling — matching
      // production behavior.
      resetCheckout();

      const url = new URL(redirectUrl, window.location.origin);
      url.searchParams.set("checkout_return", "1");
      url.searchParams.set("session_id", sessionId);
      navigate(url.pathname + url.search);
    }

    window.addEventListener("checkout3DSRedirect", handle3DSRedirect);
    return () => window.removeEventListener("checkout3DSRedirect", handle3DSRedirect);
  }, [navigate, resetCheckout]);

  return null;
}

// ============================================================================
// Render Helpers
// ============================================================================

/**
 * Renders a component wrapped with billing providers AND Refine provider for e2e testing
 * Uses vitest-browser-react for Playwright integration
 * This includes the full Refine setup needed for hooks like useCustom to work
 */
export function renderWithBilling(element: ReactElement) {
  // Ensure Module Federation runtime is initialized
  initModuleFederation();

  const queryClient = createTestQueryClient();
  const testDataProvider = dataProvider(baseURL, false);

  return render(
    <FrameworkProvider
      appName="billing-e2e-test"
      configure={(builder) => builder}
    >
      <QueryClientProvider client={queryClient}>
        <Refine
          authProvider={mockAuthProvider}
          dataProvider={{ [DATA_PROVIDER_NAME]: testDataProvider, default: testDataProvider }}
          notificationProvider={mockNotificationProvider}
          options={{
            syncWithLocation: false,
            warnWhenUnsavedChanges: false,
            projectId: "billing-e2e-test",
          }}>
          <MemoryRouter>
            <BillingProvider>
              <FragmentQueueProvider>
                <RedirectListener />
                {element}
              </FragmentQueueProvider>
            </BillingProvider>
          </MemoryRouter>
        </Refine>
      </QueryClientProvider>
    </FrameworkProvider>
  );
}

/**
 * Renders and waits for framework initialization to complete
 * Use this for tests that need the framework fully initialized before making assertions
 */
export async function renderWithBillingAndWait(element: ReactElement) {
  const result = renderWithBilling(element);
  await waitForFrameworkInit();
  return result;
}

/**
 * Renders a component with ONLY billing providers (no Refine)
 * Use this for testing pure billing UI components that don't make API calls
 */
export function renderWithBillingOnly(element: ReactElement) {
  return render(
    <MemoryRouter>
      <BillingProvider>
        <FragmentQueueProvider>
          <RedirectListener />
          {element}
        </FragmentQueueProvider>
      </BillingProvider>
    </MemoryRouter>
  );
}

/**
 * Test helper component that exposes billing context controls
 * Use this to manipulate checkout state in tests
 */
export function TestPhaseControl() {
  // This will be imported from test files
  return null;
}

// ============================================================================
// Wait Helpers
// ============================================================================

/**
 * Wait for framework initialization to complete
 * FrameworkProvider dispatches 'portal:boot:complete' event when ready
 */
export async function waitForFrameworkInit(timeout: number = 10000): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Framework initialization timeout after ${timeout}ms`));
    }, timeout);

    const handleBootComplete = (event: Event) => {
      clearTimeout(timer);
      document.removeEventListener("portal:boot:complete", handleBootComplete);
      // Ensure the event indicates success
      const customEvent = event as CustomEvent<{success: boolean}>;
      if (!customEvent.detail?.success) {
        reject(new Error("Framework initialization failed"));
        return;
      }
      // Small extra delay to ensure state propagation
      setTimeout(resolve, 50);
    };

    document.addEventListener("portal:boot:complete", handleBootComplete);
  });
}

/**
 * Wait for subscription management data to load
 * This includes the capabilities API which is conditionally enabled based on subscription status
 */
export async function waitForManagementData(timeout: number = 5000): Promise<void> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const hasOperations =
      document.body.textContent?.includes("Cancel Subscription") ||
      document.body.textContent?.includes("Change Plan") ||
      document.body.textContent?.includes("Manage in Portal") ||
      document.body.textContent?.includes("Pause Subscription");

    if (hasOperations) {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  throw new Error(`Management data did not load within ${timeout}ms`);
}

/**
 * Wait for a condition to be true
 */
export async function waitFor(
  condition: () => boolean | Promise<boolean>,
  timeout: number = 5000,
  interval: number = 100,
): Promise<void> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }

  throw new Error(`Timeout waiting for condition after ${timeout}ms`);
}

/**
 * Wait for checkout phase to reach a specific state
 */
export async function waitForCheckoutPhase(
  phaseElement: { textContent: string | null },
  expectedPhase: CheckoutPhase,
  timeout: number = 5000,
): Promise<void> {
  await waitFor(() => phaseElement.textContent === expectedPhase, timeout, 50);
}

// ============================================================================
// Event Helpers
// ============================================================================

/**
 * Dispatch a payment event on the window
 */
export function dispatchPaymentEvent(
  eventType: "paymentCompleted" | "paymentSuccess" | "paymentCanceled" | "paymentError",
  detail?: Record<string, unknown>,
): void {
  if (eventType === "paymentError" && detail?.error) {
    window.dispatchEvent(
      new CustomEvent(eventType, {
        bubbles: true,
        detail: { error: detail.error },
      }),
    );
  } else {
    window.dispatchEvent(
      new CustomEvent(eventType, {
        bubbles: true,
        detail: detail ?? null,
      }),
    );
  }
}

/**
 * Dispatch a message event (for iframe communication)
 */
export function dispatchMessageEvent(data: Record<string, unknown>, origin: string = window.location.origin): void {
  window.dispatchEvent(
    new MessageEvent("message", {
      data,
      origin,
      source: window,
    }),
  );
}

// ============================================================================
// Common Test Scenarios
// ============================================================================

/**
 * Sets up a standard new subscription scenario
 */
export function setupNewSubscriptionScenario(fixture: TestFixture): void {
  // Note: Don't call fixture.reset() here - the fixture is already fresh from beforeEach
  // Calling reset would break the reference: fixture.state would point to old object, handlers to new

  // Set up plans
  fixture.state.plans = [
    {
      id: 1,
      name: "Free",
      description: "Free tier",
      currency: "USD",
      features: ["Basic feature"],
      pricing_periods: [],
    },
    {
      id: 2,
      name: "Pro",
      description: "Professional tier",
      currency: "USD",
      features: ["Premium feature A", "Premium feature B"],
      pricing_periods: [
        { id: 1, cadence: "monthly", price_usd: 19.99, quota_plan_id: 1 },
        { id: 2, cadence: "yearly", price_usd: 199.99, quota_plan_id: 2 },
      ],
    },
  ];

  // Set up gateways
  fixture.state.gateways = [
    {
      id: "stripe",
      name: "Stripe",
      is_active: true,
      logo_url: "/billing/gateway-logos/stripe.svg",
      description: "Credit card payments via Stripe",
      abilities: {
        checkout: true,
        session_status: true,
        customer_portal: true,
      },
    },
    {
      id: "atlos",
      name: "Atlos",
      is_active: true,
      logo_url: "/billing/gateway-logos/atlos.svg",
      description: "Crypto payments via Atlos",
      abilities: {
        checkout: true,
        session_status: false,
        customer_portal: false,
      },
    },
  ];

  // No active subscription
  fixture.state.subscription = {
    is_subscribed: false,
    gateway_type: undefined,
    pricing_plan_period_id: undefined,
    updated_at: undefined,
    created_at: undefined,
    paused_at: undefined,
    will_cancel_at: undefined,
  };

  // Default management capabilities (not subscribed, so not used)
  fixture.state.managementCapabilities = {
    management_mode: "api",
    operations: {},
    admin_operations: {},
  };
}

/**
 * Sets up a scenario with an active subscription
 */
export function setupActiveSubscriptionScenario(fixture: TestFixture, gateway: "stripe" | "atlos" = "stripe"): void {
  // Note: Don't call fixture.reset() here - fixture is already fresh from beforeEach

  fixture.state.plans = [
    {
      id: 1,
      name: "Pro",
      description: "Professional tier",
      currency: "USD",
      features: ["Premium feature A", "Premium feature B"],
      pricing_periods: [
        { id: 1, cadence: "monthly", price_usd: 19.99, quota_plan_id: 1 },
      ],
    },
  ];

  fixture.state.gateways = [
    {
      id: gateway,
      name: gateway === "stripe" ? "Stripe" : "Atlos",
      is_active: true,
      logo_url: `/billing/gateway-logos/${gateway}.svg`,
      description: gateway === "stripe" ? "Credit card payments via Stripe" : "Crypto payments via Atlos",
      abilities: {
        checkout: true,
        session_status: gateway === "stripe",
        customer_portal: gateway === "stripe",
      },
    },
  ];

  fixture.state.subscription = {
    is_subscribed: true,
    gateway_type: gateway,
    pricing_plan_period_id: 1,
    updated_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    will_cancel_at: undefined,
    paused_at: undefined,
  };

  fixture.state.managementCapabilities = {
    management_mode: gateway === "stripe" ? "portal" : "api",
    operations: {
      cancel: true,
      change_plan: true,
      pause: gateway === "atlos",
      resume: gateway === "atlos",
      customer_portal: gateway === "stripe",
    },
    admin_operations: {},
  };
}

// ============================================================================
// Type Declarations for Window
// ============================================================================

declare global {
  interface Window {
    __testCheckoutLoaded?: boolean;
    __autoRedirect?: boolean;
    __billingTestFixture?: TestFixture;
  }
}
