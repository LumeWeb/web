import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "vitest-browser-react";
vi.mock("@refinedev/core", () => ({
  useCustom: vi.fn(),
  useList: vi.fn(),
}));

vi.mock("@lumeweb/portal-framework-auth", () => ({
  DATA_PROVIDER_NAME: "dashboard",
}));

import { useCustom, useList } from "@refinedev/core";
import { useCredits } from "@/hooks/useCredits";
import type { BalanceResponse, UserCreditItem } from "@/types/subscription";

const mockUseCustom = vi.mocked(useCustom);
const mockUseList = vi.mocked(useList);

describe("useCredits", () => {
  const mockBalance: BalanceResponse = {
    balance: { value: "100.00" },
    user_id: 1,
  };

  const mockCredits: UserCreditItem[] = [];

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseCustom.mockImplementation((_params: any) => {
      return {
        query: { isLoading: false, isError: false },
        result: { data: mockBalance },
      } as any;
    });
    mockUseList.mockImplementation((_params: any) => {
      return {
        query: { isLoading: false, isError: false },
        result: { data: mockCredits, total: 0 },
      } as any;
    });
  });

  it("calls useCustom for balance with correct URL", async () => {
    const { result, act } = await renderHook(() => useCredits());

    expect(mockUseCustom).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "/account/billing/balance",
        method: "get",
        dataProviderName: "dashboard",
      }),
    );
  });

  it("calls useList for credits with correct resource and pagination", async () => {
    const { result, act } = await renderHook(() => useCredits());

    expect(mockUseList).toHaveBeenCalledWith(
      expect.objectContaining({
        resource: "billing-credits",
        pagination: { currentPage: 1, pageSize: 20 },
        dataProviderName: "dashboard",
      }),
    );
  });

  it("returns balance data", async () => {
    const { result, act } = await renderHook(() => useCredits());
    expect(result.current.balance.data).toEqual(mockBalance);
  });

  it("returns credits data", async () => {
    const { result, act } = await renderHook(() => useCredits());
    expect(result.current.history.data).toEqual(mockCredits);
  });

  it("passes page and pageSize to useList pagination", async () => {
    const { result, act } = await renderHook(() => useCredits({ page: 2, pageSize: 50 }));

    expect(mockUseList).toHaveBeenCalledWith(
      expect.objectContaining({
        pagination: { currentPage: 2, pageSize: 50 },
      }),
    );
  });

  it("uses default page and pageSize", async () => {
    const { result, act } = await renderHook(() => useCredits());

    expect(mockUseList).toHaveBeenCalledWith(
      expect.objectContaining({
        pagination: { currentPage: 1, pageSize: 20 },
      }),
    );
  });


});
