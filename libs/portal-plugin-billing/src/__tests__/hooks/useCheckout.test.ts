import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "vitest-browser-react";

vi.mock("@refinedev/core", () => ({
  useCustom: vi.fn(),
}));

vi.mock("@lumeweb/portal-framework-auth", () => ({
  DATA_PROVIDER_NAME: "dashboard",
}));

import { useCustom } from "@refinedev/core";
import { useCheckout } from "@/hooks/useCheckout";
import type { CheckoutUIResponse } from "@/types/subscription";

const mockUseCustom = vi.mocked(useCustom);

describe("useCheckout", () => {
  const mockData: CheckoutUIResponse = {
    fragments: [],
    session_id: "sess_123",
    expires_at: "2025-01-01T00:00:00Z",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseCustom.mockReturnValue({
      result: { data: mockData },
      query: {
        data: { data: mockData },
        isSuccess: true,
        isLoading: false,
        isFetching: false,
        isError: false,
        error: null,
      },
    } as any);
  });

  it("returns isReady true when data is available", async () => {
    const { result } = await renderHook(() => useCheckout({ planId: "plan_abc" }));

    expect(result.current.isReady).toBe(true);
    expect(result.current.data).toEqual(mockData);
    expect(result.current.isBusy).toBe(false);
    expect(result.current.hasError).toBe(false);
  });

  it("calls useCustom with planId in URL", async () => {
    await renderHook(() => useCheckout({ planId: "plan_abc" }));

    expect(mockUseCustom).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "/account/billing/checkout/ui/plan_abc",
        method: "get",
        dataProviderName: "dashboard",
      }),
    );
  });

  it("appends period_id query param when provided", async () => {
    const { result, act } = await renderHook(() => useCheckout({ planId: "plan_abc", periodId: 5 }));

    expect(mockUseCustom).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "/account/billing/checkout/ui/plan_abc?period_id=5",
      }),
    );
  });

  it("does not append period_id when not provided", async () => {
    const { result, act } = await renderHook(() => useCheckout({ planId: "plan_abc" }));

    const call = mockUseCustom.mock.calls[0][0] as any;
    expect(call.url).not.toContain("period_id");
  });

  it("disables query when planId is empty", async () => {
    const { result, act } = await renderHook(() => useCheckout({ planId: "" }));

    expect(mockUseCustom).toHaveBeenCalledWith(
      expect.objectContaining({
        queryOptions: expect.objectContaining({ enabled: false }),
      }),
    );
  });

  it("returns checkout data", async () => {
    const { result } = await renderHook(() => useCheckout({ planId: "plan_abc" }));

    expect(result.current.data).toEqual(mockData);
  });
});
