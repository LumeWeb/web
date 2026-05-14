// Mock Data Factories for Billing E2E Tests
// Factory functions with override patterns for flexible test scenarios

import type {
  CheckoutUIFragment,
  CheckoutUIResponse,
  GatewayPublicInfo,
  ManagementCapabilitiesResponse,
  ManagementCapabilitiesResponseOperations,
  PublicPricingPlanPeriodDTO,
  SubscriptionStatusResponse,
  CheckoutSessionStatusResponse,
  BalanceResponse,
  ManagementResultResponse,
} from "@/types/subscription";

import type { GatewayAbilities, PublicPricingPlanResponse } from "@lumeweb/portal-sdk";

import { SessionStatus, ManagementAction } from "@/types/subscription";

// ============================================================================
// Portal Meta
// ============================================================================

export const DEFAULT_PORTAL_META = {
  domain: "localhost:3000",
  version: "1.0.0",
  plugins: {},
};

// Counter for stable IDs across tests
let idCounter = 0;

export function resetIdCounter(): void {
  idCounter = 0;
}

function nextId(): number {
  return ++idCounter;
}

function generateUUID(): string {
  return `mock-uuid-${nextId()}`;
}

function generateSessionId(): string {
  return `sess_${Date.now()}_${nextId()}`;
}

// ============================================================================
// Gateway Factories
// ============================================================================

export interface MockGatewayOverrides {
  id?: string;
  name?: string;
  is_active?: boolean;
  logo_url?: string | null;
  description?: string;
  abilities?: Partial<GatewayAbilities>;
}

export function createMockGateway(overrides: MockGatewayOverrides = {}): GatewayPublicInfo {
  const id = overrides.id ?? `gateway-${nextId()}`;
  const name = overrides.name ?? "Mock Gateway";

  return {
    id,
    name,
    is_active: overrides.is_active ?? true,
    logo_url: overrides.logo_url ?? `/billing/gateway-logos/${id}.svg`,
    description: overrides.description ?? `Payment gateway ${name}`,
    abilities: {
      checkout: true,
      session_status: true,
      customer_portal: true,
      ...overrides.abilities,
    },
  };
}

export function createStripeGateway(overrides: MockGatewayOverrides = {}): GatewayPublicInfo {
  return createMockGateway({
    id: "stripe",
    name: "Stripe",
    abilities: {
      checkout: true,
      session_status: true,
      customer_portal: true,
    },
    ...overrides,
  });
}

export function createAtlosGateway(overrides: MockGatewayOverrides = {}): GatewayPublicInfo {
  return createMockGateway({
    id: "atlos",
    name: "Atlos",
    abilities: {
      checkout: true,
      session_status: false,
      customer_portal: false,
    },
    ...overrides,
  });
}

// ============================================================================
// Pricing Plan Factories
// ============================================================================

export interface MockPricingPlanPeriodOverrides {
  id?: number;
  cadence?: string;
  price_usd?: number;
  quota_plan_id?: number;
}

export function createMockPricingPlanPeriod(
  overrides: MockPricingPlanPeriodOverrides = {},
): PublicPricingPlanPeriodDTO {
  return {
    id: overrides.id ?? nextId(),
    cadence: overrides.cadence ?? "monthly",
    price_usd: overrides.price_usd ?? 10.0,
    quota_plan_id: overrides.quota_plan_id ?? nextId(),
  };
}

export interface MockPricingPlanOverrides {
  id?: number;
  name?: string;
  description?: string;
  features?: string[];
  currency?: string;
  pricing_periods?: PublicPricingPlanPeriodDTO[];
}

export function createMockPricingPlan(
  overrides: MockPricingPlanOverrides = {},
): PublicPricingPlanResponse {
  const id = overrides.id ?? nextId();

  return {
    id,
    name: overrides.name ?? `Plan ${id}`,
    description: overrides.description ?? `Description for plan ${id}`,
    // Always provide features array to match SDK type
    features: overrides.features ?? ["Feature A", "Feature B", "Feature C"],
    currency: overrides.currency ?? "USD",
    pricing_periods: overrides.pricing_periods ?? [
      createMockPricingPlanPeriod({ cadence: "monthly", price_usd: 10.0 }),
      createMockPricingPlanPeriod({ cadence: "yearly", price_usd: 100.0 }),
    ],
  };
}

export function createMockPricingPlansList(count: number = 3): PublicPricingPlanResponse[] {
  return Array.from({ length: count }, (_, i) =>
    createMockPricingPlan({
      id: i + 1,
      name: `Plan ${i + 1}`,
    })
  );
}

