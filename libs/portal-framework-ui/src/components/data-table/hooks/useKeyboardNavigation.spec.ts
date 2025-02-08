import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useKeyboardNavigation } from "./useKeyboardNavigation";
import { useScreenReaderAnnouncement } from "../../screen-reader/hooks/useScreenReaderAnnouncement";
import type { KeyboardShortcutConfig } from "../types";
import type { PolitenessLevel } from "../../screen-reader/hooks/useScreenReaderAnnouncement"; // Import PolitenessLevel

// Mock the screen reader hook
vi.mock("../../screen-reader/hooks/useScreenReaderAnnouncement", () => ({
  useScreenReaderAnnouncement: vi.fn(),
}));

const mockAnnounce = vi.fn();

// Mock window event listeners and store handlers
const handlers: Record<string, ((e: Event) => void)[]> = {};

const mockAddEventListener = vi.fn((event: string, handler: (e: Event) => void) => {
  if (!handlers[event]) {
    handlers[event] = [];
  }
  handlers[event].push(handler);
});

const mockRemoveEventListener = vi.fn((event: string, handler: (e: Event) => void) => {
  if (handlers[event]) {
    handlers[event] = handlers[event].filter(h => h !== handler);
  }
});

vi.spyOn(window, "addEventListener").mockImplementation(mockAddEventListener as any); // Cast to any to match signature
vi.spyOn(window, "removeEventListener").mockImplementation(mockRemoveEventListener as any); // Cast to any to match signature

// Helper to dispatch events and trigger handlers
const dispatchEvent = (event: Event) => {
  if (handlers[event.type]) {
    // Iterate over a copy in case handlers are removed during iteration
    [...handlers[event.type]].forEach(handler => handler(event));
  }
};

// Mock scrollIntoView
const mockScrollIntoView = vi.fn();
const mockCellElement = {
  focus: vi.fn(() => {
    // Simulate focusing the element by setting document.activeElement
    Object.defineProperty(document, 'activeElement', {
      value: mockCellElement,
      configurable: true, // Allow redefining
    });
  }),
  scrollIntoView: mockScrollIntoView,
};

// Mock preventDefault on KeyboardEvent prototype
const originalPreventDefault = KeyboardEvent.prototype.preventDefault;
const mockPreventDefault = vi.fn();

// Mock setTimeout
vi.useFakeTimers();

