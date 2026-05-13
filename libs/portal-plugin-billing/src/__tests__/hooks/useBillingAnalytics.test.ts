import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "vitest-browser-react";

vi.mock("@lumeweb/analytics", () => ({
  useAnalytics: vi.fn(),
}));

import { useAnalytics } from "@lumeweb/analytics";
import { useBillingAnalytics } from "@/ui/hooks/useBillingAnalytics";

describe("useBillingAnalytics", () => {
  let mockCapture: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockCapture = vi.fn();
    vi.mocked(useAnalytics).mockReturnValue({
      capture: mockCapture,
      identify: vi.fn(),
    });
  });

  it("should fire pricing_viewed event", async () => {
    const { result } = await renderHook(() => useBillingAnalytics());
    result.current.pricingViewed({ plan_count: 3 });
    expect(mockCapture).toHaveBeenCalledWith("pricing_viewed", { plan_count: 3 });
  });

  it("should fire checkout_initiated event with properties", async () => {
    const { result } = await renderHook(() => useBillingAnalytics());
    result.current.checkoutInitiated({ plan_id: 1, plan_name: "Pro", period: "monthly", gateway: "stripe" });
    expect(mockCapture).toHaveBeenCalledWith("checkout_initiated", { plan_id: 1, plan_name: "Pro", period: "monthly", gateway: "stripe" });
  });

  it("should fire checkout_completed event with properties", async () => {
    const { result } = await renderHook(() => useBillingAnalytics());
    result.current.checkoutCompleted({ plan_id: 1, plan_name: "Pro", period: "monthly", gateway: "stripe", session_id: "sess-123" });
    expect(mockCapture).toHaveBeenCalledWith("checkout_completed", { plan_id: 1, plan_name: "Pro", period: "monthly", gateway: "stripe", session_id: "sess-123" });
  });

  it("should fire checkout_abandoned event with properties", async () => {
    const { result } = await renderHook(() => useBillingAnalytics());
    result.current.checkoutAbandoned({ plan_id: 1, plan_name: "Pro" });
    expect(mockCapture).toHaveBeenCalledWith("checkout_abandoned", { plan_id: 1, plan_name: "Pro" });
  });

  it("should fire upgrade_initiated event with properties", async () => {
    const { result } = await renderHook(() => useBillingAnalytics());
    result.current.upgradeInitiated({ current_plan_id: 1, target_plan_id: 2 });
    expect(mockCapture).toHaveBeenCalledWith("upgrade_initiated", { current_plan_id: 1, target_plan_id: 2 });
  });

  it("should fire upgrade_completed event with properties", async () => {
    const { result } = await renderHook(() => useBillingAnalytics());
    result.current.upgradeCompleted({ old_plan_id: 1, new_plan_id: 2 });
    expect(mockCapture).toHaveBeenCalledWith("upgrade_completed", { old_plan_id: 1, new_plan_id: 2 });
  });

  it("should fire downgrade_initiated event with properties", async () => {
    const { result } = await renderHook(() => useBillingAnalytics());
    result.current.downgradeInitiated({ current_plan_id: 2, target_plan_id: 1 });
    expect(mockCapture).toHaveBeenCalledWith("downgrade_initiated", { current_plan_id: 2, target_plan_id: 1 });
  });

  it("should fire cancellation_initiated event with properties", async () => {
    const { result } = await renderHook(() => useBillingAnalytics());
    result.current.cancellationInitiated({ plan_id: 1, plan_name: "Pro" });
    expect(mockCapture).toHaveBeenCalledWith("cancellation_initiated", { plan_id: 1, plan_name: "Pro" });
  });

  it("should fire cancellation_completed event with properties", async () => {
    const { result } = await renderHook(() => useBillingAnalytics());
    result.current.cancellationCompleted({ plan_id: 1, plan_name: "Pro" });
    expect(mockCapture).toHaveBeenCalledWith("cancellation_completed", { plan_id: 1, plan_name: "Pro" });
  });

  it("should fire cancellation_aborted event with properties", async () => {
    const { result } = await renderHook(() => useBillingAnalytics());
    result.current.cancellationAborted({ plan_id: 1, plan_name: "Pro" });
    expect(mockCapture).toHaveBeenCalledWith("cancellation_aborted", { plan_id: 1, plan_name: "Pro" });
  });

  it("should work without properties (all optional)", async () => {
    const { result } = await renderHook(() => useBillingAnalytics());
    result.current.pricingViewed();
    expect(mockCapture).toHaveBeenCalledWith("pricing_viewed", undefined);
  });

  it("should not crash when capture is undefined", async () => {
    vi.mocked(useAnalytics).mockReturnValue({
      capture: undefined as any,
      identify: undefined as any,
    });
    const { result } = await renderHook(() => useBillingAnalytics());
    expect(result.current).toBeDefined();
    expect(typeof result.current.pricingViewed).toBe("function");
  });
});
