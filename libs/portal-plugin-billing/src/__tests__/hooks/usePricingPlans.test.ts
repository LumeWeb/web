import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "vitest-browser-react";

vi.mock("@refinedev/core", () => ({
  useCustom: vi.fn(),
}));

vi.mock("@lumeweb/portal-framework-auth", () => ({
  DATA_PROVIDER_NAME: "dashboard",
}));

import { useCustom } from "@refinedev/core";
import { usePricingPlans } from "@/hooks/usePricingPlans";
import type { PublicPricingPlansListResponse } from "@/types/subscription";

const mockUseCustom = vi.mocked(useCustom);

describe("usePricingPlans", () => {
  const mockData: PublicPricingPlansListResponse = {
    data: [],
    total: 0,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseCustom.mockReturnValue({
      query: { isLoading: false, isFetching: false, isError: false, isSuccess: true },
      result: { data: mockData },
    } as any);
  });

  it("calls useCustom with correct URL and method", async () => {
    const { result, act } = await renderHook(() => usePricingPlans());

    expect(mockUseCustom).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "/billing/plans",
        method: "get",
        dataProviderName: "dashboard",
      }),
    );
  });

  it("returns plans data", async () => {
    const { result, act } = await renderHook(() => usePricingPlans());

    expect(result.current.data).toEqual(mockData);
  });

  it("passes queryOptions through", async () => {
    const queryOptions = { staleTime: 30000 };
    const { result, act } = await renderHook(() => usePricingPlans({ queryOptions }));

    expect(mockUseCustom).toHaveBeenCalledWith(
      expect.objectContaining({
        queryOptions: expect.objectContaining({ staleTime: 30000 }),
      }),
    );
  });

  it("returns loading state", async () => {
    mockUseCustom.mockReturnValue({
      query: { isLoading: true, isFetching: false, isError: false, isSuccess: false },
      result: { data: undefined },
    } as any);

    const { result, act } = await renderHook(() => usePricingPlans());
    expect(result.current.isBusy).toBe(true);
    expect(result.current.isReady).toBe(false);
  });
});
