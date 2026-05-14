import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "vitest-browser-react";

vi.mock("@refinedev/core", () => ({
  useCustom: vi.fn(),
}));

vi.mock("@lumeweb/portal-framework-auth", () => ({
  DATA_PROVIDER_NAME: "dashboard",
}));

import { useCustom } from "@refinedev/core";
import { useGateways } from "@/hooks/useGateways";
import type { GatewayPublicInfo } from "@/types/subscription";

const mockUseCustom = vi.mocked(useCustom);

describe("useGateways", () => {
  const mockData: GatewayPublicInfo[] = [
    { id: "stripe", name: "Stripe", is_active: true, logo_url: "/logo/stripe.png", description: "", abilities: { checkout: true, session_status: true, customer_portal: true } },
    { id: "atlos", name: "Atlos", is_active: false, logo_url: "/logo/atlos.png", description: "", abilities: { checkout: true, session_status: false, customer_portal: false } },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns isReady true when data is available", async () => {
    mockUseCustom.mockReturnValue({
      result: { data: mockData },
      query: {
        data: { data: mockData },
        isSuccess: true,
        isLoading: false,
        isFetching: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      },
    } as any);

    const { result } = await renderHook(() => useGateways());

    expect(result.current.isReady).toBe(true);
    expect(result.current.data).toEqual(mockData);
  });

  it("filters active gateways", async () => {
    mockUseCustom.mockReturnValue({
      result: { data: mockData },
      query: {
        data: { data: mockData },
        isSuccess: true,
        isLoading: false,
        isFetching: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      },
    } as any);

    const { result } = await renderHook(() => useGateways());

    expect(result.current.activeGateways).toHaveLength(1);
    expect(result.current.activeGateways[0].id).toBe("stripe");
  });

  it("returns empty arrays when data is undefined", async () => {
    mockUseCustom.mockReturnValue({
      result: { data: undefined },
      query: {
        data: undefined,
        isSuccess: false,
        isLoading: true,
        isFetching: true,
        isError: false,
        error: null,
        refetch: vi.fn(),
      },
    } as any);

    const { result } = await renderHook(() => useGateways());

    expect(result.current.gateways).toEqual([]);
    expect(result.current.activeGateways).toEqual([]);
  });
});
