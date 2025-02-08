import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useTableState } from "./useTableState";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => {
      return store[key] || null;
    }),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(global, "localStorage", { value: localStorageMock });

// Mock setTimeout for animations
vi.useFakeTimers();

describe("useTableState", () => {
  afterEach(() => {
    cleanup();
    // Clear any pending fake timers before restoring real timers
    vi.clearAllTimers();
    vi.useRealTimers(); // Restore real timers

    vi.clearAllMocks();
    localStorageMock.clear(); // Clear mock localStorage after each test
  });

  beforeEach(() => {
    vi.useFakeTimers(); // Use fake timers
  });

  it("should initialize with default state", () => {
    const { result } = renderHook(() => useTableState({}));

    expect(result.current.density).toBe("default");
    expect(result.current.expanded).toEqual({});
    expect(result.current.columnOrder).toEqual([]);
    expect(result.current.rowAnimationClasses).toEqual({});
    expect(result.current.rowAnimationStyles).toEqual({});
    expect(result.current.activeColumnFilters).toEqual({});
    expect(result.current.virtualScrollIndex).toBeUndefined();
    expect(result.current.rowSelection).toEqual({});
    expect(result.current.progressiveData).toEqual([]);
    expect(result.current.currentPage).toBe(1);
    expect(result.current.hasMoreData).toBe(true);
    expect(result.current.isLoadingMore).toBe(false);
    expect(result.current.focusedCell).toBeNull(); // Default is null if enableKeyboardNavigation is false
    expect(result.current.editedValues).toEqual({});
    expect(result.current.editingCell).toBeNull();
  });

  it("should initialize with provided options", () => {
    const initialColumnOrder = ["col1", "col2"];
    // Include all properties required by AnimationConfig type
    const animationConfig = { duration: 500, highlightColor: "yellow", newRow: true, updatedCell: true, updatedRow: true };
    const rowHighlightRules = [{ condition: () => true, className: "highlight", priority: 1 }];
    const keyboardShortcuts = { moveUp: "W" };

    const { result } = renderHook(() =>
      useTableState({
        initialDensity: "compact",
        initialColumnOrder,
        enableAnimations: true,
        animationConfig,
        enableRowHighlighting: true,
        rowHighlightRules,
        enableKeyboardNavigation: true,
        keyboardShortcuts,
        colCount: 5,
        rowCount: 10,
        resource: "users",
      }),
    );

    expect(result.current.density).toBe("compact");
    expect(result.current.columnOrder).toEqual(initialColumnOrder);
    // focusedCell initialization is now handled by useKeyboardNavigation
    expect(result.current.keyboardShortcuts.moveUp).toBe("W"); // Merged shortcuts
    expect(result.current.keyboardShortcuts.moveDown).toBe("ArrowDown"); // Default shortcut still present
  });

  describe("columnOrder", () => {
    it("should load column order from localStorage on initial render if available", () => {
      const savedOrder = ["savedCol1", "savedCol2"];
      localStorageMock.setItem(
        "tableColumnOrder-testResource",
        JSON.stringify(savedOrder),
      );

      // Clear the spy before rendering to ensure we only count calls from this render
      localStorageMock.getItem.mockClear();

      const { result } = renderHook(() =>
        useTableState({ resource: "testResource" }),
      );

      expect(result.current.columnOrder).toEqual(savedOrder);
      expect(localStorageMock.getItem).toHaveBeenCalledWith(
        "tableColumnOrder-testResource",
      );
    });

    it("should use initialColumnOrder if both initialColumnOrder and localStorage are present", () => {
      const initialOrder = ["initialCol1", "initialCol2"];
      const savedOrder = ["savedCol1", "savedCol2"];
      localStorageMock.setItem(
        "tableColumnOrder-testResource",
        JSON.stringify(savedOrder),
      );

      const { result } = renderHook(() =>
        useTableState({ resource: "testResource", initialColumnOrder: initialOrder }),
      );

      expect(result.current.columnOrder).toEqual(initialOrder);
      // When initialColumnOrder is provided, localStorage is NOT checked
      expect(localStorageMock.getItem).not.toHaveBeenCalled();
    });

    it("should save column order to localStorage when handleColumnOrderChange is called", () => {
      const { result } = renderHook(() =>
        useTableState({ resource: "testResource" }),
      );
      const newOrder = ["newCol1", "newCol2", "newCol3"];

      act(() => {
        result.current.handleColumnOrderChange(newOrder);
      });

      expect(result.current.columnOrder).toEqual(newOrder);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "tableColumnOrder-testResource",
        JSON.stringify(newOrder),
      );
    });
  });

  describe("density", () => {
    it("should update density when handleDensityChange is called", () => {
      const { result } = renderHook(() => useTableState({}));

      act(() => {
        result.current.handleDensityChange("compact");
      });
      expect(result.current.density).toBe("compact");

      act(() => {
        result.current.handleDensityChange("comfortable");
      });
      expect(result.current.density).toBe("comfortable");
    });

    it("should return correct styles from getDensityStyles", () => {
      const { result } = renderHook(() => useTableState({}));

      act(() => {
        result.current.setDensity("default");
      });
      expect(result.current.getDensityStyles()).toEqual({ row: "py-4" });

      act(() => {
        result.current.setDensity("compact");
      });
      expect(result.current.getDensityStyles()).toEqual({ row: "py-2" });

      act(() => {
        result.current.setDensity("comfortable");
      });
      expect(result.current.getDensityStyles()).toEqual({ row: "py-3" });
    });
  });

  describe("rowSelection", () => {
    it("should update rowSelection when handleRowSelectionChange is called", () => {
      const { result } = renderHook(() => useTableState({}));

      act(() => {
        result.current.handleRowSelectionChange("row1", true);
      });
      expect(result.current.rowSelection).toEqual({ row1: true });

      act(() => {
        result.current.handleRowSelectionChange("row2", true);
      });
      expect(result.current.rowSelection).toEqual({ row1: true, row2: true });

      act(() => {
        result.current.handleRowSelectionChange("row1", false);
      });
      expect(result.current.rowSelection).toEqual({ row1: false, row2: true });
    });

    it("should clear rowSelection when clearRowSelection is called", () => {
      const { result } = renderHook(() => useTableState({}));

      act(() => {
        result.current.handleRowSelectionChange("row1", true);
        result.current.handleRowSelectionChange("row2", true);
      });
      expect(result.current.rowSelection).toEqual({ row1: true, row2: true });

      act(() => {
        result.current.clearRowSelection();
      });
      expect(result.current.rowSelection).toEqual({});
    });
  });

  describe("rowExpansion", () => {
    it("should update expanded state when handleRowExpansionChange is called", () => {
      const { result } = renderHook(() => useTableState({}));

      act(() => {
        result.current.handleRowExpansionChange("row1", true);
      });
      expect(result.current.expanded).toEqual({ row1: true });

      act(() => {
        result.current.handleRowExpansionChange("row2", true);
      });
      expect(result.current.expanded).toEqual({ row1: true, row2: true });

      act(() => {
        result.current.handleRowExpansionChange("row1", false);
      });
      expect(result.current.expanded).toEqual({ row1: false, row2: true });
    });
  });

  describe("animations", () => {
    const animationConfig = { duration: 100, highlightColor: "yellow", newRow: true, updatedRow: true, updatedCell: true };

    it("should not apply animations if enableAnimations is false", () => {
      const { result } = renderHook(() => useTableState({ enableAnimations: false, animationConfig }));
      const initialData = [{ id: "1", name: "A" }];

      act(() => {
        result.current.applyAnimations(initialData);
      });

      expect(result.current.rowAnimationClasses).toEqual({});
      expect(result.current.rowAnimationStyles).toEqual({});

      const newData = [{ id: "1", name: "B" }];
      act(() => {
        result.current.applyAnimations(newData);
      });

      expect(result.current.rowAnimationClasses).toEqual({});
      expect(result.current.rowAnimationStyles).toEqual({});
    });

    it("should not apply animations on the first data load", () => {
      const { result } = renderHook(() => useTableState({ enableAnimations: true, animationConfig }));
      const initialData = [{ id: "1", name: "A" }];

      act(() => {
        result.current.applyAnimations(initialData);
      });

      expect(result.current.rowAnimationClasses).toEqual({});
      expect(result.current.rowAnimationStyles).toEqual({});
      // The previousDataRef should be updated
      // This is hard to test directly, but subsequent calls will rely on it
    });

    it("should apply new row animation class for new rows", () => {
      const { result } = renderHook(() => useTableState({ enableAnimations: true, animationConfig }));
      const initialData = [{ id: "1", name: "A" }];
      const newData = [{ id: "1", name: "A" }, { id: "2", name: "B" }];

      // Simulate initial load
      act(() => {
        result.current.applyAnimations(initialData);
      });

      // Simulate data update with a new row
      act(() => {
        result.current.applyAnimations(newData);
      });

      expect(result.current.rowAnimationClasses).toEqual({ "2": "animate-fade-in" });
      expect(result.current.rowAnimationStyles).toEqual({}); // New rows don't get highlight style

      // Advance timers to clear animations
      act(() => {
        vi.advanceTimersByTime(animationConfig.duration);
      });

      expect(result.current.rowAnimationClasses).toEqual({});
      expect(result.current.rowAnimationStyles).toEqual({});
    });

    it("should apply updated row animation class and style for updated rows", () => {
      const { result } = renderHook(() => useTableState({ enableAnimations: true, animationConfig }));
      const initialData = [{ id: "1", name: "A" }, { id: "2", name: "B" }];
      const newData = [{ id: "1", name: "A" }, { id: "2", name: "C" }]; // Row 2 updated

      // Simulate initial load
      act(() => {
        result.current.applyAnimations(initialData);
      });

      // Simulate data update with an updated row
      act(() => {
        result.current.applyAnimations(newData);
      });

      expect(result.current.rowAnimationClasses).toEqual({ "2": "animate-highlight" });
      expect(result.current.rowAnimationStyles).toEqual({
        "2": {
          backgroundColor: animationConfig.highlightColor,
          transition: `background-color ${animationConfig.duration}ms ease-out`,
        },
      });

      // Advance timers to clear animations
      act(() => {
        vi.advanceTimersByTime(animationConfig.duration);
      });

      expect(result.current.rowAnimationClasses).toEqual({});
      expect(result.current.rowAnimationStyles).toEqual({});
    });

    it("should apply animations for both new and updated rows", () => {
      const { result } = renderHook(() => useTableState({ enableAnimations: true, animationConfig }));
      const initialData = [{ id: "1", name: "A" }];
      const newData = [{ id: "1", name: "B" }, { id: "2", name: "C" }]; // Row 1 updated, Row 2 new

      // Simulate initial load
      act(() => {
        result.current.applyAnimations(initialData);
      });

      // Simulate data update
      act(() => {
        result.current.applyAnimations(newData);
      });

      expect(result.current.rowAnimationClasses).toEqual({
        "1": "animate-highlight",
        "2": "animate-fade-in",
      });
      expect(result.current.rowAnimationStyles).toEqual({
        "1": {
          backgroundColor: animationConfig.highlightColor,
          transition: `background-color ${animationConfig.duration}ms ease-out`,
        },
      });

      // Advance timers to clear animations
      act(() => {
        vi.advanceTimersByTime(animationConfig.duration);
      });

      expect(result.current.rowAnimationClasses).toEqual({});
      expect(result.current.rowAnimationStyles).toEqual({});
    });

    it("getRowAnimationClass should return the correct class", () => {
      const { result } = renderHook(() => useTableState({ enableAnimations: true, animationConfig }));
      const initialData = [{ id: "1", name: "A" }];
      const newData = [{ id: "1", name: "B" }, { id: "2", name: "C" }];

      act(() => {
        result.current.applyAnimations(initialData);
      });
      act(() => {
        result.current.applyAnimations(newData);
      });

      expect(result.current.getRowAnimationClass("1")).toBe("animate-highlight");
      expect(result.current.getRowAnimationClass("2")).toBe("animate-fade-in");
      expect(result.current.getRowAnimationClass("3")).toBe(""); // Non-animated row
    });

    it("getRowAnimationStyle should return the correct style", () => {
      const { result } = renderHook(() => useTableState({ enableAnimations: true, animationConfig }));
      const initialData = [{ id: "1", name: "A" }];
      const newData = [{ id: "1", name: "B" }, { id: "2", name: "C" }];

      act(() => {
        result.current.applyAnimations(initialData);
      });
      act(() => {
        result.current.applyAnimations(newData);
      });

      expect(result.current.getRowAnimationStyle("1")).toEqual({
        backgroundColor: animationConfig.highlightColor,
        transition: `background-color ${animationConfig.duration}ms ease-out`,
      });
      expect(result.current.getRowAnimationStyle("2")).toEqual({}); // New rows don't get highlight style
      expect(result.current.getRowAnimationStyle("3")).toEqual({}); // Non-animated row
    });
  });

  describe("rowHighlighting", () => {
    const rowHighlightRules = [
      { condition: (row: any) => row.status === "critical", className: "bg-red-100", priority: 2 },
      { condition: (row: any) => row.status === "warning", className: "bg-yellow-100", priority: 1 },
    ];
    const mockRow = (status: string) => ({ original: { status } });

    it("should return the correct highlight class based on rules and priority", () => {
      const { result } = renderHook(() => useTableState({ enableRowHighlighting: true, rowHighlightRules }));

      expect(result.current.getRowHighlightClass(mockRow("critical"))).toBe("bg-red-100");
      expect(result.current.getRowHighlightClass(mockRow("warning"))).toBe("bg-yellow-100");
      expect(result.current.getRowHighlightClass(mockRow("info"))).toBe(""); // No matching rule
    });

    it("should return empty string if enableRowHighlighting is false", () => {
      const { result } = renderHook(() => useTableState({ enableRowHighlighting: false, rowHighlightRules }));
      expect(result.current.getRowHighlightClass(mockRow("critical"))).toBe("");
    });

    it("should apply higher priority rule if multiple conditions match", () => {
      const rulesWithOverlap = [
        { condition: (row: any) => row.value > 50, className: "bg-high", priority: 1 },
        { condition: (row: any) => row.value > 75, className: "bg-very-high", priority: 2 },
      ];
      const { result } = renderHook(() => useTableState({ enableRowHighlighting: true, rowHighlightRules: rulesWithOverlap }));

      expect(result.current.getRowHighlightClass({ original: { value: 60 } })).toBe("bg-high");
      expect(result.current.getRowHighlightClass({ original: { value: 80 } })).toBe("bg-very-high"); // Higher priority wins
    });
  });

  // Note: Keyboard navigation tests are complex due to DOM interaction and event listeners.
  // Basic state updates like setFocusedCell are covered by general state tests.
  // Testing the useEffect for event listeners and moveFocus logic requires mocking window events and cellRefs,
  // which is better handled in a dedicated test suite or integration tests.
  // The useKeyboardNavigation hook specifically handles the event listeners and focus movement,
  // so testing that logic is more appropriate there.
});