// ============================================================================
// Subscription Status Factories
// ============================================================================

export interface MockSubscriptionStatusOverrides {
  is_subscribed?: boolean;
  gateway_type?: string | undefined;
  paused_at?: string | undefined;
  pricing_plan_period_id?: number | undefined;
  updated_at?: string | undefined;
  will_cancel_at?: string | undefined;
  created_at?: string | undefined;
}

export function createMockSubscriptionStatus(
  overrides: MockSubscriptionStatusOverrides = {},
): SubscriptionStatusResponse {
  const isSubscribed = overrides.is_subscribed ?? false;

  return {
    is_subscribed: isSubscribed,
    gateway_type: overrides.gateway_type ?? (isSubscribed ? "stripe" : undefined),
    pricing_plan_period_id: overrides.pricing_plan_period_id,
    updated_at: overrides.updated_at ?? (isSubscribed ? new Date().toISOString() : undefined),
    will_cancel_at: overrides.will_cancel_at,
    created_at: overrides.created_at ?? (isSubscribed ? new Date().toISOString() : undefined),
    paused_at: overrides.paused_at,
  };
}

// ============================================================================
// Management Capabilities Factories
// ============================================================================

export interface MockManagementCapabilitiesOverrides {
  management_mode?: "portal" | "api";
  operations?: Partial<ManagementCapabilitiesResponseOperations>;
  admin_operations?: Record<string, boolean>;
}

export function createMockManagementCapabilities(
  overrides: MockManagementCapabilitiesOverrides = {},
): ManagementCapabilitiesResponse {
  const mode = overrides.management_mode ?? "api";

  return {
    management_mode: mode,
    operations: {
      cancel: true,
      change_plan: true,
      customer_portal: mode === "portal",
      pause: mode === "api",
      resume: mode === "api",
      ...overrides.operations,
    },
    admin_operations: overrides.admin_operations ?? {},
  };
}

// ============================================================================
// Checkout UI Response Factories
// ============================================================================

export interface MockCheckoutUIResponseOverrides {
  fragments?: CheckoutUIFragment[];
  session_id?: string;
  expires_at?: string;
}

export function createMockCheckoutUIResponse(
  overrides: MockCheckoutUIResponseOverrides = {},
): CheckoutUIResponse {
  return {
    fragments: overrides.fragments ?? [],
    session_id: overrides.session_id ?? generateSessionId(),
    expires_at: overrides.expires_at ?? new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  };
}

// ============================================================================
// Session Status Factories
// ============================================================================

export interface MockSessionStatusOverrides {
  status?: string;
  session_id?: string;
  customer_email?: string;
  user_id?: number;
}

export function createMockSessionStatus(
  overrides: MockSessionStatusOverrides = {},
): CheckoutSessionStatusResponse {
  return {
    status: overrides.status ?? SessionStatus.Open,
    session_id: overrides.session_id ?? generateSessionId(),
    customer_email: overrides.customer_email ?? "test@example.com",
    user_id: overrides.user_id ?? 1,
  };
}

// ============================================================================
// Credits/Balance Factories
// ============================================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Decimal = any;

export interface MockBalanceOverrides {
  balance?: Decimal;
  user_id?: number;
}

export function createMockBalance(overrides: MockBalanceOverrides = {}): BalanceResponse {
  return {
    balance: overrides.balance ?? { value: "0.00" },
    user_id: overrides.user_id ?? 1,
  };
}

export interface MockCreditItem {
  id: string;
  amount: string;
  description: string;
  created_at: string;
  expires_at: string | null;
}

export function createMockCreditItem(overrides: Partial<MockCreditItem> = {}): MockCreditItem {
  return {
    id: generateUUID(),
    amount: overrides.amount ?? "10.00",
    description: overrides.description ?? "Test credit",
    created_at: overrides.created_at ?? new Date().toISOString(),
    expires_at: overrides.expires_at ?? null,
  };
}

// ============================================================================
// Management Action Result Factories
// ============================================================================

export function createMockManagementRedirectResult(url: string): ManagementResultResponse {
  return {
    action: ManagementAction.Redirect,
    url,
    status: "success",
    can_abort: false,
    requires_confirmation: false,
  };
}

export function createMockManagementApiRequiredResult(
  apiEndpoint: { method: string; path: string },
): ManagementResultResponse {
  return {
    action: ManagementAction.ApiRequired,
    api_endpoint: apiEndpoint,
    status: "success",
    can_abort: false,
    requires_confirmation: false,
  };
}

