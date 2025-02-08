import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useTableActions } from "./useTableActions";

// Define spies outside the mock factory
const mockUseGo = vi.fn();
const mockPush = vi.fn();
const mockOpenNotification = vi.fn();

// Mock @refinedev/core hooks
vi.mock("@refinedev/core", () => ({
  useGo: () => mockUseGo,
  useNavigation: () => ({ push: mockPush }),
  useNotification: () => ({
    open: mockOpenNotification,
  }),
}));

describe("useTableActions", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks(); // This should clear the spies defined outside the mock
  });

  // Setup mocks before each test
  beforeEach(() => {
    // Clear the spies defined outside the mock factory
    vi.clearAllMocks();
  });

  it("should return action handlers", () => {
    const { result } = renderHook(() => useTableActions({}));

    expect(result.current).toHaveProperty("handleBulkAction");
    expect(result.current).toHaveProperty("handleDelete");
    expect(result.current).toHaveProperty("handleEdit");
    expect(result.current).toHaveProperty("handleView");

    expect(typeof result.current.handleBulkAction).toBe("function");
    expect(typeof result.current.handleDelete).toBe("function");
    expect(typeof result.current.handleEdit).toBe("function");
    expect(typeof result.current.handleView).toBe("function");
  });

  describe("handleView", () => {
    it("should use go hook when resourceName is provided", () => {
      const resourceName = "posts";
      const id = "123";
      const { result } = renderHook(() => useTableActions({ resourceName }));

      result.current.handleView(id);

      expect(mockUseGo).toHaveBeenCalledWith({
        to: {
          action: "show",
          id,
          resource: resourceName,
        },
      });
      expect(mockPush).not.toHaveBeenCalled();
    });

    it("should use push hook when viewPath is provided and resourceName is not", () => {
      const viewPath = "/items/view";
      const id = "456";
      const { result } = renderHook(() => useTableActions({ viewPath }));

      result.current.handleView(id);

      expect(mockPush).toHaveBeenCalledWith(`${viewPath}/${id}`);
      expect(mockUseGo).not.toHaveBeenCalled();
    });

    it("should do nothing if neither resourceName nor viewPath is provided", () => {
      const id = "789";
      const { result } = renderHook(() => useTableActions({}));

      result.current.handleView(id);

      expect(mockUseGo).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe("handleEdit", () => {
    it("should use go hook when resourceName is provided", () => {
      const resourceName = "posts";
      const id = "123";
      const { result } = renderHook(() => useTableActions({ resourceName }));

      result.current.handleEdit(id);

      expect(mockUseGo).toHaveBeenCalledWith({
        to: {
          action: "edit",
          id,
          resource: resourceName,
        },
      });
      expect(mockPush).not.toHaveBeenCalled();
    });

    it("should use push hook when editPath is provided and resourceName is not", () => {
      const editPath = "/items/edit";
      const id = "456";
      const { result } = renderHook(() => useTableActions({ editPath }));

      result.current.handleEdit(id);

      expect(mockPush).toHaveBeenCalledWith(`${editPath}/${id}`);
      expect(mockUseGo).not.toHaveBeenCalled();
    });

    it("should do nothing if neither resourceName nor editPath is provided", () => {
      const id = "789";
      const { result } = renderHook(() => useTableActions({}));

      result.current.handleEdit(id);

      expect(mockUseGo).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe("handleDelete", () => {
    it("should call openNotification with success message on success", async () => {
      const id = "123";
      const { result } = renderHook(() => useTableActions({}));

      // Mock the internal delete logic (which is commented out in the source)
      // For this test, we assume it succeeds immediately
      await result.current.handleDelete(id);

      expect(mockOpenNotification).toHaveBeenCalledWith({
        message: "Item deleted successfully",
        type: "success",
      });
      expect(mockOpenNotification).toHaveBeenCalledTimes(1);
    });
  });

  describe("handleBulkAction", () => {
    it("should call the provided action function with selected IDs", async () => {
      const mockAction = vi.fn().mockResolvedValue(undefined);
      const selectedIds = ["1", "2", "3"];
      const { result } = renderHook(() => useTableActions({}));

      await result.current.handleBulkAction(mockAction, selectedIds);

      expect(mockAction).toHaveBeenCalledWith(selectedIds);
    });

    it("should call openNotification with success message on success", async () => {
      const mockAction = vi.fn().mockResolvedValue(undefined);
      const selectedIds = ["1", "2"];
      const { result } = renderHook(() => useTableActions({}));

      await result.current.handleBulkAction(mockAction, selectedIds);

      expect(mockOpenNotification).toHaveBeenCalledWith({
        message: "Bulk action completed successfully",
        type: "success",
      });
      expect(mockOpenNotification).toHaveBeenCalledTimes(1);
    });

    it("should call openNotification with error message on failure", async () => {
      // Spy on console.error specifically for this test
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const errorMessage = "Bulk action failed";
      const mockAction = vi.fn().mockRejectedValue(new Error(errorMessage));
      const selectedIds = ["1", "2"];
      const { result } = renderHook(() => useTableActions({}));

      await act(async () => {
        await result.current.handleBulkAction(mockAction, selectedIds);
      });

      expect(mockOpenNotification).toHaveBeenCalledWith({
        description: errorMessage,
        message: "Bulk action failed",
        type: "error",
      });
      expect(mockOpenNotification).toHaveBeenCalledTimes(1);

      // Restore console.error after this test
      consoleErrorSpy.mockRestore();
    });
  });
});
