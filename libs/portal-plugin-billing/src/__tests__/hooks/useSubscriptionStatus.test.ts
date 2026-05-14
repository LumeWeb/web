import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "vitest-browser-react";

vi.mock("@refinedev/core", () => ({
  useCustom: vi.fn(),
}));

vi.mock("@lumeweb/portal-framework-auth", () => ({
  DATA_PROVIDER_NAME: "dashboard",
}));

import { useCustom } from "@refinedev/core";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import type { SubscriptionStatusResponse } from "@/types/subscription";

const mockUseCustom = vi.mocked(useCustom);

describe("useSubscriptionStatus", () => {
  const mockData: SubscriptionStatusResponse = {
    is_subscribed: true,
    gateway_type: "stripe",
    pricing_plan_period_id: 1,
    will_cancel_at: undefined,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem("jwt", "test-token");
    mockUseCustom.mockReturnValue({
      query: { isLoading: false, isFetching: false, isError: false, isSuccess: true },
      result: { data: mockData },
    } as any);
  });

  afterEach(() => {
    localStorage.removeItem("jwt");
  });

  it("calls useCustom with correct URL and method", async () => {
    const { result, act } = await renderHook(() => useSubscriptionStatus());

    expect(mockUseCustom).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "/account/billing/subscription",
        method: "get",
        dataProviderName: "dashboard",
      }),
    );
  });

  it("returns subscription data", async () => {
    const { result, act } = await renderHook(() => useSubscriptionStatus());

    expect(result.current.data).toEqual(mockData);
  });

  it("passes queryOptions through", async () => {
    const queryOptions = { staleTime: 60000 };
    const { result, act } = await renderHook(() => useSubscriptionStatus({ queryOptions }));

    expect(mockUseCustom).toHaveBeenCalledWith(
      expect.objectContaining({
        queryOptions: expect.objectContaining({ staleTime: 60000 }),
      }),
    );
  });

  it("returns loading state", async () => {
    mockUseCustom.mockReturnValue({
      query: { isLoading: true, isFetching: false, isError: false, isSuccess: false },
      result: { data: undefined },
    } as any);

    const { result, act } = await renderHook(() => useSubscriptionStatus());
    expect(result.current.isBusy).toBe(true);
    expect(result.current.isReady).toBe(false);
  });

  it("returns error state", async () => {
    mockUseCustom.mockReturnValue({
      query: { isLoading: false, isFetching: false, isError: true, isSuccess: false, error: new Error("test") },
      result: { data: undefined },
    } as any);

    const { result, act } = await renderHook(() => useSubscriptionStatus());
    expect(result.current.hasError).toBe(true);
    expect(result.current.isReady).toBe(false);
  });

  describe("isBusy behavior during refetch", () => {
    it("refetch() causes isBusy=true when isFetching (old behavior would flicker)", async () => {
      const mockRefetch = vi.fn();
      mockUseCustom.mockReturnValue({
        query: { isLoading: false, isFetching: true, isError: false, isSuccess: true, refetch: mockRefetch },
        result: { data: mockData },
      } as any);

      const { result, act } = await renderHook(() => useSubscriptionStatus());
      expect(result.current.isBusy).toBe(true);
    });

    it("silentRefetch() keeps isBusy=false when isFetching (no flicker)", async () => {
      const mockRefetch = vi.fn().mockResolvedValue({} as any);
      mockUseCustom.mockReturnValue({
        query: { isLoading: false, isFetching: false, isError: false, isSuccess: true, refetch: mockRefetch },
        result: { data: mockData },
      } as any);

      const { result, act } = await renderHook(() => useSubscriptionStatus());

      // Before silentRefetch: not busy
      expect(result.current.isBusy).toBe(false);

      // Call silentRefetch — during the fetch, isFetching becomes true but isBusy stays false
      await act(async () => {
        result.current.silentRefetch();
      });

      // After silentRefetch completes: still not busy
      expect(result.current.isBusy).toBe(false);
    });

    it("refetch() does NOT suppress isBusy during isFetching", async () => {
      const mockRefetch = vi.fn();
      mockUseCustom.mockReturnValue({
        query: { isLoading: false, isFetching: true, isError: false, isSuccess: true, refetch: mockRefetch },
        result: { data: mockData },
      } as any);

      const { result, act } = await renderHook(() => useSubscriptionStatus());
      // Regular refetch: isBusy reflects isFetching truthfully
      expect(result.current.isBusy).toBe(true);
    });

    it("silentRefetch is a separate function from refetch", async () => {
      mockUseCustom.mockReturnValue({
        query: { isLoading: false, isFetching: false, isError: false, isSuccess: true, refetch: vi.fn() },
        result: { data: mockData },
      } as any);

      const { result, act } = await renderHook(() => useSubscriptionStatus());
      expect(result.current.refetch).not.toBe(result.current.silentRefetch);
      expect(typeof result.current.silentRefetch).toBe("function");
    });
  });
});