export function createMockManagementCheckoutRequiredResult(data: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  checkout_link: any;
  fragments: CheckoutUIFragment[];
  gateway_name: string;
  charge_due?: string;
  credit_applied?: string;
  effective_date?: string;
}): ManagementResultResponse {
  // For checkout_required, the backend wraps the data differently
  // We store it in a way that's compatible with the SDK type
  return {
    action: ManagementAction.CheckoutRequired,
    status: "success",
    can_abort: false,
    requires_confirmation: false,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...data as any,
  };
}

export function createMockManagementUnsupportedResult(): ManagementResultResponse {
  return {
    action: ManagementAction.Unsupported,
    status: "unsupported",
    can_abort: false,
    requires_confirmation: false,
  };
}

// ============================================================================
// Scenario State Management
// ============================================================================

export interface BillingScenarioState {
  // Gateways
  gateways: GatewayPublicInfo[];

  // Plans
  plans: PublicPricingPlanResponse[];

  // Subscription
  subscription: SubscriptionStatusResponse;

  // Management capabilities
  managementCapabilities: ManagementCapabilitiesResponse;

  // Checkout
  checkoutResponses: Map<string, CheckoutUIResponse>; // Key: `${planId}:${periodId}:${gateway}`
  sessionStatuses: Map<string, CheckoutSessionStatusResponse>; // Key: sessionId

  // Management actions
  managementActionResults: Map<string, ManagementResultResponse>; // Key: operation

  // Credits
  balance: BalanceResponse;

  // SSE Events queue
  sseEvents: Array<{ type: string; data: unknown }>;

  // Scenario flags
  shouldFailCheckout: boolean;
  shouldFailSessionStatus: boolean;
  shouldFailManagementAction: boolean;
  simulateExpiredSession: boolean;
  simulate3DSRedirect: boolean;
}

export function createDefaultScenarioState(): BillingScenarioState {
  return {
    gateways: [createStripeGateway(), createAtlosGateway()],
    plans: createMockPricingPlansList(3),
    subscription: createMockSubscriptionStatus({ is_subscribed: false }),
    managementCapabilities: createMockManagementCapabilities(),
    checkoutResponses: new Map(),
    sessionStatuses: new Map(),
    managementActionResults: new Map(),
    balance: createMockBalance(),
    sseEvents: [],
    shouldFailCheckout: false,
    shouldFailSessionStatus: false,
    shouldFailManagementAction: false,
    simulateExpiredSession: false,
    simulate3DSRedirect: false,
  };
}

// Global mutable state for MSW handlers
export let scenarioState = createDefaultScenarioState();

export function resetScenarioState(): void {
  resetIdCounter();
  // Reassign the module variable
  scenarioState = createDefaultScenarioState();
}

export function setScenarioState(updates: Partial<BillingScenarioState>): void {
  Object.assign(scenarioState, updates);
}

/**
 * Get the current scenario state.
 * Use this in MSW handlers instead of importing scenarioState directly
 * to avoid stale references after resetScenarioState() is called.
 */
export function getCurrentScenarioState(): BillingScenarioState {
  return scenarioState;
}

// ============================================================================
// Test Fixture Helpers
// ============================================================================

export interface TestFixture {
  state: BillingScenarioState;
  setCheckoutResponse: (planId: string, periodId: number, gateway: string, response: CheckoutUIResponse) => void;
  setSessionStatus: (sessionId: string, status: CheckoutSessionStatusResponse) => void;
  setManagementActionResult: (operation: string, result: ManagementResultResponse) => void;
  queueSSEEvent: (type: string, data: unknown) => void;
  reset: () => void;
}

export function createTestFixture(): TestFixture {
  resetScenarioState();

  return {
    // Use a getter to always access the current scenarioState
    // This ensures fixture.state is never stale after resetScenarioState()
    get state() { return scenarioState; },

    setCheckoutResponse(planId: string, periodId: number, gateway: string, response: CheckoutUIResponse) {
      const key = `${planId}:${periodId}:${gateway}`;
      scenarioState.checkoutResponses.set(key, response);
    },

    setSessionStatus(sessionId: string, status: CheckoutSessionStatusResponse) {
      scenarioState.sessionStatuses.set(sessionId, status);
    },

    setManagementActionResult(operation: string, result: ManagementResultResponse) {
      scenarioState.managementActionResults.set(operation, result);
    },

    queueSSEEvent(type: string, data: unknown) {
      scenarioState.sseEvents.push({ type, data });
    },

    reset() {
      resetScenarioState();
    },
  };
}
