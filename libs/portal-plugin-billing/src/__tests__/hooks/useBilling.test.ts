import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "vitest-browser-react";

vi.mock("@refinedev/core", () => ({
  useCustom: vi.fn(),
}));

vi.mock("@tanstack/react-query", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-query")>();
  return {
    ...actual,
    useQueryClient: vi.fn(() => ({
      invalidateQueries: vi.fn(),
    })),
  };
});

vi.mock("@lumeweb/portal-framework-auth", () => ({
  DATA_PROVIDER_NAME: "dashboard",
}));

vi.mock("@/hooks/useSubscriptionStatus", () => ({
  useSubscriptionStatus: vi.fn(),
  SUBSCRIPTION_QUERY_KEY: ["dashboard", "/account/billing/subscription"],
  getAuthHeaders: vi.fn(() => ({})),
}));

vi.mock("@/hooks/useSubscriptionEventFeed", () => ({
  useSubscriptionEventFeed: vi.fn(() => ({
    on: vi.fn(() => vi.fn()),
  })),
}));

vi.mock("@/hooks/useManagementCapabilities", () => ({
  useManagementCapabilities: vi.fn(),
}));

vi.mock("@/hooks/usePricingPlans", () => ({
  usePricingPlans: vi.fn(),
}));

vi.mock("@/hooks/useCredits", () => ({
  useCredits: vi.fn(),
}));

import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { useManagementCapabilities } from "@/hooks/useManagementCapabilities";
import { usePricingPlans } from "@/hooks/usePricingPlans";
import { useCredits } from "@/hooks/useCredits";
import { useBilling } from "@/hooks/useBilling";

const mockUseSubscriptionStatus = vi.mocked(useSubscriptionStatus);
const mockUseManagementCapabilities = vi.mocked(useManagementCapabilities);
const mockUsePricingPlans = vi.mocked(usePricingPlans);
const mockUseCredits = vi.mocked(useCredits);

describe("useBilling", () => {
  const mockSubscriptionData = { is_subscribed: true, gateway_type: "stripe", pricing_plan_period_id: 1, will_cancel_at: null };
  const mockPlansData = { plans: [] };

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseSubscriptionStatus.mockReturnValue({
      data: mockSubscriptionData,
      isReady: true,
      isBusy: false,
      hasError: false,
      error: null,
      result: { result: { data: mockSubscriptionData }, query: { isLoading: false, isFetching: false, isError: false, isSuccess: true } },
    } as any);

    mockUseManagementCapabilities.mockReturnValue({
      data: { management_mode: "portal", operations: { cancel: true }, admin_operations: {} },
      isLoading: false,
      isError: false,
      canCancel: true,
      canChangePlan: false,
      canPause: false,
      canResume: false,
      operations: { cancel: true },
      adminOperations: {},
    } as any);

    mockUsePricingPlans.mockReturnValue({
      data: mockPlansData,
      isReady: true,
      isBusy: false,
      hasError: false,
      error: null,
      result: { result: { data: mockPlansData }, query: { isLoading: false, isFetching: false, isError: false, isSuccess: true } },
    } as any);

    mockUseCredits.mockReturnValue({
      balance: { data: { balance: "100.00", currency: "USD" }, isLoading: false, isError: false },
      history: { data: [], total: 0, isLoading: false, isError: false },
    } as any);
  });

  it("composes all sub-hooks", async () => {
    const { result, act } = await renderHook(() => useBilling());

    expect(mockUseSubscriptionStatus).toHaveBeenCalled();
    expect(mockUseManagementCapabilities).toHaveBeenCalled();
    expect(mockUsePricingPlans).toHaveBeenCalled();
    expect(mockUseCredits).toHaveBeenCalled();
  });

  it("passes subscription status to useManagementCapabilities", async () => {
    mockUseSubscriptionStatus.mockReturnValue({
      data: mockSubscriptionData,
      isReady: true,
      isBusy: false,
      hasError: false,
      error: null,
      result: { result: { data: mockSubscriptionData }, query: { isLoading: false, isFetching: false, isError: false, isSuccess: true } },
    } as any);

    const { result, act } = await renderHook(() => useBilling());

    expect(mockUseManagementCapabilities).toHaveBeenCalledWith(
      {},
      { isSubscribed: true },
    );
  });

  it("passes isSubscribed: undefined when subscription data is not available", async () => {
    mockUseSubscriptionStatus.mockReturnValue({
      data: undefined,
      isReady: false,
      isBusy: false,
      hasError: false,
      error: null,
      result: { result: { data: undefined }, query: { isLoading: false, isFetching: false, isError: false, isSuccess: false } },
    } as any);

    const { result, act } = await renderHook(() => useBilling());

    expect(mockUseManagementCapabilities).toHaveBeenCalledWith(
      {},
      { isSubscribed: undefined },
    );
  });

  it("returns subscription data", async () => {
    const { result, act } = await renderHook(() => useBilling());
    expect(result.current.subscription.data).toBeDefined();
    expect(result.current.subscription.isLoading).toBe(false);
  });

  it("returns capabilities with computed booleans", async () => {
    const { result, act } = await renderHook(() => useBilling());
    expect(result.current.capabilities.canCancel).toBe(true);
    expect(result.current.capabilities.canChangePlan).toBe(false);
  });

  it("returns plans data", async () => {
    const { result, act } = await renderHook(() => useBilling());
    expect(result.current.plans.data).toBeDefined();
  });

  it("returns credit data", async () => {
    const { result, act } = await renderHook(() => useBilling());
    expect(result.current.credits.balance.data).toBeDefined();
    expect(result.current.credits.history.data).toBeDefined();
  });

  it("reports isLoading when any sub-hook is loading", async () => {
    mockUseSubscriptionStatus.mockReturnValue({
      data: undefined,
      isReady: false,
      isBusy: true,
      hasError: false,
      error: null,
      result: { result: { data: undefined }, query: { isLoading: true, isFetching: false, isError: false, isSuccess: false } },
    } as any);

    const { result, act } = await renderHook(() => useBilling());
    expect(result.current.isLoading).toBe(true);
  });

  it("reports isError when any sub-hook errors", async () => {
    mockUsePricingPlans.mockReturnValue({
      data: undefined,
      isReady: false,
      isBusy: false,
      hasError: true,
      error: new Error("test") as any,
      result: { result: { data: undefined }, query: { isLoading: false, isFetching: false, isError: true, isSuccess: false } },
    } as any);

    const { result, act } = await renderHook(() => useBilling());
    expect(result.current.isError).toBe(true);
  });
});
