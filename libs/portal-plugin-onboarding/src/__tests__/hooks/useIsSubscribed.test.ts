import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "vitest-browser-react";

vi.mock("@lumeweb/portal-plugin-billing", () => ({
  useSubscriptionStatus: vi.fn(),
}));

import { useSubscriptionStatus } from "@lumeweb/portal-plugin-billing";
import { useIsSubscribed } from "@/hooks/useIsSubscribed";

const mockUseSubscriptionStatus = vi.mocked(useSubscriptionStatus);

describe("useIsSubscribed", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns isSubscribed: true when data.is_subscribed === true", async () => {
    mockUseSubscriptionStatus.mockReturnValue({
      data: { is_subscribed: true, gateway_type: "stripe", pricing_plan_period_id: 1 },
      isBusy: false,
      hasError: false,
    } as any);

    const { result } = await renderHook(() => useIsSubscribed());
    expect(result.current.isSubscribed).toBe(true);
  });

  it("returns isSubscribed: false when data.is_subscribed === false", async () => {
    mockUseSubscriptionStatus.mockReturnValue({
      data: { is_subscribed: false, gateway_type: undefined, pricing_plan_period_id: undefined },
      isBusy: false,
      hasError: false,
    } as any);

    const { result } = await renderHook(() => useIsSubscribed());
    expect(result.current.isSubscribed).toBe(false);
  });

  it("returns isSubscribed: false when data is undefined", async () => {
    mockUseSubscriptionStatus.mockReturnValue({
      data: undefined,
      isBusy: false,
      hasError: false,
    } as any);

    const { result } = await renderHook(() => useIsSubscribed());
    expect(result.current.isSubscribed).toBe(false);
  });

  it("passes through isBusy", async () => {
    mockUseSubscriptionStatus.mockReturnValue({
      data: undefined,
      isBusy: true,
      hasError: false,
    } as any);

    const { result } = await renderHook(() => useIsSubscribed());
    expect(result.current.isBusy).toBe(true);
  });

  it("passes through hasError", async () => {
    mockUseSubscriptionStatus.mockReturnValue({
      data: undefined,
      isBusy: false,
      hasError: true,
    } as any);

    const { result } = await renderHook(() => useIsSubscribed());
    expect(result.current.hasError).toBe(true);
  });
});
