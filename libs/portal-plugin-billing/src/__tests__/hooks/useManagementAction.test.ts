import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "vitest-browser-react";
import type { ManagementResultResponse } from "@/types/subscription";
import { ManagementAction } from "@/types/subscription";

vi.mock("@refinedev/core", () => ({
  useCustomMutation: vi.fn(),
}));

vi.mock("@lumeweb/portal-framework-auth", () => ({
  DATA_PROVIDER_NAME: "dashboard",
}));

import { useCustomMutation } from "@refinedev/core";
import { useManagementAction } from "@/hooks/useManagementAction";

const mockMutateAsync = vi.fn();

vi.mocked(useCustomMutation).mockReturnValue({
  mutateAsync: mockMutateAsync,
} as any);

describe("useManagementAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns execute, getOperationState, isLoading, error", async () => {
    const { result } = await renderHook(() => useManagementAction());
    expect(result.current.execute).toBeDefined();
    expect(result.current.getOperationState).toBeDefined();
    expect(result.current.getOperationState("cancel")).toEqual({
      isLoading: false,
      result: null,
      error: null,
    });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("calls POST /account/billing/management with { operation }", async () => {
    mockMutateAsync.mockResolvedValue({
      data: { action: ManagementAction.Unsupported } as ManagementResultResponse,
    });

    const { result } = await renderHook(() => useManagementAction());

    await result.current.execute("cancel");

    expect(mockMutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "/account/billing/management",
        method: "post",
        values: { operation: "cancel" },
        dataProviderName: "dashboard",
      }),
    );
  });

  describe("redirect action", () => {
    it("returns redirect type with URL", async () => {
      mockMutateAsync.mockResolvedValue({
        data: {
          action: ManagementAction.Redirect,
          url: "https://billing.example.com/portal",
        } as ManagementResultResponse,
      });

      const { result } = await renderHook(() => useManagementAction());

      const res = await result.current.execute("cancel");

      expect(res).toEqual({
        type: ManagementAction.Redirect,
        url: "https://billing.example.com/portal",
      });
      expect(mockMutateAsync).toHaveBeenCalledTimes(1);
    });
  });

  describe("api_required action", () => {
    it("makes second call to api_endpoint dynamically", async () => {
      const firstResponse = {
        data: {
          action: ManagementAction.ApiRequired,
          api_endpoint: {
            method: "post",
            path: "/account/billing/management/cancel",
          },
        } as ManagementResultResponse,
      };

      const secondResponse = {
        data: {
          action: ManagementAction.ShowUI,
          confirmation_message: "Subscription cancelled",
          effective_time: "2025-01-01T00:00:00Z",
        } as ManagementResultResponse,
      };

      mockMutateAsync
        .mockResolvedValueOnce(firstResponse)
        .mockResolvedValueOnce(secondResponse);

      const { result } = await renderHook(() => useManagementAction());

      const res = await result.current.execute("cancel");

      expect(mockMutateAsync).toHaveBeenCalledTimes(2);
      expect(res.type).toBe(ManagementAction.ApiRequired);
      expect("data" in res && res.data).toEqual(secondResponse.data);
    });
  });

  describe("api_required action", () => {
    it("strips /api prefix from api_endpoint.path to avoid nested /api", async () => {
      const firstResponse = {
        data: {
          action: ManagementAction.ApiRequired,
          api_endpoint: {
            method: "post",
            path: "/api/billing/management/cancel",
          },
        } as ManagementResultResponse,
      };

      const secondResponse = {
        data: {
          action: ManagementAction.ShowUI,
          confirmation_message: "Subscription cancelled",
          effective_time: "2025-01-01T00:00:00Z",
        } as ManagementResultResponse,
      };

      mockMutateAsync
        .mockResolvedValueOnce(firstResponse)
        .mockResolvedValueOnce(secondResponse);

      const { result } = await renderHook(() => useManagementAction());

      const res = await result.current.execute("cancel");

      expect(mockMutateAsync).toHaveBeenCalledTimes(2);
      // Second call should use the normalized path (stripped /api prefix)
      expect(mockMutateAsync).toHaveBeenNthCalledWith(2, expect.objectContaining({
        url: "/billing/management/cancel",
      }));
      expect(res.type).toBe(ManagementAction.ApiRequired);
    });
  });

  describe("show_ui action", () => {
    it("returns show_ui type with data directly", async () => {
      mockMutateAsync.mockResolvedValue({
        data: {
          action: ManagementAction.ShowUI,
          confirmation_message: "Action pending",
          effective_time: "2025-01-01T00:00:00Z",
          can_abort: true,
        } as ManagementResultResponse,
      });

      const { result } = await renderHook(() => useManagementAction());

      const res = await result.current.execute("pause");

      expect(res).toEqual({
        type: ManagementAction.ShowUI,
        data: {
          action: ManagementAction.ShowUI,
          confirmation_message: "Action pending",
          effective_time: "2025-01-01T00:00:00Z",
          can_abort: true,
        },
      });
    });
  });

  describe("unsupported action", () => {
    it("returns unsupported type", async () => {
      mockMutateAsync.mockResolvedValue({
        data: { action: ManagementAction.Unsupported } as ManagementResultResponse,
      });

      const { result } = await renderHook(() => useManagementAction());

      const res = await result.current.execute("resume");

      expect(res).toEqual({ type: ManagementAction.Unsupported });
    });
  });

  describe("error handling", () => {
    it("returns error type when API fails", async () => {
      mockMutateAsync.mockRejectedValue(new Error("Network error"));

      const { result } = await renderHook(() => useManagementAction());

      const res = await result.current.execute("cancel");

      expect(res.type).toBe(ManagementAction.Error);
      expect("message" in res && res.message).toBe("Network error");
      
      // Wait for React state update
      await vi.waitFor(() => {
        expect(result.current.error).toBeInstanceOf(Error);
      });
      
      const opState = result.current.getOperationState("cancel");
      expect(opState.error).toBeInstanceOf(Error);
    });

    it("handles string errors", async () => {
      mockMutateAsync.mockRejectedValue("String error");

      const { result } = await renderHook(() => useManagementAction());

      const res = await result.current.execute("pause");

      expect(res.type).toBe(ManagementAction.Error);
      expect("message" in res && res.message).toBe("String error");
    });
  });

  describe("loading states", () => {
    it("isLoading is true during execution", async () => {
      mockMutateAsync.mockImplementation(() => new Promise(() => {})); // Never resolves

      const { result } = await renderHook(() => useManagementAction());
      
      // Start execution
      const promise = result.current.execute("cancel");

      // Wait for state to update
      await vi.waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });
      expect(result.current.getOperationState("cancel").isLoading).toBe(true);
    });

    it("isLoading is false after completion", async () => {
      mockMutateAsync.mockResolvedValue({
        data: { action: ManagementAction.Unsupported } as ManagementResultResponse,
      });

      const { result } = await renderHook(() => useManagementAction());
      
      await result.current.execute("cancel");

      expect(result.current.isLoading).toBe(false);
      expect(result.current.getOperationState("cancel").isLoading).toBe(false);
    });
  });

  describe("invalid operations", () => {
    it("returns error for unknown operations", async () => {
      const { result } = await renderHook(() => useManagementAction());

      const res = await result.current.execute("unknown_op" as any);

      expect(res.type).toBe(ManagementAction.Error);
      expect("message" in res && res.message).toContain("Unsupported");
    });
  });

  describe("error action", () => {
    it("returns error type with message from server", async () => {
      mockMutateAsync.mockResolvedValue({
        data: {
          action: ManagementAction.Error,
          error_message: "Custom error from server",
        } as ManagementResultResponse,
      });

      const { result } = await renderHook(() => useManagementAction());

      const res = await result.current.execute("cancel");

      expect(res.type).toBe(ManagementAction.Error);
      expect("message" in res && res.message).toBe("Custom error from server");
    });
  });

  describe("onSuccess callback", () => {
    it("calls onSuccess after successful api_required action", async () => {
      const onSuccess = vi.fn();
      const firstResponse = {
        data: {
          action: ManagementAction.ApiRequired,
          api_endpoint: {
            method: "post",
            path: "/account/billing/cancel",
          },
        } as ManagementResultResponse,
      };

      const secondResponse = {
        data: {
          action: ManagementAction.ShowUI,
          effective_time: "2025-01-01T00:00:00Z",
          status: "scheduled",
          can_abort: true,
        } as ManagementResultResponse,
      };

      mockMutateAsync
        .mockResolvedValueOnce(firstResponse)
        .mockResolvedValueOnce(secondResponse);

      const { result } = await renderHook(() => useManagementAction({ onSuccess }));

      await result.current.execute("cancel");

      expect(onSuccess).toHaveBeenCalledWith("cancel");
      expect(onSuccess).toHaveBeenCalledTimes(1);
    });

    it("calls onSuccess after successful show_ui action", async () => {
      const onSuccess = vi.fn();
      mockMutateAsync.mockResolvedValue({
        data: {
          action: ManagementAction.ShowUI,
          effective_time: "2025-01-01T00:00:00Z",
          can_abort: true,
        } as ManagementResultResponse,
      });

      const { result } = await renderHook(() => useManagementAction({ onSuccess }));

      await result.current.execute("pause");

      expect(onSuccess).toHaveBeenCalledWith("pause");
      expect(onSuccess).toHaveBeenCalledTimes(1);
    });

    it("does not call onSuccess after error", async () => {
      const onSuccess = vi.fn();
      mockMutateAsync.mockRejectedValue(new Error("Network error"));

      const { result } = await renderHook(() => useManagementAction({ onSuccess }));

      await result.current.execute("cancel");

      expect(onSuccess).not.toHaveBeenCalled();
    });

    it("does not call onSuccess after unsupported action", async () => {
      const onSuccess = vi.fn();
      mockMutateAsync.mockResolvedValue({
        data: { action: ManagementAction.Unsupported } as ManagementResultResponse,
      });

      const { result } = await renderHook(() => useManagementAction({ onSuccess }));

      await result.current.execute("resume");

      expect(onSuccess).not.toHaveBeenCalled();
    });

    it("does not call onSuccess after checkout_required from api_required", async () => {
      const onSuccess = vi.fn();
      const firstResponse = {
        data: {
          action: ManagementAction.ApiRequired,
          api_endpoint: {
            method: "post",
            path: "/account/billing/change-plan",
          },
        } as ManagementResultResponse,
      };

      const secondResponse = {
        data: {
          action: ManagementAction.CheckoutRequired,
          session_id: "sess_123",
        },
      };

      mockMutateAsync
        .mockResolvedValueOnce(firstResponse)
        .mockResolvedValueOnce(secondResponse);

      const { result } = await renderHook(() => useManagementAction({ onSuccess }));

      await result.current.execute("change_plan" as any);

      expect(onSuccess).not.toHaveBeenCalled();
    });

    it("does not call onSuccess for invalid operation", async () => {
      const onSuccess = vi.fn();
      const { result } = await renderHook(() => useManagementAction({ onSuccess }));

      await result.current.execute("unknown_op" as any);

      expect(onSuccess).not.toHaveBeenCalled();
    });
  });

  describe("complete action", () => {
    it("returns complete type when API returns action: complete", async () => {
      mockMutateAsync.mockResolvedValue({
        data: {
          action: ManagementAction.Complete,
          credit_applied: "2",
          charge_due: "1",
          effective_date: "2026-05-04T01:54:39Z",
        } as ManagementResultResponse,
      });

      const { result } = await renderHook(() => useManagementAction());

      const res = await result.current.execute("change_plan" as any);

      expect(res).toEqual({
        type: ManagementAction.Complete,
        data: {
          action: ManagementAction.Complete,
          credit_applied: "2",
          charge_due: "1",
          effective_date: "2026-05-04T01:54:39Z",
        },
      });
    });

    it("calls onSuccess after complete action", async () => {
      const onSuccess = vi.fn();
      mockMutateAsync.mockResolvedValue({
        data: {
          action: ManagementAction.Complete,
          credit_applied: "2",
          charge_due: "-1",
          effective_date: "2026-05-04T01:53:53Z",
        } as ManagementResultResponse,
      });

      const { result } = await renderHook(() => useManagementAction({ onSuccess }));

      await result.current.execute("change_plan" as any);

      expect(onSuccess).toHaveBeenCalledWith("change_plan");
      expect(onSuccess).toHaveBeenCalledTimes(1);
    });

    it("returns complete type when nested API call inside api_required returns action: complete", async () => {
      const firstResponse = {
        data: {
          action: ManagementAction.ApiRequired,
          api_endpoint: { method: "POST", path: "/account/billing/change_plan" },
        } as ManagementResultResponse,
      };
      const secondResponse = {
        data: {
          action: ManagementAction.Complete,
          credit_applied: "2",
          charge_due: "1",
          effective_date: "2026-05-04T01:54:39Z",
        } as ManagementResultResponse,
      };

      mockMutateAsync
        .mockResolvedValueOnce(firstResponse)
        .mockResolvedValueOnce(secondResponse);

      const onSuccess = vi.fn();
      const { result } = await renderHook(() => useManagementAction({ onSuccess }));

      const res = await result.current.execute("change_plan" as any, { period_id: 201 });

      expect(res.type).toBe(ManagementAction.Complete);
      expect(res).toEqual({
        type: ManagementAction.Complete,
        data: {
          action: ManagementAction.Complete,
          credit_applied: "2",
          charge_due: "1",
          effective_date: "2026-05-04T01:54:39Z",
        },
      });
      expect(onSuccess).toHaveBeenCalledWith("change_plan");
    });
  });
});
