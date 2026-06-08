import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "vitest-browser-react";

vi.mock("@refinedev/core", () => ({
  useList: vi.fn(),
}));

import { useList } from "@refinedev/core";
import { useHasWebsites } from "@/hooks/useHasWebsites";

const mockUseList = vi.mocked(useList);

describe("useHasWebsites", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns hasWebsites: true when total > 0", async () => {
    mockUseList.mockReturnValue({
      query: { isLoading: false, isError: false } as any,
      result: { data: [{ id: 1, domain: "example.com", status: "active" }], total: 1 },
    } as any);

    const { result } = await renderHook(() => useHasWebsites());
    expect(result.current.hasWebsites).toBe(true);
  });

  it("returns hasWebsites: false when total === 0 and data is empty", async () => {
    mockUseList.mockReturnValue({
      query: { isLoading: false, isError: false } as any,
      result: { data: [], total: 0 },
    } as any);

    const { result } = await renderHook(() => useHasWebsites());
    expect(result.current.hasWebsites).toBe(false);
  });

  it("returns hasWebsites: false when total is undefined and data is empty", async () => {
    mockUseList.mockReturnValue({
      query: { isLoading: false, isError: false } as any,
      result: { data: [], total: undefined },
    } as any);

    const { result } = await renderHook(() => useHasWebsites());
    expect(result.current.hasWebsites).toBe(false);
  });

  it("passes through isBusy", async () => {
    mockUseList.mockReturnValue({
      query: { isLoading: true, isError: false } as any,
      result: { data: [], total: 0 },
    } as any);

    const { result } = await renderHook(() => useHasWebsites());
    expect(result.current.isBusy).toBe(true);
  });

  it("passes through hasError", async () => {
    mockUseList.mockReturnValue({
      query: { isLoading: false, isError: true } as any,
      result: { data: [], total: 0 },
    } as any);

    const { result } = await renderHook(() => useHasWebsites());
    expect(result.current.hasError).toBe(true);
  });

  it("calls useList with correct resource and dataProviderName", async () => {
    mockUseList.mockReturnValue({
      query: { isLoading: false, isError: false } as any,
      result: { data: [], total: 0 },
    } as any);

    await renderHook(() => useHasWebsites());
    expect(mockUseList).toHaveBeenCalledWith({
      resource: "ipfs/websites",
      dataProviderName: "ipfs",
      pagination: { pageSize: 1 },
      queryOptions: { enabled: true },
    });
  });
});
