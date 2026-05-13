import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "vitest-browser-react";

vi.mock("@refinedev/core", () => ({
  useCustom: vi.fn(),
}));

vi.mock("@lumeweb/portal-framework-auth", () => ({
  DATA_PROVIDER_NAME: "dashboard",
}));

import { useCustom } from "@refinedev/core";
import { useManagementCapabilities } from "@/hooks/useManagementCapabilities";
import type { ManagementCapabilitiesResponse } from "@/types/subscription";

const mockUseCustom = vi.mocked(useCustom);

describe("useManagementCapabilities", () => {
  const mockData: ManagementCapabilitiesResponse = {
    management_mode: "api",
    operations: {
      cancel: true,
      change_plan: true,
      pause: false,
      resume: false,
    },
    admin_operations: {},
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseCustom.mockReturnValue({
      query: { isLoading: false, isError: false },
      result: { data: mockData },
    } as any);
  });

  it("calls useCustom with correct URL and method", async () => {
    const { result, act } = await renderHook(() => useManagementCapabilities());

    expect(mockUseCustom).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "/account/billing/management/capabilities",
        method: "get",
        dataProviderName: "dashboard",
      }),
    );
  });

  it("enables the query when subscription is active (isSubscribed: true)", async () => {
    const { result, act } = await renderHook(() =>
      useManagementCapabilities({}, { isSubscribed: true }),
    );

    expect(mockUseCustom).toHaveBeenCalledWith(
      expect.objectContaining({
        queryOptions: expect.objectContaining({
          enabled: true,
        }),
      }),
    );
  });

  it("disables the query when subscription is not active (isSubscribed: false)", async () => {
    const { result, act } = await renderHook(() =>
      useManagementCapabilities({}, { isSubscribed: false }),
    );

    expect(mockUseCustom).toHaveBeenCalledWith(
      expect.objectContaining({
        queryOptions: expect.objectContaining({
          enabled: false,
        }),
      }),
    );
  });

  it("disables the query when subscription is undefined", async () => {
    const { result, act } = await renderHook(() => useManagementCapabilities());

    expect(mockUseCustom).toHaveBeenCalledWith(
      expect.objectContaining({
        queryOptions: expect.objectContaining({
          enabled: false,
        }),
      }),
    );
  });

  it("respects custom enabled option from config", async () => {
    const { result, act } = await renderHook(() =>
      useManagementCapabilities(
        { queryOptions: { enabled: false } },
        { isSubscribed: true },
      ),
    );

    expect(mockUseCustom).toHaveBeenCalledWith(
      expect.objectContaining({
        queryOptions: expect.objectContaining({
          enabled: false,
        }),
      }),
    );
  });

  it("returns capabilities data", async () => {
    const { result, act } = await renderHook(() => useManagementCapabilities());

    expect(result.current.data).toEqual(mockData);
  });

  it("derives canCancel from operations", async () => {
    const { result, act } = await renderHook(() => useManagementCapabilities());
    expect(result.current.canCancel).toBe(true);
  });

  it("derives canChangePlan from operations", async () => {
    const { result, act } = await renderHook(() => useManagementCapabilities());
    expect(result.current.canChangePlan).toBe(true);
  });

  it("derives canPause from operations", async () => {
    const { result, act } = await renderHook(() => useManagementCapabilities());
    expect(result.current.canPause).toBe(false);
  });

  it("derives canResume from operations", async () => {
    const { result, act } = await renderHook(() => useManagementCapabilities());
    expect(result.current.canResume).toBe(false);
  });

  it("exposes operations map", async () => {
    const { result, act } = await renderHook(() => useManagementCapabilities());
    expect(result.current.operations).toEqual(mockData.operations);
  });

  it("exposes admin_operations map", async () => {
    const { result, act } = await renderHook(() => useManagementCapabilities());
    expect(result.current.adminOperations).toEqual(mockData.admin_operations);
  });

  it("returns all false when operations is undefined", async () => {
    mockUseCustom.mockReturnValue({
      query: { isLoading: false, isError: false },
      result: { data: { management_mode: "portal", operations: undefined, admin_operations: undefined } as any },
    } as any);

    const { result, act } = await renderHook(() => useManagementCapabilities());
    expect(result.current.canCancel).toBe(false);
    expect(result.current.canChangePlan).toBe(false);
    expect(result.current.canPause).toBe(false);
    expect(result.current.canResume).toBe(false);
  });
});
