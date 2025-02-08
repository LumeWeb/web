import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
// Removed: import { useState } from "react"; // Import useState

import type { PolitenessLevel } from "../../screen-reader/hooks/useScreenReaderAnnouncement"; // Import PolitenessLevel

import { useScreenReaderAnnouncement } from "../../screen-reader/hooks/useScreenReaderAnnouncement";
import { useCellEditing } from "./useCellEditing";

// Mock the screen reader hook
vi.mock("../../screen-reader/hooks/useScreenReaderAnnouncement", () => ({
  useScreenReaderAnnouncement: vi.fn(),
}));

const mockAnnounce = vi.fn();

describe("useCellEditing", () => {
  const mockGetRowModel = vi.fn();
  const mockOnSaveEdit = vi.fn();
  const mockRefetch = vi.fn();
  const mockSetEditedValues = vi.fn();
  const mockSetEditingCell = vi.fn();

  // Define defaultOptions outside beforeEach to maintain reference for mocks
  const defaultOptions = {
    editedValues: {} as Record<string, Record<string, any>>, // Initialize with empty object
    editingCell: null as null | {
      columnId: string;
      rowId: string;
      value: any;
    }, // Initialize with null
    enableDirectCellEdit: true,
    enableInlineEdit: true,
    getRowModel: mockGetRowModel,
    onSaveEdit: mockOnSaveEdit,
    refetch: mockRefetch,
    setEditedValues: mockSetEditedValues,
    setEditingCell: mockSetEditingCell,
  };

  beforeEach(() => {
    console.log("useCellEditing beforeEach");
    // Mock the screen reader hook to return the full expected object
    vi.mocked(useScreenReaderAnnouncement).mockReturnValue({
      announce: mockAnnounce,
      announcement: "", // Add mock for announcement
      politeness: "polite" as PolitenessLevel, // Add mock for politeness
    });

    // Reset mocks before each test
    vi.clearAllMocks();

    // Mock setters as spies without implementation
    mockSetEditedValues.mockClear();
    mockSetEditingCell.mockClear();

    // Reset other mocks
    mockGetRowModel.mockReturnValue({ rows: [] });
    mockOnSaveEdit.mockResolvedValue(undefined);
    mockRefetch.mockResolvedValue(undefined);
    mockAnnounce.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it("should return editing functions", () => {
    const { result } = renderHook(
      ({ editedValues, editingCell, setEditedValues, setEditingCell }) =>
        useCellEditing({
          ...defaultOptions,
          editedValues,
          editingCell,
          setEditedValues,
          setEditingCell,
        }),
      {
        initialProps: {
          editedValues: {},
          editingCell: null,
          setEditedValues: mockSetEditedValues,
          setEditingCell: mockSetEditingCell,
        },
      },
    );

    expect(result.current).toHaveProperty("cancelEdit");
    expect(result.current).toHaveProperty("saveEdit");
    expect(result.current).toHaveProperty("startEditing");
    expect(result.current).toHaveProperty("updateEditValue");

    expect(typeof result.current.cancelEdit).toBe("function");
    expect(typeof result.current.saveEdit).toBe("function");
    expect(typeof result.current.startEditing).toBe("function");
    expect(typeof result.current.updateEditValue).toBe("function");
  });

  describe("startEditing", () => {
    it("should call setEditingCell with correct values if enabled", () => {
      const rowId = "row1";
      const columnId = "colA";
      const value = "initialValue";

      const { result } = renderHook(
        ({ editedValues, editingCell, setEditedValues, setEditingCell }) =>
          useCellEditing({
            ...defaultOptions,
            editedValues,
            editingCell,
            setEditedValues: mockSetEditedValues,
            setEditingCell: mockSetEditingCell,
          }),
        {
          initialProps: {
            editedValues: {},
            editingCell: null, // Start with null editing cell
            setEditedValues: mockSetEditedValues,
            setEditingCell: mockSetEditingCell,
          },
        },
      );

      act(() => {
        result.current.startEditing(rowId, columnId, value);
      });

      // Assert that the setter was called with the expected value
      expect(mockSetEditingCell).toHaveBeenCalledWith({
        columnId,
        rowId,
        value,
      });
    });

    it("should not call setEditingCell if enableInlineEdit is false", () => {
      const options = { ...defaultOptions, enableInlineEdit: false };
      const { result } = renderHook(
        ({ editedValues, editingCell, setEditedValues, setEditingCell }) =>
          useCellEditing({
            ...options,
            editedValues,
            editingCell,
            setEditedValues: mockSetEditedValues,
            setEditingCell: mockSetEditingCell,
          }),
        {
          initialProps: {
            editedValues: {},
            editingCell: null,
            setEditedValues: mockSetEditedValues,
            setEditingCell: mockSetEditingCell,
          },
        },
      );

      act(() => {
        result.current.startEditing("row1", "colA", "value");
      });

      expect(mockSetEditingCell).not.toHaveBeenCalled();
    });

    it("should not call setEditingCell if enableDirectCellEdit is false", () => {
      const options = { ...defaultOptions, enableDirectCellEdit: false };
      const { result } = renderHook(
        ({ editedValues, editingCell, setEditedValues, setEditingCell }) =>
          useCellEditing({
            ...options,
            editedValues,
            editingCell,
            setEditedValues: mockSetEditedValues,
            setEditingCell: mockSetEditingCell,
          }),
        {
          initialProps: {
            editedValues: {},
            editingCell: null,
            setEditedValues: mockSetEditedValues,
            setEditingCell: mockSetEditingCell,
          },
        },
      );

      act(() => {
        result.current.startEditing("row1", "colA", "value");
      });

      expect(mockSetEditingCell).not.toHaveBeenCalled();
    });
  });

  describe("updateEditValue", () => {
    it("should update the value in editingCell state", () => {
      const initialEditingCell = {
        columnId: "colA",
        rowId: "row1",
        value: "oldValue",
      };

      const { result } = renderHook(
        ({ editedValues, editingCell, setEditedValues, setEditingCell }) =>
          useCellEditing({
            ...defaultOptions,
            editedValues,
            editingCell,
            setEditedValues: mockSetEditedValues,
            setEditingCell: mockSetEditingCell,
          }),
        {
          initialProps: {
            editedValues: {},
            editingCell: initialEditingCell, // Pass initial editing cell state
            setEditedValues: mockSetEditedValues,
            setEditingCell: mockSetEditingCell,
          },
        },
      );

      const newValue = "newValue";

      act(() => {
        result.current.updateEditValue(newValue);
      });

      // Assert that the setter was called with the updater function
      expect(mockSetEditingCell).toHaveBeenCalledWith(expect.any(Function));

      // Manually apply the updater function to check its logic
      const updaterFn = mockSetEditingCell.mock.calls[0][0];
      expect(updaterFn(initialEditingCell)).toEqual({
        ...initialEditingCell,
        value: newValue,
      });
    });

    it("should do nothing if editingCell is null", () => {
      const { result } = renderHook(
        ({ editedValues, editingCell, setEditedValues, setEditingCell }) =>
          useCellEditing({
            ...defaultOptions,
            editedValues,
            editingCell,
            setEditedValues: mockSetEditedValues,
            setEditingCell: mockSetEditingCell,
          }),
        {
          initialProps: {
            editedValues: {},
            editingCell: null, // editingCell is null
            setEditedValues: mockSetEditedValues,
            setEditingCell: mockSetEditingCell,
          },
        },
      );

      act(() => {
        result.current.updateEditValue("newValue");
      });

      expect(mockSetEditingCell).not.toHaveBeenCalled();
    });
  });

  describe("saveEdit", () => {
    const originalRow = { colA: "oldValue", colB: "staticValue", id: "row1" };
    const mockRow = { id: "row1", original: originalRow };

    it("should update editedValues state", async () => {
      const initialEditingCell = {
        columnId: "colA",
        rowId: "row1",
        value: "newValue",
      };
      const initialEditedValues = {}; // Initial empty editedValues

      mockGetRowModel.mockReturnValue({ rows: [mockRow] });

      const { result } = renderHook(
        ({ editedValues, editingCell, setEditedValues, setEditingCell }) =>
          useCellEditing({
            ...defaultOptions,
            editedValues,
            editingCell,
            onSaveEdit: mockOnSaveEdit, // Ensure onSaveEdit is provided
            setEditedValues: mockSetEditedValues,
            setEditingCell: mockSetEditingCell,
          }),
        {
          initialProps: {
            editedValues: initialEditedValues,
            editingCell: initialEditingCell,
            setEditedValues: mockSetEditedValues,
            setEditingCell: mockSetEditingCell,
          },
        },
      );

      await act(async () => {
        await result.current.saveEdit();
      });

      // Assert that setEditedValues was called with the correct updater function
      expect(mockSetEditedValues).toHaveBeenCalledTimes(1);
      expect(mockSetEditedValues).toHaveBeenCalledWith(expect.any(Function));

      // Manually apply the updater to check its logic
      const updaterFn = mockSetEditedValues.mock.calls[0][0];
      const expectedEditedValues = {
        row1: { colA: "newValue" },
      };
      expect(updaterFn({})).toEqual(expectedEditedValues); // Apply to initial empty state
    });

    it("should call onSaveEdit with correct data", async () => {
      const initialEditingCell = {
        columnId: "colA",
        rowId: "row1",
        value: "newValue",
      };
      const initialEditedValues = {};

      mockGetRowModel.mockReturnValue({ rows: [mockRow] });

      const { result } = renderHook(
        ({ editedValues, editingCell, setEditedValues, setEditingCell }) =>
          useCellEditing({
            ...defaultOptions,
            editedValues,
            editingCell,
            onSaveEdit: mockOnSaveEdit, // Ensure onSaveEdit is provided
            setEditedValues: mockSetEditedValues,
            setEditingCell: mockSetEditingCell,
          }),
        {
          initialProps: {
            editedValues: initialEditedValues,
            editingCell: initialEditingCell,
            setEditedValues: mockSetEditedValues,
            setEditingCell: mockSetEditingCell,
          },
        },
      );

      await act(async () => {
        await result.current.saveEdit();
      });

      const expectedUpdatedData = {
        ...originalRow,
        colA: "newValue", // The currently edited value
      };

      expect(mockOnSaveEdit).toHaveBeenCalledWith(
        initialEditingCell.rowId,
        expectedUpdatedData,
        originalRow,
      );
    });

    it("should merge previously edited values when calling onSaveEdit", async () => {
      const initialEditingCell = {
        columnId: "colA",
        rowId: "row1",
        value: "newValue",
      };
      const initialEditedValues = {
        row1: { colB: "editedB" },
      };

      mockGetRowModel.mockReturnValue({ rows: [mockRow] });

      const { result } = renderHook(
        ({ editedValues, editingCell, setEditedValues, setEditingCell }) =>
          useCellEditing({
            ...defaultOptions,
            editedValues,
            editingCell,
            onSaveEdit: mockOnSaveEdit, // Ensure onSaveEdit is provided
            setEditedValues: mockSetEditedValues,
            setEditingCell: mockSetEditingCell,
          }),
        {
          initialProps: {
            editedValues: initialEditedValues,
            editingCell: initialEditingCell,
            setEditedValues: mockSetEditedValues,
            setEditingCell: mockSetEditingCell,
          },
        },
      );

      await act(async () => {
        await result.current.saveEdit();
      });

      const expectedUpdatedData = {
        ...originalRow,
        colA: "newValue", // Currently edited value
        colB: "editedB", // Previously edited value
      };

      expect(mockOnSaveEdit).toHaveBeenCalledWith(
        initialEditingCell.rowId,
        expectedUpdatedData,
        originalRow,
      );
    });

    it("should call refetch if provided after successful save", async () => {
      const initialEditingCell = {
        columnId: "colA",
        rowId: "row1",
        value: "newValue",
      };
      const initialEditedValues = {};

      mockGetRowModel.mockReturnValue({ rows: [mockRow] });

      const { result } = renderHook(
        ({ editedValues, editingCell, setEditedValues, setEditingCell }) =>
          useCellEditing({
            ...defaultOptions,
            editedValues,
            editingCell,
            onSaveEdit: mockOnSaveEdit, // Ensure onSaveEdit is provided
            refetch: mockRefetch, // Ensure refetch is provided
            setEditedValues: mockSetEditedValues,
            setEditingCell: mockSetEditingCell,
          }),
        {
          initialProps: {
            editedValues: initialEditedValues,
            editingCell: initialEditingCell,
            setEditedValues: mockSetEditedValues,
            setEditingCell: mockSetEditingCell,
          },
        },
      );

      await act(async () => {
        await result.current.saveEdit();
      });

      expect(mockRefetch).toHaveBeenCalled();
    });

    it("should clear editingCell state after successful save", async () => {
      const initialEditingCell = {
        columnId: "colA",
        rowId: "row1",
        value: "newValue",
      };
      const initialEditedValues = {};

      mockGetRowModel.mockReturnValue({ rows: [mockRow] });

      const { result } = renderHook(
        ({ editedValues, editingCell, setEditedValues, setEditingCell }) =>
          useCellEditing({
            ...defaultOptions,
            editedValues,
            editingCell,
            onSaveEdit: mockOnSaveEdit, // Ensure onSaveEdit is provided
            setEditedValues: mockSetEditedValues,
            setEditingCell: mockSetEditingCell,
          }),
        {
          initialProps: {
            editedValues: initialEditedValues,
            editingCell: initialEditingCell,
            setEditedValues: mockSetEditedValues,
            setEditingCell: mockSetEditingCell,
          },
        },
      );

      await act(async () => {
        await result.current.saveEdit();
      });

      // mockSetEditingCell should have been called once with null by saveEdit
      expect(mockSetEditingCell).toHaveBeenCalledTimes(1);
      expect(mockSetEditingCell).toHaveBeenCalledWith(null);
    });

    it("should announce saving and success messages", async () => {
      const initialEditingCell = {
        columnId: "colA",
        rowId: "row1",
        value: "newValue",
      };
      const initialEditedValues = {};

      mockGetRowModel.mockReturnValue({ rows: [mockRow] });

      const { result } = renderHook(
        ({ editedValues, editingCell, setEditedValues, setEditingCell }) =>
          useCellEditing({
            ...defaultOptions,
            editedValues,
            editingCell,
            onSaveEdit: mockOnSaveEdit, // Ensure onSaveEdit is provided
            setEditedValues: mockSetEditedValues,
            setEditingCell: mockSetEditingCell,
          }),
        {
          initialProps: {
            editedValues: initialEditedValues,
            editingCell: initialEditingCell,
            setEditedValues: mockSetEditedValues,
            setEditingCell: mockSetEditingCell,
          },
        },
      );

      await act(async () => {
        await result.current.saveEdit();
      });

      expect(mockAnnounce).toHaveBeenCalledWith("Saving changes...", "polite");
      expect(mockAnnounce).toHaveBeenCalledWith(
        "Changes saved successfully",
        "polite",
      );
      expect(mockAnnounce).toHaveBeenCalledTimes(2);
    });

    it("should announce error message if onSaveEdit fails", async () => {
      const initialEditingCell = {
        columnId: "colA",
        rowId: "row1",
        value: "newValue",
      };
      const initialEditedValues = {};

      mockGetRowModel.mockReturnValue({ rows: [mockRow] });
      const errorMessage = "Save failed";
      mockOnSaveEdit.mockRejectedValue(new Error(errorMessage));

      // Spy on console.error for this test
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const { result } = renderHook(
        ({ editedValues, editingCell, setEditedValues, setEditingCell }) =>
          useCellEditing({
            ...defaultOptions,
            editedValues,
            editingCell,
            onSaveEdit: mockOnSaveEdit, // Ensure onSaveEdit is provided
            setEditedValues: mockSetEditedValues,
            setEditingCell: mockSetEditingCell,
          }),
        {
          initialProps: {
            editedValues: initialEditedValues,
            editingCell: initialEditingCell,
            setEditedValues: mockSetEditedValues,
            setEditingCell: mockSetEditingCell,
          },
        },
      );

      await act(async () => {
        await result.current.saveEdit();
      });

      expect(mockAnnounce).toHaveBeenCalledWith("Saving changes...", "polite");
      expect(mockAnnounce).toHaveBeenCalledWith(
        "Error saving changes",
        "assertive",
      );
      expect(mockAnnounce).toHaveBeenCalledTimes(2);
      // Ensure editing state is still cleared even on error
      expect(mockSetEditingCell).toHaveBeenCalledTimes(1);
      expect(mockSetEditingCell).toHaveBeenCalledWith(null);

      // Assert that console.error was called
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error saving edit:",
        expect.any(Error)
      );

      // Restore console.error
      consoleErrorSpy.mockRestore();
    });

    it("should do nothing if editingCell is null", async () => {
      const { result } = renderHook(
        ({ editedValues, editingCell, setEditedValues, setEditingCell }) =>
          useCellEditing({
            ...defaultOptions,
            editedValues,
            editingCell,
            onSaveEdit: mockOnSaveEdit, // Ensure onSaveEdit is provided
            refetch: mockRefetch, // Ensure refetch is provided
            setEditedValues: mockSetEditedValues,
            setEditingCell: mockSetEditingCell,
          }),
        {
          initialProps: {
            editedValues: {},
            editingCell: null, // editingCell is null
            setEditedValues: mockSetEditedValues,
            setEditingCell: mockSetEditingCell,
          },
        },
      );

      await act(async () => {
        await result.current.saveEdit();
      });

      expect(mockSetEditedValues).not.toHaveBeenCalled();
      expect(mockGetRowModel).not.toHaveBeenCalled();
      expect(mockOnSaveEdit).not.toHaveBeenCalled();
      expect(mockRefetch).not.toHaveBeenCalled();
      expect(mockSetEditingCell).not.toHaveBeenCalled(); // setEditingCell is not called if editingCell is null
      expect(mockAnnounce).not.toHaveBeenCalled();
    });

    it("should do nothing if row is not found", async () => {
      const initialEditingCell = {
        columnId: "colA",
        rowId: "row1",
        value: "newValue",
      };
      const initialEditedValues = {};

      // Mock getRowModel to return no rows
      mockGetRowModel.mockReturnValue({ rows: [] });

      const { result } = renderHook(
        ({ editedValues, editingCell, setEditedValues, setEditingCell }) =>
          useCellEditing({
            ...defaultOptions, // Use default options for other props
            editedValues,
            editingCell,
            onSaveEdit: mockOnSaveEdit, // Ensure onSaveEdit is provided for this test
            refetch: mockRefetch, // Ensure refetch is provided for this test
            setEditedValues: mockSetEditedValues,
            setEditingCell: mockSetEditingCell,
          }),
        {
          initialProps: {
            editedValues: initialEditedValues,
            editingCell: initialEditingCell,
            setEditedValues: mockSetEditedValues,
            setEditingCell: mockSetEditingCell,
          },
        },
      );

      await act(async () => {
        await result.current.saveEdit();
      });

      // Assertions:
      // mockSetEditedValues should have been called once with the update before the return
      expect(mockSetEditedValues).toHaveBeenCalledTimes(1);
      expect(mockSetEditedValues).toHaveBeenCalledWith(expect.any(Function));

      // getRowModel should have been called once
      expect(mockGetRowModel).toHaveBeenCalledTimes(1);

      // onSaveEdit should NOT have been called because row was not found
      expect(mockOnSaveEdit).not.toHaveBeenCalled();

      // refetch should NOT have been called because onSaveEdit was not called
      expect(mockRefetch).not.toHaveBeenCalled();

      // mockSetEditingCell should NOT have been called with null because saveEdit returned early
      expect(mockSetEditingCell).not.toHaveBeenCalledWith(null);

      // Announce "Saving changes..." should NOT have been called because onSaveEdit was not called
      expect(mockAnnounce).not.toHaveBeenCalledWith(
        "Saving changes...",
        "polite",
      );
      expect(mockAnnounce).not.toHaveBeenCalledWith(
        "Changes saved successfully",
        "polite",
      );
      expect(mockAnnounce).not.toHaveBeenCalledWith(
        "Error saving changes",
        "assertive",
      );
      expect(mockAnnounce).not.toHaveBeenCalled(); // No announcements should happen
    });
  });

  describe("cancelEdit", () => {
    it("should clear editingCell state", () => {
      const initialEditingCell = {
        columnId: "colA",
        rowId: "row1",
        value: "value",
      };
      const initialEditedValues = {};

      const { result } = renderHook(
        ({ editedValues, editingCell, setEditedValues, setEditingCell }) =>
          useCellEditing({
            ...defaultOptions,
            editedValues,
            editingCell,
            setEditedValues: mockSetEditedValues,
            setEditingCell: mockSetEditingCell,
          }),
        {
          initialProps: {
            editedValues: initialEditedValues,
            editingCell: initialEditingCell,
            setEditedValues: mockSetEditedValues, // Pass mock
            setEditingCell: mockSetEditingCell, // Pass mock
          },
        },
      );

      act(() => {
        result.current.cancelEdit();
      });

      // mockSetEditingCell should have been called once with null by cancelEdit
      expect(mockSetEditingCell).toHaveBeenCalledTimes(1);
      expect(mockSetEditingCell).toHaveBeenCalledWith(null);
    });

    it("should announce cancellation", () => {
      const initialEditingCell = {
        columnId: "colA",
        rowId: "row1",
        value: "value",
      };

      const { result } = renderHook(
        ({ editedValues, editingCell, setEditedValues, setEditingCell }) =>
          useCellEditing({
            ...defaultOptions,
            editedValues, // Pass initial state via props
            editingCell, // Pass initial state via props
            setEditedValues: mockSetEditedValues, // Pass mock
            setEditingCell: mockSetEditingCell, // Pass mock
          }),
        {
          initialProps: {
            editedValues: {}, // Pass initial state
            editingCell: initialEditingCell, // Pass initial state
            setEditedValues: mockSetEditedValues, // Pass mock
            setEditingCell: mockSetEditingCell, // Pass mock
          },
        },
      );

      act(() => {
        result.current.cancelEdit();
      });

      // Assert that the setter was called (optional, but good practice)
      expect(mockSetEditingCell).toHaveBeenCalledWith(null);
      // Assert the announcement
      expect(mockAnnounce).toHaveBeenCalledWith("Edit cancelled", "polite");
    });
  });
});
