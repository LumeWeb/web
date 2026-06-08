import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "vitest-browser-react";

vi.mock("@refinedev/core", () => ({
  useList: vi.fn(),
}));

vi.mock("@lumeweb/portal-framework-auth", () => ({
  DATA_PROVIDER_NAME: "dashboard",
}));

import { useList } from "@refinedev/core";
import { useCliInstalled } from "@/hooks/useCliInstalled";

const mockUseList = vi.mocked(useList);

describe("useCliInstalled", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns isInstalled: true when an API key with cli- prefix exists", async () => {
    mockUseList.mockReturnValue({
      query: { isLoading: false, isFetching: false, isError: false, isSuccess: true },
      result: {
        data: [
          { name: "cli-my-key", uuid: "1", created_at: "2026-01-01" },
          { name: "other-key", uuid: "2", created_at: "2026-01-02" },
        ],
        total: 2,
      },
    } as any);

    const { result } = await renderHook(() => useCliInstalled());
    expect(result.current.isInstalled).toBe(true);
  });

  it("returns isInstalled: false when no cli- prefix keys exist", async () => {
    mockUseList.mockReturnValue({
      query: { isLoading: false, isFetching: false, isError: false, isSuccess: true },
      result: {
        data: [
          { name: "other-key", uuid: "1", created_at: "2026-01-01" },
          { name: "another-key", uuid: "2", created_at: "2026-01-02" },
        ],
        total: 2,
      },
    } as any);

    const { result } = await renderHook(() => useCliInstalled());
    expect(result.current.isInstalled).toBe(false);
  });

  it("returns isInstalled: false when data is undefined", async () => {
    mockUseList.mockReturnValue({
      query: { isLoading: false, isFetching: false, isError: false, isSuccess: true },
      result: { data: undefined, total: undefined },
    } as any);

    const { result } = await renderHook(() => useCliInstalled());
    expect(result.current.isInstalled).toBe(false);
  });

  it("returns isBusy: true when loading", async () => {
    mockUseList.mockReturnValue({
      query: { isLoading: true, isFetching: false, isError: false, isSuccess: false },
      result: { data: undefined, total: undefined },
    } as any);

    const { result } = await renderHook(() => useCliInstalled());
    expect(result.current.isBusy).toBe(true);
  });

  it("returns hasError: true when error", async () => {
    mockUseList.mockReturnValue({
      query: { isLoading: false, isFetching: false, isError: true, isSuccess: false },
      result: { data: undefined, total: undefined },
    } as any);

    const { result } = await renderHook(() => useCliInstalled());
    expect(result.current.hasError).toBe(true);
  });
});