describe("useKeyboardNavigation", () => {
  // Declare hookResult and rerender here
  let hookResult: ReturnType<typeof renderHook>;
  let rerender: ReturnType<typeof renderHook>['rerender'];

  const mockCellRefs = { current: {} as Record<string, HTMLTableCellElement | null> };
  const mockGetRowModel = vi.fn(() => {
    // Return default mock data structure
    return {
      rows: Array(10).fill(null).map((_, i) => ({ id: `row-${i}`, toggleSelected: vi.fn(), getIsSelected: vi.fn() })),
    };
  });
  const mockGetHeaderGroups = vi.fn(() => {
    // Return default mock data structure with distinct headers for announcement tests
    return [
      { headers: Array(5).fill(null).map((_, i) => ({ column: { columnDef: { header: `Col ${i}` } } })) },
    ];
  });
  const mockSetExpanded = vi.fn();
  const mockSetFocusedCell = vi.fn();
  const mockSetVirtualScrollIndex = vi.fn();
  const mockToggleSelected = vi.fn();

  const defaultShortcuts: KeyboardShortcutConfig = {
    cancelEdit: "Escape",
    moveUp: "ArrowUp",
    moveDown: "ArrowDown",
    moveLeft: "ArrowLeft",
    moveRight: "ArrowRight",
    firstCellInRow: "Home",
    lastCellInRow: "End",
    firstCell: "Control+Home",
    lastCell: "Control+End",
    expandRow: "Enter",
    selectRow: " ", // Space key
    enterEdit: "F2",
    saveEdit: "Enter", // Note: saveEdit and expandRow share 'Enter' by default
  };

  // Define defaultOptions outside beforeEach to maintain reference for mocks
  const defaultOptions = {
    cellRefs: mockCellRefs,
    colCount: 5, // Default col count
    enableExpandableRows: false,
    enableKeyboardNavigation: true,
    enableRowSelection: false,
    enableVirtualScroll: false,
    expanded: {} as Record<string, boolean>, // Initialize with empty object
    focusedCell: { colIndex: 0, rowIndex: 0 } as null | { colIndex: number; rowIndex: number }, // Initialize with default focus
    getHeaderGroups: mockGetHeaderGroups,
    getRowModel: mockGetRowModel,
    rowCount: 10, // Default row count
    setExpanded: mockSetExpanded,
    setFocusedCell: mockSetFocusedCell,
    setVirtualScrollIndex: mockSetVirtualScrollIndex,
    shortcuts: defaultShortcuts,
  };

  beforeEach(() => {
    // Mock the screen reader hook to return the full expected object
    vi.mocked(useScreenReaderAnnouncement).mockReturnValue({
      announce: mockAnnounce,
      announcement: "", // Add mock for announcement
      politeness: "polite" as PolitenessLevel, // Add mock for politeness
    });

    // Apply the preventDefault mock
    Object.defineProperty(KeyboardEvent.prototype, 'preventDefault', {
      writable: true,
      value: mockPreventDefault,
    });

    // Mock document.activeElement
    Object.defineProperty(document, 'activeElement', {
      value: document.body, // Default to body
      configurable: true,
    });

    vi.clearAllMocks();
    vi.useFakeTimers(); // Ensure fake timers are used

    // Reset the state held by the defaultOptions object for mocks
    defaultOptions.expanded = {};
    // focusedCell is managed by the hook's prop, not directly reset here
    // defaultOptions.focusedCell = { colIndex: 0, rowIndex: 0 }; // Reset to initial focus

    // Reset mock DOM elements
    mockCellRefs.current = {};
    mockCellElement.focus.mockClear();
    mockScrollIntoView.mockClear();
    mockPreventDefault.mockClear(); // Clear preventDefault mock calls

    // Default mock data
    mockGetRowModel.mockReturnValue({
      rows: Array(defaultOptions.rowCount).fill(null).map((_, i) => ({ id: `row-${i}`, toggleSelected: vi.fn(), getIsSelected: vi.fn() })),
    });
    // Ensure headers have distinct names for announcement tests
    mockGetHeaderGroups.mockReturnValue([
      { headers: Array(defaultOptions.colCount).fill(null).map((_, i) => ({ column: { columnDef: { header: `Col ${i}` } } })) },
    ]);
    mockToggleSelected.mockClear();
    mockAnnounce.mockClear(); // Clear announce mock calls
    mockSetFocusedCell.mockClear(); // Clear setFocusedCell mock calls
    mockSetExpanded.mockClear(); // Clear setExpanded mock calls
    mockSetVirtualScrollIndex.mockClear(); // Clear setVirtualScrollIndex mock calls

    // Clear handlers map
    for (const eventType in handlers) {
      delete handlers[eventType];
    }

    // Render the hook once in beforeEach
    hookResult = renderHook(() => useKeyboardNavigation(defaultOptions));
    rerender = hookResult.rerender;
    // The handler will be captured from the first render's useEffect.
    // Subsequent rerenders in tests will update the props and cause the effect to re-run,
    // adding a new handler to the map and removing the old one.
  });

  afterEach(() => {
    cleanup();
    // Restore original preventDefault
    Object.defineProperty(KeyboardEvent.prototype, 'preventDefault', {
      writable: true,
      value: originalPreventDefault,
    });
     // Restore original document.activeElement
    Object.defineProperty(document, 'activeElement', {
      value: null, // Or original value if captured
      configurable: true,
    });
    vi.useRealTimers(); // Restore real timers
    // Reset defaultOptions state after each test
    defaultOptions.expanded = {};
    defaultOptions.focusedCell = { colIndex: 0, rowIndex: 0 };
  });

  it("should add and remove keydown event listener", () => {
    // This test already renders the hook implicitly via beforeEach setup.
    // We just need to unmount it.
    // The handler is added in the beforeEach render.
    expect(mockAddEventListener).toHaveBeenCalledWith(
      "keydown",
      expect.any(Function),
    );
    // Get the handler from the addEventListener call in beforeEach
    const handler = mockAddEventListener.mock.calls[0][1];

    // Ensure the handler is in the map before unmounting
    expect(handlers['keydown']).toContain(handler);

    // Unmount the hook
    hookResult.unmount();

    // Check that removeEventListener was called with the correct handler
    expect(mockRemoveEventListener).toHaveBeenCalledWith("keydown", handler);
    // Ensure the handler is removed from the map
    expect(handlers['keydown']).not.toContain(handler);
  });

  it("should not add event listener if enableKeyboardNavigation is false", () => {
    // Clear mocks from beforeEach render
    mockAddEventListener.mockClear();
    mockRemoveEventListener.mockClear();

    renderHook(() =>
      useKeyboardNavigation({ ...defaultOptions, enableKeyboardNavigation: false }),
    );

    expect(mockAddEventListener).not.toHaveBeenCalled();
  });

  it("should focus the cell element when focusedCell changes", async () => {
    const { rerender } = renderHook(
      ({ options }) => useKeyboardNavigation(options),
      { initialProps: { options: defaultOptions } },
    );

    const cellKey = "1-2";
    mockCellRefs.current[cellKey] = mockCellElement as any;

    // Clear mocks from initial render's useEffect (which focuses 0,0)
    mockCellElement.focus.mockClear();
    mockScrollIntoView.mockClear();

    // Simulate focusedCell changing by rerendering with a new value
    const newFocusedCell = { colIndex: 2, rowIndex: 1 };
    act(() => {
      rerender({ options: { ...defaultOptions, focusedCell: newFocusedCell } });
    });

    // Advance timers to trigger the setTimeout inside the useEffect
    act(() => {
      vi.advanceTimersByTime(0);
    });

    // Assert directly after act and timer advance
    await waitFor(() => {
      expect(mockCellElement.focus).toHaveBeenCalled();
      expect(mockScrollIntoView).toHaveBeenCalledWith({
        block: "nearest",
        inline: "nearest",
      });
    });
  }, { timeout: 10000 }); // Increase timeout for this specific test

  it("should not focus if enableKeyboardNavigation is false", async () => {
    const options = { ...defaultOptions, enableKeyboardNavigation: false };
    const { rerender } = renderHook(({ options }) => useKeyboardNavigation(options), {
      initialProps: { options },
    });

    const cellKey = "1-2";
    mockCellRefs.current[cellKey] = mockCellElement as any;

    // Clear mocks from initial render (where enableKeyboardNavigation was false, so effect shouldn't have run)
    mockCellElement.focus.mockClear();
    mockScrollIntoView.mockClear();

    // Simulate focusedCell changing, but enableKeyboardNavigation is false
    const newFocusedCell = { colIndex: 2, rowIndex: 1 };
    act(() => {
      rerender({ options: { ...options, focusedCell: newFocusedCell } });
    });

    // Advance timers to ensure setTimeout doesn't run
    act(() => {
      vi.advanceTimersByTime(0);
    });

    // Assert that focus/scroll were NOT called
    expect(mockCellElement.focus).not.toHaveBeenCalled();
    expect(mockScrollIntoView).not.toHaveBeenCalled();
  });

  describe("handleKeyDown (Navigation)", () => {
    // No need to capture handler here, will dispatch to window

    beforeEach(() => {
      // Mock the screen reader hook to return the full expected object
      vi.mocked(useScreenReaderAnnouncement).mockReturnValue({
        announce: mockAnnounce,
        announcement: "", // Add mock for announcement
        politeness: "polite" as PolitenessLevel, // Add mock for politeness
      });

      vi.clearAllMocks(); // Clear mocks before each test in this block
      vi.useFakeTimers(); // Ensure fake timers are used
      mockPreventDefault.mockClear(); // Clear preventDefault mock calls
      mockSetFocusedCell.mockClear(); // Clear setFocusedCell mock calls
      mockAnnounce.mockClear(); // Clear announce mock calls

      // Reset the state held by the defaultOptions object for mocks
      defaultOptions.expanded = {};
      // focusedCell is managed by the hook's prop, not directly reset here
      // defaultOptions.focusedCell = { colIndex: 0, rowIndex: 0 }; // Reset to initial focus

      // Reset mock DOM elements
      mockCellRefs.current = {};
      mockCellElement.focus.mockClear();
      mockScrollIntoView.mockClear();

      // Default mock data
      mockGetRowModel.mockReturnValue({
        rows: Array(defaultOptions.rowCount).fill(null).map((_, i) => ({ id: `row-${i}`, toggleSelected: vi.fn(), getIsSelected: vi.fn() })),
      });
      // Ensure headers have distinct names for announcement tests
      mockGetHeaderGroups.mockReturnValue([
        { headers: Array(defaultOptions.colCount).fill(null).map((_, i) => ({ column: { columnDef: { header: `Col ${i}` } } })) },
      ]);
      mockToggleSelected.mockClear();

      // The event listener is set up by the hook's useEffect in the main beforeEach.
      // Dispatching events to window will trigger the latest handler.
    });

    it("should move focus up on ArrowUp", () => {
      // 1. Set initial focus using rerender captured in the main beforeEach
      const initialFocusedCell = { colIndex: 2, rowIndex: 5 };
      act(() => {
        rerender({ options: { ...defaultOptions, focusedCell: initialFocusedCell } });
      });

      mockPreventDefault.mockClear(); // Clear mock calls from previous tests
      mockSetFocusedCell.mockClear(); // Clear mock calls from previous tests
      mockAnnounce.mockClear(); // Clear mock calls from previous tests

      // 2. Simulate keydown event by dispatching using the helper
      const event = new KeyboardEvent("keydown", { key: "ArrowUp" });
      act(() => {
        dispatchEvent(event);
      });

      // 3. Assert the outcome
      expect(mockPreventDefault).toHaveBeenCalledTimes(1);
      expect(mockSetFocusedCell).toHaveBeenCalledWith({
        colIndex: 2,
        rowIndex: 4,
      });
      expect(mockAnnounce).toHaveBeenCalledWith("Moved to row 5", "polite"); // rowIndex 4 is the 5th row (1-based)
    });

    it("should move focus down on ArrowDown", () => {
      const initialFocusedCell = { colIndex: 2, rowIndex: 5 };
      act(() => {
        rerender({ options: { ...defaultOptions, focusedCell: initialFocusedCell } });
      });
      mockPreventDefault.mockClear();
      mockSetFocusedCell.mockClear();
      mockAnnounce.mockClear();

      const event = new KeyboardEvent("keydown", { key: "ArrowDown" });
      act(() => {
        dispatchEvent(event);
      });

      expect(mockPreventDefault).toHaveBeenCalledTimes(1);
      expect(mockSetFocusedCell).toHaveBeenCalledWith({
        colIndex: 2,
        rowIndex: 6,
      });
      expect(mockAnnounce).toHaveBeenCalledWith("Moved to row 7", "polite"); // rowIndex 6 is the 7th row (1-based)
    });

    it("should move focus left on ArrowLeft", () => {
      const initialFocusedCell = { colIndex: 2, rowIndex: 5 };
      act(() => {
        rerender({ options: { ...defaultOptions, focusedCell: initialFocusedCell } });
      });
      mockPreventDefault.mockClear();
      mockSetFocusedCell.mockClear();
      mockAnnounce.mockClear();

      const event = new KeyboardEvent("keydown", { key: "ArrowLeft" });
      act(() => {
        dispatchEvent(event);
      });

      expect(mockPreventDefault).toHaveBeenCalledTimes(1);
      expect(mockSetFocusedCell).toHaveBeenCalledWith({
        colIndex: 1,
        rowIndex: 5,
      });
      // Mock header name for announcement - already done in beforeEach
      expect(mockAnnounce).toHaveBeenCalledWith("Moved to column Col 1", "polite");
    });

    it("should move focus right on ArrowRight", () => {
      const initialFocusedCell = { colIndex: 2, rowIndex: 5 };
      act(() => {
        rerender({ options: { ...defaultOptions, focusedCell: initialFocusedCell } });
      });
      mockPreventDefault.mockClear();
      mockSetFocusedCell.mockClear();
      mockAnnounce.mockClear();

      const event = new KeyboardEvent("keydown", { key: "ArrowRight" });
      act(() => {
        dispatchEvent(event);
      });

      expect(mockPreventDefault).toHaveBeenCalledTimes(1);
      expect(mockSetFocusedCell).toHaveBeenCalledWith({
        colIndex: 3,
        rowIndex: 5,
      });
      // Mock header name for announcement - already done in beforeEach
      expect(mockAnnounce).toHaveBeenCalledWith("Moved to column Col 3", "polite");
    });

    it("should move focus to first cell in row on Home", () => {
      const initialFocusedCell = { colIndex: 2, rowIndex: 5 };
      act(() => {
        rerender({ options: { ...defaultOptions, focusedCell: initialFocusedCell } });
      });
      mockPreventDefault.mockClear();
      mockSetFocusedCell.mockClear();
      mockAnnounce.mockClear();

      const event = new KeyboardEvent("keydown", { key: "Home" });
      act(() => {
        dispatchEvent(event);
      });
      expect(mockPreventDefault).toHaveBeenCalledTimes(1);
      expect(mockSetFocusedCell).toHaveBeenCalledWith({
        colIndex: 0,
        rowIndex: 5,
      });
      expect(mockAnnounce).toHaveBeenCalledWith("Moved to first cell in row", "polite");
    });

    it("should move focus to last cell in row on End", () => {
      const initialFocusedCell = { colIndex: 2, rowIndex: 5 };
      act(() => {
        rerender({ options: { ...defaultOptions, focusedCell: initialFocusedCell } });
      });
      mockPreventDefault.mockClear();
      mockSetFocusedCell.mockClear();
      mockAnnounce.mockClear();

      const event = new KeyboardEvent("keydown", { key: "End" });
      const colsCount = mockGetHeaderGroups()[0].headers.length;
      act(() => {
        dispatchEvent(event);
      });
      expect(mockPreventDefault).toHaveBeenCalledTimes(1);
      expect(mockSetFocusedCell).toHaveBeenCalledWith({
        colIndex: colsCount - 1,
        rowIndex: 5,
      });
      expect(mockAnnounce).toHaveBeenCalledWith("Moved to last cell in row", "polite");
    });

    it("should move focus to first cell in table on Control+Home", () => {
      const initialFocusedCell = { colIndex: 2, rowIndex: 5 };
      act(() => {
        rerender({ options: { ...defaultOptions, focusedCell: initialFocusedCell } });
      });
      mockPreventDefault.mockClear();
      mockSetFocusedCell.mockClear();
      mockAnnounce.mockClear();
      mockSetVirtualScrollIndex.mockClear();

      const event = new KeyboardEvent("keydown", { key: "Home", ctrlKey: true });
      act(() => {
        dispatchEvent(event);
      });
      expect(mockPreventDefault).toHaveBeenCalledTimes(1);
      expect(mockSetFocusedCell).toHaveBeenCalledWith({
        colIndex: 0,
        rowIndex: 0,
      });
      expect(mockAnnounce).toHaveBeenCalledWith("Moved to first cell in table", "polite");
      expect(mockSetVirtualScrollIndex).not.toHaveBeenCalled(); // Not enabled by default
    });

    it("should move focus to last cell in table on Control+End", () => {
      const initialFocusedCell = { colIndex: 2, rowIndex: 5 };
      act(() => {
        rerender({ options: { ...defaultOptions, focusedCell: initialFocusedCell } });
      });
      mockPreventDefault.mockClear();
      mockSetFocusedCell.mockClear();
      mockAnnounce.mockClear();
      mockSetVirtualScrollIndex.mockClear();

      const event = new KeyboardEvent("keydown", { key: "End", ctrlKey: true });
      const rowsCount = mockGetRowModel().rows.length;
      const colsCount = mockGetHeaderGroups()[0].headers.length;
      act(() => {
        dispatchEvent(event);
      });
      expect(mockPreventDefault).toHaveBeenCalledTimes(1);
      expect(mockSetFocusedCell).toHaveBeenCalledWith({
        colIndex: colsCount - 1,
        rowIndex: rowsCount - 1,
      });
      expect(mockAnnounce).toHaveBeenCalledWith("Moved to last cell in table", "polite");
      expect(mockSetVirtualScrollIndex).not.toHaveBeenCalled(); // Not enabled by default
    });

    it("should update virtual scroll index when enabled and moving vertically", async () => {
      const options = { ...defaultOptions, enableVirtualScroll: true };
      const initialFocusedCell = { colIndex: 2, rowIndex: 5 };

      // Re-render with updated options to get a new handler closure
      act(() => {
        rerender({ options: { ...options, focusedCell: initialFocusedCell } });
      });
      mockSetVirtualScrollIndex.mockClear(); // Clear calls from initial render if any
      mockPreventDefault.mockClear();
      mockSetFocusedCell.mockClear();
      mockAnnounce.mockClear();

      const upEvent = new KeyboardEvent("keydown", { key: "ArrowUp" });
      act(() => {
        dispatchEvent(upEvent);
      });
      expect(mockPreventDefault).toHaveBeenCalledTimes(1);
      expect(mockSetFocusedCell).toHaveBeenCalledWith({ colIndex: 2, rowIndex: 4 });
      expect(mockAnnounce).toHaveBeenCalledWith("Moved to row 5", "polite");
      expect(mockSetVirtualScrollIndex).toHaveBeenCalledWith(4); // rowIndex 4
      mockSetVirtualScrollIndex.mockClear();
      mockPreventDefault.mockClear();
      mockSetFocusedCell.mockClear();
      mockAnnounce.mockClear();


      const downEvent = new KeyboardEvent("keydown", { key: "ArrowDown" });
      act(() => {
        dispatchEvent(downEvent);
      });
      expect(mockPreventDefault).toHaveBeenCalledTimes(1);
      expect(mockSetFocusedCell).toHaveBeenCalledWith({ colIndex: 2, rowIndex: 6 });
      expect(mockAnnounce).toHaveBeenCalledWith("Moved to row 7", "polite");
      expect(mockSetVirtualScrollIndex).toHaveBeenCalledWith(6); // rowIndex 6
    });

    it("should update virtual scroll index when enabled and moving to first/last cell", () => {
      const options = { ...defaultOptions, enableVirtualScroll: true };
      const initialFocusedCell = { colIndex: 2, rowIndex: 5 };

      // Re-render with updated options to get a new handler closure
      act(() => {
        rerender({ options: { ...options, focusedCell: initialFocusedCell } });
      });
      mockSetVirtualScrollIndex.mockClear(); // Clear calls from initial render if any
      mockPreventDefault.mockClear();
      mockSetFocusedCell.mockClear();
      mockAnnounce.mockClear();

      const firstCellEvent = new KeyboardEvent("keydown", { key: "Home", ctrlKey: true });
      act(() => {
        dispatchEvent(firstCellEvent);
      });
      expect(mockPreventDefault).toHaveBeenCalledTimes(1);
      expect(mockSetFocusedCell).toHaveBeenCalledWith({ colIndex: 0, rowIndex: 0 });
      expect(mockAnnounce).toHaveBeenCalledWith("Moved to first cell in table", "polite");
      expect(mockSetVirtualScrollIndex).toHaveBeenCalledWith(0); // rowIndex 0
      mockSetVirtualScrollIndex.mockClear();
      mockPreventDefault.mockClear();
      mockSetFocusedCell.mockClear();
      mockAnnounce.mockClear();

      const lastCellEvent = new KeyboardEvent("keydown", { key: "End", ctrlKey: true });
      const rowsCount = mockGetRowModel().rows.length;
      act(() => {
        dispatchEvent(lastCellEvent);
      });
      expect(mockPreventDefault).toHaveBeenCalledTimes(1);
      expect(mockSetFocusedCell).toHaveBeenCalledWith({ colIndex: defaultOptions.colCount - 1, rowIndex: rowsCount - 1 });
      expect(mockAnnounce).toHaveBeenCalledWith("Moved to last cell in table", "polite");
      expect(mockSetVirtualScrollIndex).toHaveBeenCalledWith(rowsCount - 1);
    });

    it("should not move focus if already at boundary", () => {
      const optionsAtBoundary = { ...defaultOptions, focusedCell: { colIndex: 0, rowIndex: 0 } };
      // Re-render with updated options to get a new handler closure
      act(() => {
        rerender({ options: optionsAtBoundary });
      });
      mockSetFocusedCell.mockClear();
      mockAnnounce.mockClear();
      mockPreventDefault.mockClear();

      const upEvent = new KeyboardEvent("keydown", { key: "ArrowUp" });
      act(() => { dispatchEvent(upEvent); });
      // Add timer advance just in case, although preventDefault should be synchronous
      act(() => { vi.advanceTimersByTime(0); });
      expect(mockPreventDefault).toHaveBeenCalledTimes(1);
      expect(mockSetFocusedCell).not.toHaveBeenCalled();
      expect(mockAnnounce).not.toHaveBeenCalled();
      mockPreventDefault.mockClear();

      const leftEvent = new KeyboardEvent("keydown", { key: "ArrowLeft" });
      act(() => { dispatchEvent(leftEvent); });
      // Add timer advance just in case
      act(() => { vi.advanceTimersByTime(0); });
      expect(mockPreventDefault).toHaveBeenCalledTimes(1);
      expect(mockSetFocusedCell).not.toHaveBeenCalled();
      expect(mockAnnounce).not.toHaveBeenCalled();
    });

    it("should handle custom shortcuts", () => {
      const customShortcuts: KeyboardShortcutConfig = {
        ...defaultShortcuts,
        moveUp: "W",
        moveDown: "S",
        moveLeft: "A",
        moveRight: "D",
      };
      const options = { ...defaultOptions, shortcuts: customShortcuts };
      const initialFocusedCell = { colIndex: 2, rowIndex: 5 };

      // Re-render with updated options to get a new handler closure
      act(() => {
        rerender({ options: { ...options, focusedCell: initialFocusedCell } });
      });
      mockSetFocusedCell.mockClear();
      mockPreventDefault.mockClear();
      mockAnnounce.mockClear();

      act(() => { dispatchEvent(new KeyboardEvent("keydown", { key: "W" })); });
      expect(mockPreventDefault).toHaveBeenCalledTimes(1);
      expect(mockSetFocusedCell).toHaveBeenCalledWith({ colIndex: 2, rowIndex: 4 });
      mockSetFocusedCell.mockClear();
      mockPreventDefault.mockClear();
      mockAnnounce.mockClear();

      act(() => { dispatchEvent(new KeyboardEvent("keydown", { key: "S" })); });
      expect(mockPreventDefault).toHaveBeenCalledTimes(1);
      expect(mockSetFocusedCell).toHaveBeenCalledWith({ colIndex: 2, rowIndex: 6 });
      mockSetFocusedCell.mockClear();
      mockPreventDefault.mockClear();
      mockAnnounce.mockClear();

      act(() => { dispatchEvent(new KeyboardEvent("keydown", { key: "A" })); });
      expect(mockPreventDefault).toHaveBeenCalledTimes(1);
      expect(mockSetFocusedCell).toHaveBeenCalledWith({ colIndex: 1, rowIndex: 5 });
      mockSetFocusedCell.mockClear();
      mockPreventDefault.mockClear();
      mockAnnounce.mockClear();

      act(() => { dispatchEvent(new KeyboardEvent("keydown", { key: "D" })); });
      expect(mockPreventDefault).toHaveBeenCalledTimes(1);
      expect(mockSetFocusedCell).toHaveBeenCalledWith({ colIndex: 3, rowIndex: 5 });
    });

    it("should handle multi-key shortcuts (e.g., Control+Home)", () => {
      const options = { ...defaultOptions };
      const initialFocusedCell = { colIndex: 2, rowIndex: 5 };

      // Re-render with updated options to get a new handler closure
      act(() => {
        rerender({ options: { ...options, focusedCell: initialFocusedCell } });
      });
      mockSetFocusedCell.mockClear();
      mockPreventDefault.mockClear();
      mockAnnounce.mockClear();

      const event = new KeyboardEvent("keydown", { key: "Home", ctrlKey: true });
      act(() => { dispatchEvent(event); });
      expect(mockPreventDefault).toHaveBeenCalledTimes(1);
      expect(mockSetFocusedCell).toHaveBeenCalledWith({ colIndex: 0, rowIndex: 0 });
      expect(mockAnnounce).toHaveBeenCalledWith("Moved to first cell in table", "polite");
    });

    it("should handle multi-key shortcuts with different casing or aliases (e.g., ctrl+end, meta+end)", () => {
      const customShortcuts: KeyboardShortcutConfig = {
        ...defaultShortcuts,
        lastCell: ["ctrl+end", "meta+end", "command+end"],
      };
      const options = { ...defaultOptions, shortcuts: customShortcuts };
      const initialFocusedCell = { colIndex: 2, rowIndex: 5 };

      // Re-render with updated options to get a new handler closure
      act(() => {
        rerender({ options: { ...options, focusedCell: initialFocusedCell } });
      });
      mockSetFocusedCell.mockClear();
      mockPreventDefault.mockClear();
      mockAnnounce.mockClear();

      const rowsCount = mockGetRowModel().rows.length;
      const colsCount = mockGetHeaderGroups()[0].headers.length;

      act(() => { dispatchEvent(new KeyboardEvent("keydown", { key: "End", ctrlKey: true })); });
      expect(mockPreventDefault).toHaveBeenCalledTimes(1);
      expect(mockSetFocusedCell).toHaveBeenCalledWith({ colIndex: colsCount - 1, rowIndex: rowsCount - 1 });
      expect(mockAnnounce).toHaveBeenCalledWith("Moved to last cell in table", "polite");
      mockSetFocusedCell.mockClear();
      mockPreventDefault.mockClear();
      mockAnnounce.mockClear();

      act(() => { dispatchEvent(new KeyboardEvent("keydown", { key: "End", metaKey: true })); });
      expect(mockPreventDefault).toHaveBeenCalledTimes(1);
      expect(mockSetFocusedCell).toHaveBeenCalledWith({ colIndex: colsCount - 1, rowIndex: rowsCount - 1 });
      expect(mockAnnounce).toHaveBeenCalledWith("Moved to last cell in table", "polite");
      mockSetFocusedCell.mockClear();
      mockPreventDefault.mockClear();
      mockAnnounce.mockClear();

      act(() => { dispatchEvent(new KeyboardEvent("keydown", { key: "End", metaKey: true })); }); // 'command' is an alias for 'meta'
      expect(mockPreventDefault).toHaveBeenCalledTimes(1);
      expect(mockSetFocusedCell).toHaveBeenCalledWith({ colIndex: colsCount - 1, rowIndex: rowsCount - 1 });
      expect(mockAnnounce).toHaveBeenCalledWith("Moved to last cell in table", "polite");
    });
  });

  describe("handleKeyDown (Actions)", () => {
    // No need to capture handler here, will dispatch to window
    const rowId = "row-5"; // Assuming row index 5 has id "row-5"
    const mockRow = { id: rowId, toggleSelected: vi.fn(), getIsSelected: vi.fn() };

    beforeEach(() => {
      const options = {
        ...defaultOptions,
        enableExpandableRows: true,
        enableRowSelection: true,
      };
      // Re-render the hook with updated options to get a new handler closure
      // Use the rerender captured in the main beforeEach
      act(() => {
        rerender({ options });
      });

      // Set initial focused cell state using rerender
      const initialFocusedCell = { colIndex: 2, rowIndex: 5 }; // rowIndex 5, colIndex 2
      act(() => {
        rerender({ options: { ...options, focusedCell: initialFocusedCell } });
      });

      // Mock getRowModel to return a specific row at the focused index
      mockGetRowModel.mockReturnValue({
        rows: Array(defaultOptions.rowCount).fill(null).map((_, i) => i === 5 ? mockRow : { id: `row-${i}`, toggleSelected: vi.fn(), getIsSelected: vi.fn() }),
      });

      vi.clearAllMocks(); // Clear mocks after initial state setup
      vi.useFakeTimers(); // Ensure fake timers are used
      mockPreventDefault.mockClear(); // Clear preventDefault mock calls
      mockSetFocusedCell.mockClear();
      mockSetExpanded.mockClear();
      mockToggleSelected.mockClear();
      mockAnnounce.mockClear();
      mockRow.getIsSelected.mockClear();
      mockRow.toggleSelected.mockClear(); // Clear mockRow.toggleSelected

      // The event listener is set up by the hook's useEffect.
      // Dispatching events to window will trigger the latest handler.
    });

    it("should toggle row expansion on Enter if enabled", () => {
      const event = new KeyboardEvent("keydown", { key: "Enter" });
      // Simulate initial expanded state by setting it on the options object and rerendering
      const optionsWithExpanded = { ...defaultOptions, enableExpandableRows: true, expanded: { [rowId]: false }, focusedCell: { colIndex: 2, rowIndex: 5 } }; // Ensure focusedCell is set
      act(() => {
        rerender({ options: optionsWithExpanded });
      });
      mockPreventDefault.mockClear();
      mockSetExpanded.mockClear();
      mockAnnounce.mockClear();

      act(() => {
        dispatchEvent(event);
      });

      expect(mockPreventDefault).toHaveBeenCalledTimes(1);
      // Check that setExpanded was called with the updated state object
      expect(mockSetExpanded).toHaveBeenCalledWith({ [rowId]: true });
      expect(mockAnnounce).toHaveBeenCalledWith("Row expanded", "polite");
      mockSetExpanded.mockClear();
      mockAnnounce.mockClear();
      mockPreventDefault.mockClear();

      // Simulate toggling back by updating the options object state and rerendering
      const optionsExpanded = { ...defaultOptions, enableExpandableRows: true, expanded: { [rowId]: true }, focusedCell: { colIndex: 2, rowIndex: 5 } }; // Ensure focusedCell is set
      act(() => {
        rerender({ options: optionsExpanded });
      });
      mockPreventDefault.mockClear();
      mockSetExpanded.mockClear();
      mockAnnounce.mockClear();

      act(() => {
        dispatchEvent(event);
      });
      expect(mockPreventDefault).toHaveBeenCalledTimes(1);
      // Check that setExpanded was called with the updated state object
      expect(mockSetExpanded).toHaveBeenCalledWith({ [rowId]: false });
      expect(mockAnnounce).toHaveBeenCalledWith("Row collapsed", "polite");
    });

    it("should not toggle row expansion on Enter if enableExpandableRows is false", () => {
      const options = { ...defaultOptions, enableExpandableRows: false, focusedCell: { colIndex: 2, rowIndex: 5 } }; // Ensure focusedCell is set
      // Re-render with updated options to get a new handler closure
      act(() => {
        rerender({ options });
      });
      mockSetExpanded.mockClear();
      mockAnnounce.mockClear();
      mockPreventDefault.mockClear();

      const event = new KeyboardEvent("keydown", { key: "Enter" });
      act(() => {
        dispatchEvent(event);
      });

      expect(mockPreventDefault).toHaveBeenCalledTimes(1); // Still prevents default for Enter key
      expect(mockSetExpanded).not.toHaveBeenCalled();
      expect(mockAnnounce).not.toHaveBeenCalled();
    });

    it("should toggle row selection on Space if enabled and target is body", () => {
      const options = { ...defaultOptions, enableRowSelection: true, focusedCell: { colIndex: 2, rowIndex: 5 } }; // Ensure focusedCell is set
      act(() => {
        rerender({ options });
      });
      mockPreventDefault.mockClear();
      mockToggleSelected.mockClear();
      mockAnnounce.mockClear();

      const event = new KeyboardEvent("keydown", { key: " " });
      // Simulate event target being the document body
      Object.defineProperty(event, "target", { value: document.body });

      mockRow.getIsSelected.mockReturnValueOnce(false); // Simulate initial state: not selected

      act(() => {
        dispatchEvent(event);
      });

      expect(mockPreventDefault).toHaveBeenCalledTimes(1);
      expect(mockToggleSelected).toHaveBeenCalledTimes(1);
      expect(mockAnnounce).toHaveBeenCalledWith("Row selected", "polite");
      mockToggleSelected.mockClear();
      mockAnnounce.mockClear();
      mockPreventDefault.mockClear();

      mockRow.getIsSelected.mockReturnValueOnce(true); // Simulate initial state: selected
      act(() => {
        dispatchEvent(event);
      });
      expect(mockPreventDefault).toHaveBeenCalledTimes(1);
      expect(mockToggleSelected).toHaveBeenCalledTimes(1); // Called once in this act block
      expect(mockAnnounce).toHaveBeenCalledWith("Row deselected", "polite");
    });

    it("should not toggle row selection on Space if enableRowSelection is false", () => {
      const options = { ...defaultOptions, enableRowSelection: false, focusedCell: { colIndex: 2, rowIndex: 5 } }; // Ensure focusedCell is set
      // Re-render with updated options to get a new handler closure
      act(() => {
        rerender({ options });
      });
      mockToggleSelected.mockClear();
      mockAnnounce.mockClear();
      mockPreventDefault.mockClear();

      const event = new KeyboardEvent("keydown", { key: " " });
      Object.defineProperty(event, "target", { value: document.body });

      act(() => {
        dispatchEvent(event);
      });

      expect(mockPreventDefault).toHaveBeenCalledTimes(1); // Still prevents default for Space key on body
      expect(mockToggleSelected).not.toHaveBeenCalled();
      expect(mockAnnounce).not.toHaveBeenCalled();
    });

    it("should not toggle row selection on Space if target is not body (e.g., input)", () => {
      const options = { ...defaultOptions, enableRowSelection: true, focusedCell: { colIndex: 2, rowIndex: 5 } }; // Ensure focusedCell is set
      // Re-render with updated options to get a new handler closure
      act(() => {
        rerender({ options });
      });
      mockToggleSelected.mockClear();
      mockAnnounce.mockClear();
      mockPreventDefault.mockClear();

      const event = new KeyboardEvent("keydown", { key: " " });
      // Simulate event target being an input element
      Object.defineProperty(event, "target", { value: document.createElement("input") });

      act(() => {
        window.dispatchEvent(event);
      });

      expect(mockPreventDefault).not.toHaveBeenCalled(); // Does not prevent default
      expect(mockToggleSelected).not.toHaveBeenCalled();
      expect(mockAnnounce).not.toHaveBeenCalled();
    });

    it("should ignore keydown events if focusedCell is null", () => {
      const options = { ...defaultOptions, focusedCell: null };
      // Re-render with updated options to get a new handler closure
      act(() => {
        rerender({ options });
      });
      vi.clearAllMocks();
      vi.useFakeTimers(); // Ensure fake timers are used
      mockPreventDefault.mockClear(); // Clear preventDefault mock calls
      mockSetFocusedCell.mockClear();
      mockAnnounce.mockClear();

      const event = new KeyboardEvent("keydown", { key: "ArrowUp" });
      act(() => {
        window.dispatchEvent(event);
      });

      // Assert that preventDefault is NOT called because the handler should exit early
      expect(mockPreventDefault).not.toHaveBeenCalled();
      expect(mockSetFocusedCell).not.toHaveBeenCalled();
      expect(mockAnnounce).not.toHaveBeenCalled();
    });
  });

  describe("focusCell", () => {
    it("should set focusedCell state", () => {
      const { result } = renderHook(() => useKeyboardNavigation(defaultOptions));
      const rowIndex = 3;
      const colIndex = 1;

      act(() => {
        result.current.focusCell(rowIndex, colIndex);
      });

      // Assert that mockSetFocusedCell was called with the correct arguments by focusCell
      // We use toHaveBeenLastCalledWith to ignore the initial call from the hook's effect
      expect(mockSetFocusedCell).toHaveBeenLastCalledWith({ colIndex, rowIndex });
    });

    it("should set virtual scroll index if enabled", async () => {
      const options = { ...defaultOptions, enableVirtualScroll: true };
      const { result, rerender } = renderHook(({ options }) => useKeyboardNavigation(options), { initialProps: { options } });
      const rowIndex = 7;
      const colIndex = 4;

      // Mock the cell element for the useEffect to find
      const cellKey = `${rowIndex}-${colIndex}`;
      mockCellRefs.current[cellKey] = mockCellElement as any;
      mockSetVirtualScrollIndex.mockClear(); // Clear calls from initial render if any
      mockSetFocusedCell.mockClear(); // Clear calls from initial render if any

      act(() => {
        result.current.focusCell(rowIndex, colIndex);
      });

      // Advance timers to trigger the setTimeout inside the useEffect
      act(() => {
        vi.advanceTimersByTime(0);
      });

      // The virtual scroll index update happens in the useEffect that watches focusedCell
      // We need to wait for the state update and the subsequent effect run
      // Assert directly after advancing timers
      expect(mockSetFocusedCell).toHaveBeenLastCalledWith({ colIndex, rowIndex });
      expect(mockSetVirtualScrollIndex).toHaveBeenCalledWith(rowIndex);
    });

    it("should not set virtual scroll index if disabled", async () => {
      const options = { ...defaultOptions, enableVirtualScroll: false };
      const { result, rerender } = renderHook(({ options }) => useKeyboardNavigation(options), { initialProps: { options } });
      const rowIndex = 7;
      const colIndex = 4;

      // Mock the cell element for the useEffect to find
      const cellKey = `${rowIndex}-${colIndex}`;
      mockCellRefs.current[cellKey] = mockCellElement as any;
      mockSetVirtualScrollIndex.mockClear(); // Clear calls from initial render if any
      mockSetFocusedCell.mockClear(); // Clear calls from initial render if any

      act(() => {
        result.current.focusCell(rowIndex, colIndex);
      });

      // Advance timers to trigger the setTimeout inside the useEffect
      act(() => {
        vi.advanceTimersByTime(0);
      });

      // Assert directly after advancing timers
      expect(mockSetFocusedCell).toHaveBeenLastCalledWith({ colIndex, rowIndex });
      expect(mockSetVirtualScrollIndex).not.toHaveBeenCalled();
    });
  });
});
