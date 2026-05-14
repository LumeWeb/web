// MSW Request Handlers for Billing E2E Tests
// Handles all 9+ API endpoints with configurable scenario state

import { http, HttpResponse, delay } from "msw";
import type { PathParams } from "msw";
import { createResponse } from "better-sse";

import type {
  CheckoutSessionStatusResponse,
  CheckoutUIResponse,
  GatewayListResponse,
  ManagementCapabilitiesResponse,
  ManagementResultResponse,
  PublicPricingPlansListResponse,
  SubscriptionStatusResponse,
  BalanceResponse,
} from "@/types/subscription";
import { BillingSSEEventType } from "@/types/subscription";

import type { PublicPricingPlanResponse } from "@lumeweb/portal-sdk";

import { getCurrentScenarioState, DEFAULT_PORTAL_META } from "./msw-helpers";
import {
  createStripeCheckoutFragments,
  createStripe3DSFragments,
  createAtlosCheckoutFragments,
  DUMMY_GATEWAY_LOGO_SVG,
} from "./mock-fragments";

// ============================================================================
// Type Definitions
// ============================================================================

interface CheckoutUIParams extends PathParams {
  planId: string;
}

interface SessionStatusParams extends PathParams {
  sessionId: string;
}

interface GatewayParams extends PathParams {
  gateway: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

function getSearchParam(url: URL, name: string): string | null {
  return url.searchParams.get(name);
}

function createErrorResponse(message: string, status: number = 400) {
  return HttpResponse.json({ error: message }, { status });
}

function createSuccessResponse<T extends object>(data: T, status: number = 200) {
  return HttpResponse.json(data, { status });
}

// ============================================================================
// API Endpoint Handlers
// ============================================================================

/**
 * GET /api/meta - Returns portal meta for framework init
 */
export const portalMetaHandler = http.get(
  "*/api/meta",
  async () => {
    await delay(50);
    return createSuccessResponse(DEFAULT_PORTAL_META);
  },
);

/**
 * GET /billing/plans - Returns list of pricing plans
 */
export const billingPlansHandler = http.get(
  "*/billing/plans",
  async () => {
    const scenarioState = getCurrentScenarioState();
    await delay(100);
    const response: PublicPricingPlansListResponse = {
      data: scenarioState.plans as PublicPricingPlanResponse[],
      total: scenarioState.plans.length,
    };
    return createSuccessResponse(response);
  },
);

/**
 * GET /billing/gateways - Returns list of payment gateways
 */
export const billingGatewaysHandler = http.get(
  "*/billing/gateways",
  async () => {
    const scenarioState = getCurrentScenarioState();
    await delay(100);
    return createSuccessResponse<GatewayListResponse>(scenarioState.gateways);
  },
);

/**
 * GET /billing/gateway-logos/:gateway.svg - Returns dummy SVG logo
 */
export const gatewayLogoHandler = http.get(
  "*/billing/gateway-logos/*.svg",
  async () => {
    await delay(50);
    return new HttpResponse(DUMMY_GATEWAY_LOGO_SVG, {
      headers: {
        "Content-Type": "image/svg+xml",
      },
    });
  },
);

/**
 * POST /billing/gateway-logos/:gateway.svg - Dummy logo handler (some frameworks do HEAD as POST)
 */
export const gatewayLogoOptionsHandler = http.all(
  "*/billing/gateway-logos/*",
  async ({ request }: { request: Request }) => {
    if (request.method === "OPTIONS" || request.method === "HEAD") {
      return new HttpResponse(null, {
        headers: {
          "Content-Type": "image/svg+xml",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }
    return undefined;
  },
);

/**
 * GET /account/billing/subscription - Returns subscription status
 */
export const subscriptionStatusHandler = http.get(
  "*/account/billing/subscription",
  async () => {
    const scenarioState = getCurrentScenarioState();
    console.log("[MSW] subscription handler - is_subscribed:", scenarioState.subscription.is_subscribed, "sessionStatuses:", Array.from(scenarioState.sessionStatuses.entries()).map(([k, v]) => [k, v.status]));
    await delay(50);

    // Simulate subscription activation if we have a completed session
    const hasCompletedSession = Array.from(scenarioState.sessionStatuses.values()).some(
      (s) => s.status === "complete",
    );

    if (hasCompletedSession && !scenarioState.subscription.is_subscribed) {
      // Auto-activate subscription when session is complete
      // Find first plan that has pricing periods (not Free plan at index 0)
      const subscribedPlan = scenarioState.plans.find((p) => p.pricing_periods?.length > 0);
      const period = subscribedPlan?.pricing_periods?.[0];

      scenarioState.subscription = {
        is_subscribed: true,
        gateway_type: "stripe",
        pricing_plan_period_id: period?.id,
        updated_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        paused_at: undefined,
        will_cancel_at: undefined,
      };
    }

    return createSuccessResponse<SubscriptionStatusResponse>(scenarioState.subscription);
  },
);

/**
 * GET /account/billing/checkout/ui/:planId - Returns checkout UI fragments
 */
export const checkoutUIHandler = http.get<CheckoutUIParams>(
  "*/account/billing/checkout/ui/:planId",
  async ({ params, request }: { params: CheckoutUIParams; request: Request }) => {
    const scenarioState = getCurrentScenarioState();
    const { planId } = params;
    const url = new URL(request.url);
    const periodId = getSearchParam(url, "period_id");
    const gateway = getSearchParam(url, "gateway");

    await delay(200);

    console.log("[MSW checkoutUI] shouldFailCheckout:", scenarioState.shouldFailCheckout);
    if (scenarioState.shouldFailCheckout) {
      return createErrorResponse("Checkout API error", 500);
    }

    // Check for pre-configured response
    const cacheKey = `${planId}:${periodId}:${gateway}`;
    const cachedResponse = scenarioState.checkoutResponses.get(cacheKey);
    if (cachedResponse) {
      return createSuccessResponse<CheckoutUIResponse>(cachedResponse);
    }

    // Generate default fragments based on gateway
    const sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    let fragments: CheckoutUIResponse["fragments"] = [];

    if (scenarioState.simulate3DSRedirect) {
      // 3DS redirect flow
      const returnUrl = `${url.origin}/account/billing/subscription`;
      fragments = createStripe3DSFragments(sessionId, returnUrl);
    } else if (gateway === "stripe" || (!gateway && scenarioState.gateways.some((g) => g.id === "stripe"))) {
      // Default to Stripe checkout
      fragments = createStripeCheckoutFragments(sessionId);
    } else if (gateway === "atlos") {
      // Atlos checkout
      fragments = createAtlosCheckoutFragments(sessionId);
    } else {
      // Generic fallback
      fragments = createStripeCheckoutFragments(sessionId);
    }

    const response: CheckoutUIResponse = {
      fragments,
      session_id: sessionId,
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    };

    // Cache for later
    scenarioState.checkoutResponses.set(cacheKey, response);

    return createSuccessResponse<CheckoutUIResponse>(response);
  },
);

/**
 * GET /account/billing/checkout/session/:sessionId/status - Returns session status
 */
export const sessionStatusHandler = http.get<SessionStatusParams>(
  "*/account/billing/checkout/session/:sessionId/status",
  async ({ params }: { params: SessionStatusParams }) => {
    const scenarioState = getCurrentScenarioState();
    const { sessionId } = params;

    await delay(100);

    if (scenarioState.shouldFailSessionStatus) {
      return createErrorResponse("Session status error", 500);
    }

    // Check for cached status
    let status = scenarioState.sessionStatuses.get(sessionId);

    if (!status) {
      // Default to checking if session exists
      const hasSession = Array.from(scenarioState.checkoutResponses.values()).some(
        (r) => r.session_id === sessionId,
      );

      if (!hasSession) {
        return createErrorResponse("Session not found", 404);
      }

      // Auto-complete simulating successful payment
      const sessionStatus: CheckoutSessionStatusResponse = {
        status: scenarioState.simulateExpiredSession ? "expired" : "complete",
        session_id: sessionId,
        customer_email: "test@example.com",
        user_id: 1,
      };

      scenarioState.sessionStatuses.set(sessionId, sessionStatus);
      status = sessionStatus;
    }

    return createSuccessResponse<CheckoutSessionStatusResponse>(status);
  },
);

/**
 * GET /account/billing/checkout/session/:sessionId/return - Returns from 3DS redirect
 */
export const sessionReturnHandler = http.get<SessionStatusParams>(
  "*/account/billing/checkout/session/:sessionId/return",
  async ({ params }: { params: SessionStatusParams }) => {
    const scenarioState = getCurrentScenarioState();
    const { sessionId } = params;

    await delay(150);

    // Mark session as complete on return from 3DS
    const completeStatus: CheckoutSessionStatusResponse = {
      status: "complete",
      session_id: sessionId,
      customer_email: "test@example.com",
      user_id: 1,
    };
    scenarioState.sessionStatuses.set(sessionId, completeStatus);

    return createSuccessResponse<CheckoutSessionStatusResponse>(completeStatus);
  },
);

/**
 * GET /account/billing/management/capabilities - Returns management capabilities
 */
export const managementCapabilitiesHandler = http.get(
  "*/account/billing/management/capabilities",
  async ({ request }) => {
    const scenarioState = getCurrentScenarioState();
    await delay(50);
    console.log("[MSW] Capabilities request:", request.url);
    console.log("[MSW] Returning capabilities:", scenarioState.managementCapabilities);
    return createSuccessResponse<ManagementCapabilitiesResponse>(scenarioState.managementCapabilities);
  },
);

/**
 * POST /account/billing/management - Executes management actions
 */
export const managementActionHandler = http.post(
  "*/account/billing/management",
  async ({ request }: { request: Request }) => {
    const scenarioState = getCurrentScenarioState();
    await delay(200);

    if (scenarioState.shouldFailManagementAction) {
      return createErrorResponse("Management action failed", 500);
    }

    let body: Record<string, unknown>;
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      body = {};
    }

    const operation = body.operation as string;

    // Check for pre-configured result
    const cachedResult = scenarioState.managementActionResults.get(operation);
    if (cachedResult) {
      return createSuccessResponse<ManagementResultResponse>(cachedResult);
    }

    const mode = scenarioState.managementCapabilities.management_mode;

    // Generate default response based on operation and gateway type
    let result: ManagementResultResponse;

    switch (operation) {
      case "customer_portal":
        if (mode === "portal") {
          result = {
            action: "redirect",
            url: `https://billing.stripe.com/session/test_portal_${Date.now()}`,
            status: "success",
            can_abort: false,
            requires_confirmation: false,
          };
        } else {
          result = {
            action: "unsupported",
            status: "unsupported",
            can_abort: false,
            requires_confirmation: false,
          };
        }
        break;

      case "cancel":
        if (mode === "portal") {
          result = {
            action: "redirect",
            url: `https://billing.stripe.com/session/test_cancel_${Date.now()}`,
            status: "success",
            can_abort: false,
            requires_confirmation: false,
          };
        } else {
          // API mode - simulate successful cancellation
          result = {
            action: "api_required",
            api_endpoint: {
              method: "post",
              path: "/api/billing/gateway/atlos/cancel",
            },
            status: "success",
            can_abort: false,
            requires_confirmation: false,
          };
        }
        break;

      case "pause":
      case "resume":
        if (mode === "api") {
          result = {
            action: "api_required",
            api_endpoint: {
              method: "post",
              path: `/api/billing/gateway/atlos/${operation}`,
            },
            status: "success",
            can_abort: false,
            requires_confirmation: false,
          };
        } else {
          result = {
            action: "unsupported",
            status: "unsupported",
            can_abort: false,
            requires_confirmation: false,
          };
        }
        break;

      case "change_plan":
        if (mode === "portal") {
          result = {
            action: "redirect",
            url: `https://billing.stripe.com/session/test_change_${Date.now()}`,
            status: "success",
            can_abort: false,
            requires_confirmation: false,
          };
        } else {
          // Simulate checkout_required for plan upgrade
          result = {
            action: "checkout_required",
            status: "success",
            can_abort: false,
            requires_confirmation: false,
          };
        }
        break;

      default:
        result = {
          action: "unsupported",
          status: "unsupported",
          can_abort: false,
          requires_confirmation: false,
        };
    }

    return createSuccessResponse<ManagementResultResponse>(result);
  },
);

/**
 * POST /api/billing/gateway/:gateway/* - Simulated gateway API calls (api_required follow-up)
 */
export const gatewayAPIHandler = http.post<GatewayParams>(
  "*/api/billing/gateway/:gateway/*",
  async ({ params, request }: { params: GatewayParams; request: Request }) => {
    const scenarioState = getCurrentScenarioState();
    const { gateway } = params;
    const url = new URL(request.url);
    const pathParts = url.pathname.split("/");
    const operation = pathParts[pathParts.length - 1];

    await delay(300);

    // Simulate successful operation
    if (operation === "cancel") {
      scenarioState.subscription = {
        ...scenarioState.subscription,
        will_cancel_at: new Date().toISOString(),
      };
    } else if (operation === "pause") {
      scenarioState.subscription = {
        ...scenarioState.subscription,
        paused_at: new Date().toISOString(),
      };
    } else if (operation === "resume") {
      scenarioState.subscription = {
        ...scenarioState.subscription,
        paused_at: undefined,
      };
    }

    return createSuccessResponse<ManagementResultResponse>({
      action: "show_ui",
      status: "success",
      can_abort: false,
      requires_confirmation: false,
    });
  },
);

/**
 * GET /account/billing/balance - Returns credit balance
 */
export const creditsHandler = http.get(
  "*/account/billing/balance",
  async () => {
    const scenarioState = getCurrentScenarioState();
    await delay(100);
    return createSuccessResponse<BalanceResponse>(scenarioState.balance);
  },
);

/**
 * GET /billing-credits - Returns credit history (for useList hook)
 */
export const creditsListHandler = http.get(
  "*/billing-credits*",
  async () => {
    await delay(100);
    return createSuccessResponse<{
      data: Array<Record<string, unknown>>;
      total: number;
    }>({
      data: [
        {
          id: "credit_1",
          amount: "10.00",
          description: "Welcome credit",
          created_at: new Date().toISOString(),
        },
        {
          id: "credit_2",
          amount: "5.00",
          description: "Referral bonus",
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ],
      total: 2,
    });
  },
);

/**
 * GET /account/billing/subscription/events - SSE event stream
 */
export const sseEventsHandler = http.get(
  "*/account/billing/subscription/events",
  async ({ request }) => {
    const scenarioState = getCurrentScenarioState();

    return createResponse(
      request,
      { keepAlive: 2000 },
      (session) => {
        // Drain any pre-queued events
        while (scenarioState.sseEvents.length > 0) {
          const event = scenarioState.sseEvents.shift();
          if (event) {
            session.push(event.data, event.type);
          }
        }

        // Poll for new events queued after connection (enables queueSSEEvent)
        const pollInterval = setInterval(() => {
          while (scenarioState.sseEvents.length > 0) {
            const event = scenarioState.sseEvents.shift();
            if (event) {
              session.push(event.data, event.type);
            }
          }

          // Auto-send subscription.active when we have completed session
          const hasCompletedSession = Array.from(scenarioState.sessionStatuses.values()).some(
            (s) => s.status === "complete",
          );

          if (hasCompletedSession) {
            session.push(
              { created_at: new Date().toISOString() },
              BillingSSEEventType.SubscriptionActive,
            );
            // Only send once per connection
            clearInterval(pollInterval);
          }
        }, 200);

        // Close session after 5 seconds
        setTimeout(() => {
          clearInterval(pollInterval);
        }, 5000);

        session.once("disconnected", () => {
          clearInterval(pollInterval);
        });
      },
    );
  },
);

// ============================================================================
// Handler Collections
// ============================================================================

/**
 * All billing handlers for e2e tests
 */
export const billingHandlers = [
  portalMetaHandler,
  billingPlansHandler,
  billingGatewaysHandler,
  gatewayLogoHandler,
  gatewayLogoOptionsHandler,
  subscriptionStatusHandler,
  checkoutUIHandler,
  sessionStatusHandler,
  sessionReturnHandler,
  managementCapabilitiesHandler,
  managementActionHandler,
  gatewayAPIHandler,
  creditsHandler,
  creditsListHandler,
  sseEventsHandler,
];

/**
 * Core handlers for basic checkout flow testing
 */
export const coreBillingHandlers = [
  portalMetaHandler,
  billingPlansHandler,
  billingGatewaysHandler,
  gatewayLogoHandler,
  subscriptionStatusHandler,
  checkoutUIHandler,
  sessionStatusHandler,
];

/**
 * Management handlers for subscription management testing
 */
export const managementHandlers = [
  managementCapabilitiesHandler,
  managementActionHandler,
  gatewayAPIHandler,
];

/**
 * Event handlers for SSE testing
 */
export const eventHandlers = [sseEventsHandler];
