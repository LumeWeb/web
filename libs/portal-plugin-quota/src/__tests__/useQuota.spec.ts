import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useQuota, QUOTA_QUERY_KEY } from "../hooks/useQuota";

// Mock useCustom from @refinedev/core
const mockUseCustom = vi.fn();

vi.mock("@refinedev/core", () => ({
  useCustom: (...args: any[]) => mockUseCustom(...args),
}));

vi.mock("@lumeweb/portal-framework-auth", () => ({
  DATA_PROVIDER_NAME: "account",
}));

describe("useQuota", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseCustom.mockReset();
  });

  it("returns loading state initially (isBusy = true)", () => {
    mockUseCustom.mockReturnValue({
      query: {
        isError: false,
        isLoading: true,
        isSuccess: false,
        refetch: vi.fn(),
      },
      result: {
        data: undefined,
      },
    });

    const { result } = renderHook(() => useQuota());

    expect(result.current.isBusy).toBe(true);
    expect(result.current.isReady).toBe(false);
    expect(result.current.hasError).toBe(false);
    expect(result.current.data).toBeUndefined();
  });

  it("returns quota data after successful fetch (isReady = true, data has storage/upload/download)", () => {
    const mockData = {
      download: {
        limit: 10737418240,
        percentage: 50,
        used: 5368709120,
      },
      storage: {
        limit: 107374182400,
        percentage: 50,
        used: 53687091200,
      },
      upload: {
        limit: 1073741824,
        percentage: 19.5,
        used: 209715200,
      },
    };

    mockUseCustom.mockReturnValue({
      query: {
        isError: false,
        isLoading: false,
        isSuccess: true,
        refetch: vi.fn(),
      },
      result: {
        data: mockData,
      },
    });

    const { result } = renderHook(() => useQuota());

    expect(result.current.isBusy).toBe(false);
    expect(result.current.isReady).toBe(true);
    expect(result.current.hasError).toBe(false);
    expect(result.current.data).toEqual(mockData);
    expect(result.current.data?.storage.used).toBe(53687091200);
    expect(result.current.data?.upload.used).toBe(209715200);
    expect(result.current.data?.download.used).toBe(5368709120);
  });

  it("returns error state on failed query (hasError = true)", () => {
    const mockError = {
      message: "Internal Server Error",
      statusCode: 500,
    };

    mockUseCustom.mockReturnValue({
      query: {
        error: mockError,
        isError: true,
        isLoading: false,
        isSuccess: false,
        refetch: vi.fn(),
      },
      result: {
        data: undefined,
      },
    });

    const { result } = renderHook(() => useQuota());

    expect(result.current.isBusy).toBe(false);
    expect(result.current.isReady).toBe(false);
    expect(result.current.hasError).toBe(true);
    expect(result.current.error).toEqual(mockError);
  });

  it("calls useCustom with correct parameters", () => {
    mockUseCustom.mockReturnValue({
      query: {
        isError: false,
        isLoading: true,
        isSuccess: false,
        refetch: vi.fn(),
      },
      result: {
        data: undefined,
      },
    });

    renderHook(() => useQuota());

    expect(mockUseCustom).toHaveBeenCalledWith({
      url: "/account/quota",
      method: "get",
      dataProviderName: "account",
      queryOptions: undefined,
    });
  });

  it("passes queryOptions to useCustom when provided", () => {
    const queryOptions = { enabled: false };

    mockUseCustom.mockReturnValue({
      query: {
        isError: false,
        isLoading: true,
        isSuccess: false,
        refetch: vi.fn(),
      },
      result: {
        data: undefined,
      },
    });

    renderHook(() => useQuota({ queryOptions }));

    expect(mockUseCustom).toHaveBeenCalledWith({
      url: "/account/quota",
      method: "get",
      dataProviderName: "account",
      queryOptions,
    });
  });

  it("exposes refetch function that calls query.refetch", () => {
    const mockRefetch = vi.fn();

    mockUseCustom.mockReturnValue({
      query: {
        isError: false,
        isLoading: false,
        isSuccess: true,
        refetch: mockRefetch,
      },
      result: {
        data: { storage: { used: 0, percentage: 0 }, upload: { used: 0, percentage: 0 }, download: { used: 0, percentage: 0 } },
      },
    });

    const { result } = renderHook(() => useQuota());

    result.current.refetch();
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it("returns not-ready when query succeeds but data is falsy", () => {
    mockUseCustom.mockReturnValue({
      query: {
        isError: false,
        isLoading: false,
        isSuccess: true,
        refetch: vi.fn(),
      },
      result: {
        data: null,
      },
    });

    const { result } = renderHook(() => useQuota());

    expect(result.current.isReady).toBe(false);
    expect(result.current.data).toBeNull();
  });
});
