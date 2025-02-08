import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { TableCell, TableCellProps } from "./TableCell"; // Assuming TableCell is exported from index.ts or directly from TableCell.tsx
import { flexRender } from "@tanstack/react-table";

// Import the mocked components so we can access their mock functions
import { Select } from "@lumeweb/portal-framework-ui-core";

// Mocking dependencies
vi.mock("@tanstack/react-table", () => ({
  flexRender: vi.fn((cell, context) => (
    <div data-testid="flex-rendered-cell">{context.getValue()}</div>
  )),
}));

// Mocking UI components from @lumeweb/portal-framework-ui-core
// This is important to isolate the TableCell component logic
vi.mock("@lumeweb/portal-framework-ui-core", () => ({
  cn: vi.fn((...classes) => classes.filter(Boolean).join(" ")), // Simple mock for class concatenation
  Input: vi.fn(({ value, onChange, onBlur, onKeyDown, autoFocus, type }) => {
    // Ensure value is always a string for the input element
    const stringValue = String(value ?? "");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) {
        // Create a mock event object that matches the structure expected by TableCell
        const mockEvent = {
          target: {
            value: e.target.value,
            valueAsNumber: parseFloat(e.target.value), // Add valueAsNumber for number type
          },
        } as React.ChangeEvent<HTMLInputElement>; // Cast to the expected type

        onChange(mockEvent); // Pass the mock event object
      }
    };

    return (
      <input
        data-testid="mock-input"
        value={stringValue}
        onChange={handleChange}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        autoFocus={autoFocus}
        type={type}
      />
    );
  }),
  Select: vi.fn(({ value, onValueChange, children }) => (
    <div data-testid="mock-select" data-value={value}>
      {children}
      {/* Mock the onValueChange call when an item is clicked */}
      <div onClick={() => onValueChange?.(value)}></div>
    </div>
  )),
  // Use forwardRef for SelectTrigger mock
  SelectTrigger: React.forwardRef<HTMLDivElement, any>(
    ({ children, onBlur, onKeyDown, className }, ref) => (
      <div
        data-testid="mock-select-trigger-content"
        className={className}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        ref={ref} // Pass the ref to the div
        tabIndex={0} // Make it focusable
      >
        {children}
      </div>
    ),
  ),
  SelectValue: vi.fn(({ placeholder }) => (
    <div data-testid="mock-select-value">{placeholder}</div>
  )),
  SelectContent: vi.fn(({ children }) => (
    <div data-testid="mock-select-content">{children}</div>
  )),
  SelectItem: vi.fn(({ value, children }) => (
    <div data-testid="mock-select-item" data-value={value}>
      {children}
    </div>
  )),
}));

// Mock ThemedBadge
vi.mock("@/components/ThemedBadge", () => ({
  ThemedBadge: vi.fn(({ children, value }) => (
    <div data-testid="mock-themed-badge" data-value={value}>
      {children}
    </div>
  )),
}));

// Mock BADGE_THEME
vi.mock("@/types", () => ({
  BADGE_THEME: {
    success: "green",
    error: "red",
    // Add other themes as needed for testing
  },
}));

// Define default props outside the helper for easier reuse with rerender
const defaultProps: TableCellProps = {
  cell: {
    column: {
      columnDef: {
        cell: vi.fn(), // Mock cell renderer
        meta: {}, // Default empty meta
      },
    },
    getContext: vi.fn(() => ({})), // Mock getContext
  },
  cellRef: React.createRef(),
  colIndex: 0,
  displayValue: "Display Value",
  editingValue: "Editing Value",
  enableHoverActions: false,
  enableKeyboardNavigation: true,
  hoverActions: null,
  hoverActionsPosition: "end",
  isEditable: false,
  isEditing: false,
  isFocused: false,
  onCancelEdit: vi.fn(),
  onDoubleClick: vi.fn(),
  onEditValueChange: vi.fn(),
  onFocus: vi.fn(),
  onSaveEdit: vi.fn(),
  rowIndex: 0,
};

// Helper function for rendering the component with default props
const renderTableCell = (props?: Partial<TableCellProps>) => {
  return render(<TableCell {...defaultProps} {...props} />);
};

describe("TableCell", () => {
  beforeEach(() => {
    // Clear the DOM before each test to prevent interference
    document.body.innerHTML = "";
  });

  // Given: TableCell component
  // When: It is rendered in display mode
  // Then: It should render the display value using flexRender
  it("should render display value when not in editing mode", () => {
    // Given
    const displayValue = "Test Display";
    const cellMock = {
      column: { columnDef: { cell: vi.fn(), meta: {} } },
      getContext: vi.fn(() => ({})),
    };

    // When
    renderTableCell({
      isEditing: false,
      displayValue,
      cell: cellMock as any,
    });

    // Then
    expect(flexRender).toHaveBeenCalledWith(
      cellMock.column.columnDef.cell,
      expect.objectContaining({ getValue: expect.any(Function) }),
    );
    expect(screen.getByTestId("flex-rendered-cell")).toHaveTextContent(
      displayValue,
    );
    expect(screen.queryByTestId("mock-input")).not.toBeInTheDocument();
    expect(screen.queryByTestId("mock-select")).not.toBeInTheDocument();
  });

  // Given: TableCell component
  // When: It is rendered with a variant meta property
  // Then: It should wrap the content in ThemedBadge
  it("should wrap content in ThemedBadge when meta.variant is provided", () => {
    // Given
    const displayValue = "Status";
    const variant = "success";
    const cellMock = {
      column: { columnDef: { cell: vi.fn(), meta: { variant } } },
      getContext: vi.fn(() => ({})),
    };

    // When
    renderTableCell({
      isEditing: false,
      displayValue,
      cell: cellMock as any,
    });

    // Then
    const badge = screen.getByTestId("mock-themed-badge");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveAttribute("data-value", variant);
    expect(screen.getByTestId("flex-rendered-cell")).toHaveTextContent(
      displayValue,
    );
  });

  // Given: TableCell component
  // When: It is rendered with different meta font styles
  // Then: It should apply the correct CSS classes
  it("should apply correct font classes based on meta.font", () => {
    // Given
    const cellMockNormal = {
      column: { columnDef: { cell: vi.fn(), meta: { font: "normal" } } },
      getContext: vi.fn(() => ({})),
    };
    const cellMockMedium = {
      column: { columnDef: { cell: vi.fn(), meta: { font: "medium" } } },
      getContext: vi.fn(() => ({})),
    };
    const cellMockMono = {
      column: { columnDef: { cell: vi.fn(), meta: { font: "mono" } } },
      getContext: vi.fn(() => ({})),
    };

    // When
    const { rerender } = renderTableCell({ cell: cellMockNormal as any });
    const cellElement = screen.getByRole("gridcell");

    // Then
    expect(cellElement).not.toHaveClass("font-medium");
    expect(cellElement).not.toHaveClass("font-mono");

    // When
    rerender(<TableCell {...defaultProps} cell={cellMockMedium as any} />);

    // Then
    expect(cellElement).toHaveClass("font-medium");
    expect(cellElement).not.toHaveClass("font-mono");

    // When
    rerender(<TableCell {...defaultProps} cell={cellMockMono as any} />);

    // Then
    expect(cellElement).not.toHaveClass("font-medium");
    expect(cellElement).toHaveClass("font-mono");
    expect(cellElement).toHaveClass("text-xs"); // mono also adds text-xs
  });

  // Given: TableCell component
  // When: It is rendered with meta.truncate set to true
  // Then: It should apply the truncate class
  it("should apply truncate class when meta.truncate is true", () => {
    // Given
    const cellMock = {
      column: { columnDef: { cell: vi.fn(), meta: { truncate: true } } },
      getContext: vi.fn(() => ({})),
    };

    // When
    renderTableCell({ cell: cellMock as any });
    const cellElement = screen.getByRole("gridcell");

    // Then
    expect(cellElement).toHaveClass("truncate");
  });

  // Given: TableCell component
  // When: It is rendered with meta.maxWidth
  // Then: It should apply the max-width style
  it("should apply max-width style when meta.maxWidth is provided", () => {
    // Given
    const maxWidth = 150;
    const cellMock = {
      column: { columnDef: { cell: vi.fn(), meta: { maxWidth } } },
      getContext: vi.fn(() => ({})),
    };

    // When
    renderTableCell({ cell: cellMock as any });
    const cellElement = screen.getByRole("gridcell");

    // Then
    expect(cellElement).toHaveStyle({ maxWidth: `${maxWidth}px` });
  });

  // Given: TableCell component
  // When: It is editable and not focused
  // Then: It should have cursor-pointer and hover background classes
  it("should have editable classes when isEditable is true and not focused", () => {
    // When
    renderTableCell({ isEditable: true, isFocused: false });
    const cellElement = screen.getByRole("gridcell");

    // Then
    expect(cellElement).toHaveClass("cursor-pointer");
    expect(cellElement).toHaveClass("hover:bg-secondary/20");
  });

  // Given: TableCell component
  // When: It is focused and keyboard navigation is enabled
  // Then: It should have the focus ring classes
  it("should have focus ring classes when isFocused and enableKeyboardNavigation are true", () => {
    // When
    renderTableCell({ isFocused: true, enableKeyboardNavigation: true });
    const cellElement = screen.getByRole("gridcell");

    // Then
    expect(cellElement).toHaveClass("ring-2");
    expect(cellElement).toHaveClass("ring-primary");
    expect(cellElement).toHaveClass("ring-inset");
    expect(cellElement).toHaveClass("ring-offset-2");
  });

  // Given: TableCell component
  // When: It is focused but keyboard navigation is disabled
  // Then: It should NOT have the focus ring classes
  it("should NOT have focus ring classes when isFocused is true but enableKeyboardNavigation is false", () => {
    // When
    renderTableCell({ isFocused: true, enableKeyboardNavigation: false });
    const cellElement = screen.getByRole("gridcell");

    // Then
    expect(cellElement).not.toHaveClass("ring-2");
  });

  // Given: TableCell component
  // When: It is double-clicked
  // Then: The onDoubleClick handler should be called
  it("should call onDoubleClick when double-clicked", () => {
    // Given
    const onDoubleClickMock = vi.fn();

    // When
    renderTableCell({ onDoubleClick: onDoubleClickMock });
    const cellElement = screen.getByRole("gridcell");
    fireEvent.doubleClick(cellElement);

    // Then
    expect(onDoubleClickMock).toHaveBeenCalledTimes(1);
  });

  // Given: TableCell component
  // When: It receives focus
  // Then: The onFocus handler should be called
  it("should call onFocus when focused", () => {
    // Given
    const onFocusMock = vi.fn();

    // When
    renderTableCell({ onFocus: onFocusMock });
    const cellElement = screen.getByRole("gridcell");
    fireEvent.focus(cellElement);

    // Then
    expect(onFocusMock).toHaveBeenCalledTimes(1);
  });

  // Given: TableCell component in editing mode with editType "text"
  // Then: It should render a text input with the editing value
  it("should render text input when isEditing is true and editType is text", () => {
    // Given
    const editingValue = "Initial Edit";
    const cellMock = {
      column: { columnDef: { cell: vi.fn(), meta: { editType: "text" } } },
      getContext: vi.fn(() => ({})),
    };

    // When
    renderTableCell({
      isEditing: true,
      editingValue,
      cell: cellMock as any,
    });

    // Then
    const input = screen.getByTestId("mock-input");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("type", "text");
    expect(input).toHaveValue(editingValue);
    // expect(input).toHaveFocus(); // autoFocus prop - Focus is handled by the useEffect in the main component, not the mock input itself
  });

  // Given: TableCell component in editing mode with editType "number"
  // Then: It should render a number input with the editing value
  it("should render number input when isEditing is true and editType is number", () => {
    // Given
    const editingValue = 123;
    const cellMock = {
      column: { columnDef: { cell: vi.fn(), meta: { editType: "number" } } },
      getContext: vi.fn(() => ({})),
    };

    // When
    renderTableCell({
      isEditing: true,
      editingValue,
      cell: cellMock as any,
    });

    // Then
    const input = screen.getByTestId("mock-input");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("type", "number");
    // Assert against the string representation of the number value by checking the attribute
    expect(input).toHaveAttribute("value", String(editingValue));
    // expect(input).toHaveFocus(); // autoFocus prop - Focus is handled by the useEffect in the main component, not the mock input itself
  });

  // Given: TableCell component in editing mode with editType "select"
  // Then: It should render a select component with the editing value and options, and focus the trigger
  it("should render select component when isEditing is true and editType is select", async () => {
    // Ensure fake timers are used for this test within the async function
    vi.useFakeTimers();

    // Given
    const editingValue = "option2";
    const editOptions = [
      { label: "Option 1", value: "option1" },
      { label: "Option 2", value: "option2" },
    ];
    const cellMock = {
      column: {
        columnDef: { cell: vi.fn(), meta: { editType: "select", editOptions } },
      },
      getContext: vi.fn(() => ({})),
    };

    // When
    renderTableCell({
      isEditing: true,
      editingValue,
      cell: cellMock as any,
    });

    // Then
    const select = screen.getByTestId("mock-select");
    expect(select).toBeInTheDocument();
    expect(select).toHaveAttribute("data-value", editingValue);

    const selectItems = screen.getAllByTestId("mock-select-item");
    expect(selectItems).toHaveLength(editOptions.length);
    expect(selectItems[0]).toHaveTextContent("Option 1");
    expect(selectItems[0]).toHaveAttribute("data-value", "option1");
    expect(selectItems[1]).toHaveTextContent("Option 2");
    expect(selectItems[1]).toHaveAttribute("data-value", "option2");

    // Get the select trigger element
    const selectTrigger = screen.getByTestId("mock-select-trigger-content");

    // Spy on the focus method of the select trigger element
    const focusSpy = vi.spyOn(selectTrigger, 'focus');

    // Advance timers to trigger the setTimeout that focuses the select trigger
    act(() => {
      vi.advanceTimersByTime(0);
    });

    // Assert that the focus method was called on the select trigger
    expect(focusSpy).toHaveBeenCalled();

    // Restore the spy
    focusSpy.mockRestore();
  });

  // Given: TableCell component in text editing mode
  // When: The input value changes
  // Then: The onEditValueChange handler should be called with the new string value
  it("should call onEditValueChange with string value when text input changes", () => {
    // Given
    const onEditValueChangeMock = vi.fn();
    const cellMock = {
      column: { columnDef: { cell: vi.fn(), meta: { editType: "text" } } },
      getContext: vi.fn(() => ({})),
    };

    renderTableCell({
      isEditing: true,
      onEditValueChange: onEditValueChangeMock,
      cell: cellMock as any,
    });
    const input = screen.getByTestId("mock-input");
    const newValue = "New Text Value";

    // When
    fireEvent.change(input, { target: { value: newValue } });

    // Then
    expect(onEditValueChangeMock).toHaveBeenCalledTimes(1);
    expect(onEditValueChangeMock).toHaveBeenCalledWith(newValue);
  });

  // Given: TableCell component in number editing mode
  // When: The input value changes
  // Then: The onEditValueChange handler should be called with the new number value
  it("should call onEditValueChange with number value when number input changes", () => {
    // Given
    const onEditValueChangeMock = vi.fn();
    const cellMock = {
      column: { columnDef: { cell: vi.fn(), meta: { editType: "number" } } },
      getContext: vi.fn(() => ({})),
    };

    renderTableCell({
      isEditing: true,
      onEditValueChange: onEditValueChangeMock,
      cell: cellMock as any,
    });
    const input = screen.getByTestId("mock-input");
    const newValue = "456";

    // When
    fireEvent.change(input, { target: { value: newValue } });

    // Then
    expect(onEditValueChangeMock).toHaveBeenCalledTimes(1);
    expect(onEditValueChangeMock).toHaveBeenCalledWith(Number(newValue));
  });

  // Given: TableCell component in number editing mode
  // When: The input value changes to an invalid number
  // Then: The onEditValueChange handler should be called with NaN
  it("should call onEditValueChange with NaN when number input changes to invalid value", () => {
    // Given
    const onEditValueChangeMock = vi.fn();
    const cellMock = {
      column: { columnDef: { cell: vi.fn(), meta: { editType: "number" } } },
      getContext: vi.fn(() => ({})),
    };

    renderTableCell({
      isEditing: true,
      onEditValueChange: onEditValueChangeMock,
      cell: cellMock as any,
    });
    const input = screen.getByTestId("mock-input");
    const newValue = "abc"; // Invalid number input

    // When
    fireEvent.change(input, { target: { value: newValue } });

    // Then
    expect(onEditValueChangeMock).toHaveBeenCalledTimes(1);
    expect(onEditValueChangeMock).toHaveBeenCalledWith(NaN);
  });

  // Given: TableCell component in select editing mode
  // When: The select value changes
  // Then: The onEditValueChange handler should be called with the new value
  it("should call onEditValueChange when select value changes", () => {
    // Given
    const onEditValueChangeMock = vi.fn();
    const editOptions = [
      { label: "Option 1", value: "option1" },
      { label: "Option 2", value: "option2" },
    ];
    const cellMock = {
      column: {
        columnDef: { cell: vi.fn(), meta: { editType: "select", editOptions } },
      },
      getContext: vi.fn(() => ({})),
    };

    renderTableCell({
      isEditing: true,
      onEditValueChange: onEditValueChangeMock,
      cell: cellMock as any,
    });
    const newValue = "option1";
    // Find the specific SelectItem element by its text content (label)
    // Assuming the label matches the value for simplicity in this mock test
    const selectItemToClick = screen.getByText("Option 1"); // Find by label

    // When
    // Simulate the Select component's onValueChange callback being triggered
    // by finding the mock Select element and calling its onValueChange prop directly.
    const mockSelect = screen.getByTestId("mock-select");
    // Assuming the mock Select component receives onValueChange as a prop
    // and the test setup provides this prop to the mock.
    // We need to access the mock's props. A common way is to get the mock function's calls.
    // Get the props from the last call to the mocked Select component
    const lastSelectCall = vi.mocked(Select).mock.calls[vi.mocked(Select).mock.calls.length - 1];

    if (!lastSelectCall) {
      throw new Error("Mock Select component was not rendered.");
    }

    const selectProps = lastSelectCall[0];
    const onValueChangeProp = selectProps.onValueChange;

    // When
    // Simulate the Select component calling its onValueChange prop
    act(() => {
      // Ensure onValueChangeProp is a function before calling it
      if (typeof onValueChangeProp === 'function') {
        onValueChangeProp(newValue);
      } else {
        throw new Error("onValueChange prop is not a function on the mocked Select component.");
      }
    });


    // Then
    expect(onEditValueChangeMock).toHaveBeenCalledTimes(1);
    expect(onEditValueChangeMock).toHaveBeenCalledWith(newValue);
  });

  // Given: TableCell component in editing mode (any type)
  // When: The input/select loses focus (blur)
  // Then: The onSaveEdit handler should be called
  it("should call onSaveEdit when input/select is blurred", () => {
    // Given
    const onSaveEditMock = vi.fn();
    const cellMock = {
      column: { columnDef: { cell: vi.fn(), meta: { editType: "text" } } },
      getContext: vi.fn(() => ({})),
    };

    renderTableCell({
      isEditing: true,
      onSaveEdit: onSaveEditMock,
      cell: cellMock as any,
    });
    const input = screen.getByTestId("mock-input");

    // When
    fireEvent.blur(input);

    // Then
    expect(onSaveEditMock).toHaveBeenCalledTimes(1);
  });

  // Given: TableCell component in editing mode (any type)
  // When: The Enter key is pressed
  // Then: The onSaveEdit handler should be called
  it("should call onSaveEdit when Enter key is pressed in editing mode", () => {
    // Given
    const onSaveEditMock = vi.fn();
    const cellMock = {
      column: { columnDef: { cell: vi.fn(), meta: { editType: "text" } } },
      getContext: vi.fn(() => ({})),
    };

    renderTableCell({
      isEditing: true,
      onSaveEdit: onSaveEditMock,
      cell: cellMock as any,
    });
    const input = screen.getByTestId("mock-input");

    // When
    fireEvent.keyDown(input, { key: "Enter" });

    // Then
    expect(onSaveEditMock).toHaveBeenCalledTimes(1);
  });

  // Given: TableCell component in editing mode (any type)
  // When: The Escape key is pressed
  // Then: The onCancelEdit handler should be called
  it("should call onCancelEdit when Escape key is pressed in editing mode", () => {
    // Given
    const onCancelEditMock = vi.fn();
    const cellMock = {
      column: { columnDef: { cell: vi.fn(), meta: { editType: "text" } } },
      getContext: vi.fn(() => ({})),
    };

    renderTableCell({
      isEditing: true,
      onCancelEdit: onCancelEditMock,
      cell: cellMock as any,
    });
    const input = screen.getByTestId("mock-input");

    // When
    fireEvent.keyDown(input, { key: "Escape" });

    // Then
    expect(onCancelEditMock).toHaveBeenCalledTimes(1);
  });

  // Given: TableCell component
  // When: enableHoverActions is true and hoverActions are provided
  // Then: It should render the hover actions
  it("should render hover actions when enabled and provided", () => {
    // Given
    const hoverActionsContent = <div data-testid="hover-actions">Actions</div>;

    // When
    renderTableCell({
      enableHoverActions: true,
      hoverActions: hoverActionsContent,
    });
    const cellElement = screen.getByRole("gridcell");
    const hoverActionsElement = screen.getByTestId("hover-actions");

    // Then
    expect(hoverActionsElement).toBeInTheDocument();
    // Check for padding class when hover actions are enabled
    expect(cellElement).toHaveClass("pr-8");
  });

  // Given: TableCell component
  // When: enableHoverActions is true but hoverActions are NOT provided
  // Then: It should NOT render the hover actions container
  it("should NOT render hover actions container when enabled but not provided", () => {
    // When
    renderTableCell({
      enableHoverActions: true,
      hoverActions: null, // Explicitly null
    });

    // Then
    expect(screen.queryByTestId("hover-actions")).not.toBeInTheDocument();
    // Still expect padding class even if actions are null, as the space is reserved
    expect(screen.getByRole("gridcell")).toHaveClass("pr-8");
  });

  // Given: TableCell component
  // When: enableHoverActions is false
  // Then: It should NOT render the hover actions container
  it("should NOT render hover actions container when disabled", () => {
    // Given
    const hoverActionsContent = <div data-testid="hover-actions">Actions</div>;

    // When
    renderTableCell({
      enableHoverActions: false,
      hoverActions: hoverActionsContent,
    });

    // Then
    expect(screen.queryByTestId("hover-actions")).not.toBeInTheDocument();
    // Should not have padding class when hover actions are disabled
    expect(screen.getByRole("gridcell")).not.toHaveClass("pr-8");
  });

  // Given: TableCell component with hover actions enabled
  // When: hoverActionsPosition is "start"
  // Then: The hover actions container should have the 'left-1' class
  it("should position hover actions at the start when hoverActionsPosition is start", () => {
    // Given
    const hoverActionsContent = <div data-testid="hover-actions">Actions</div>;

    // When
    renderTableCell({
      enableHoverActions: true,
      hoverActions: hoverActionsContent,
      hoverActionsPosition: "start",
    });
    const hoverActionsContainer =
      screen.getByTestId("hover-actions").parentElement;

    // Then
    expect(hoverActionsContainer).toHaveClass("left-1");
    expect(hoverActionsContainer).not.toHaveClass("right-1");
  });

  // Given: TableCell component with hover actions enabled
  // When: hoverActionsPosition is "end" (default)
  // Then: The hover actions container should have the 'right-1' class
  it("should position hover actions at the end when hoverActionsPosition is end", () => {
    // Given
    const hoverActionsContent = <div data-testid="hover-actions">Actions</div>;

    // When
    renderTableCell({
      enableHoverActions: true,
      hoverActions: hoverActionsContent,
      hoverActionsPosition: "end", // Explicitly set, but also the default
    });
    const hoverActionsContainer =
      screen.getByTestId("hover-actions").parentElement;

    // Then
    expect(hoverActionsContainer).toHaveClass("right-1");
    expect(hoverActionsContainer).not.toHaveClass("left-1");
  });

  // Given: TableCell component
  // When: enableKeyboardNavigation is true
  // Then: The cell should be focusable (tabIndex 0)
  it("should be focusable when enableKeyboardNavigation is true", () => {
    // When
    renderTableCell({ enableKeyboardNavigation: true });
    const cellElement = screen.getByRole("gridcell");

    // Then
    expect(cellElement).toHaveAttribute("tabindex", "0");
  });

  // Given: TableCell component
  // When: enableKeyboardNavigation is false
  // Then: The cell should not be focusable (tabIndex undefined)
  it("should not be focusable when enableKeyboardNavigation is false", () => {
    // When
    renderTableCell({ enableKeyboardNavigation: false });
    const cellElement = screen.getByRole("gridcell");

    // Then
    expect(cellElement).not.toHaveAttribute("tabindex");
  });

  // Given: TableCell component
  // When: editingValue is null or undefined in editing mode
  // Then: Input should render with empty string value
  it("should render empty string for null/undefined editingValue in text/number edit mode", () => {
    // Given
    const cellMockText = {
      column: { columnDef: { cell: vi.fn(), meta: { editType: "text" } } },
      getContext: vi.fn(() => ({})),
    };
    const cellMockNumber = {
      column: { columnDef: { cell: vi.fn(), meta: { editType: "number" } } },
      getContext: vi.fn(() => ({})),
    };

    // When (text, null)
    const { rerender } = renderTableCell({
      isEditing: true,
      editingValue: null,
      cell: cellMockText as any,
    });
    let input = screen.getByTestId("mock-input");
    // Use toHaveAttribute for more reliable check on mocked elements
    expect(input).toHaveAttribute("value", "");

    // When (text, undefined)
    rerender(
      <TableCell
        {...defaultProps}
        isEditing={true}
        editingValue={undefined}
        cell={cellMockText as any}
      />,
    );
    input = screen.getByTestId("mock-input");
    expect(input).toHaveAttribute("value", "");

    // When (number, null)
    rerender(
      <TableCell
        {...defaultProps}
        isEditing={true}
        editingValue={null}
        cell={cellMockNumber as any}
      />,
    );
    input = screen.getByTestId("mock-input");
    expect(input).toHaveAttribute("value", "");

    // When (number, undefined)
    rerender(
      <TableCell
        {...defaultProps}
        isEditing={true}
        editingValue={undefined}
        cell={cellMockNumber as any}
      />,
    );
    input = screen.getByTestId("mock-input");
    expect(input).toHaveAttribute("value", "");
  });

  // Given: TableCell component in select editing mode
  // When: editingValue is null or undefined
  // Then: Select should render with empty string value
  it("should render empty string for null/undefined editingValue in select edit mode", () => {
    // Given
    const editOptions = [
      { label: "Option 1", value: "option1" },
      { label: "Option 2", value: "option2" },
    ];
    const cellMock = {
      column: {
        columnDef: { cell: vi.fn(), meta: { editType: "select", editOptions } },
      },
      getContext: vi.fn(() => ({})),
    };

    // When (null)
    const { rerender } = renderTableCell({
      isEditing: true,
      editingValue: null,
      cell: cellMock as any,
    });
    let select = screen.getByTestId("mock-select");
    // Use toHaveAttribute for more reliable check on mocked elements
    expect(select).toHaveAttribute("data-value", "");

    // When (undefined)
    rerender(
      <TableCell
        {...defaultProps}
        isEditing={true}
        editingValue={undefined}
        cell={cellMock as any}
      />,
    );
    select = screen.getByTestId("mock-select");
    expect(select).toHaveAttribute("data-value", "");
  });

  // Given: TableCell component in select editing mode
  // When: editOptions is empty or missing
  // Then: Select should render without items
  it("should render select without items when editOptions is empty or missing", () => {
    // Given
    const cellMockEmptyOptions = {
      column: {
        columnDef: {
          cell: vi.fn(),
          meta: { editType: "select", editOptions: [] },
        },
      },
      getContext: vi.fn(() => ({})),
    };
    const cellMockMissingOptions = {
      column: { columnDef: { cell: vi.fn(), meta: { editType: "select" } } }, // Missing editOptions
      getContext: vi.fn(() => ({})),
    };

    // When (empty options)
    const { rerender } = renderTableCell({
      isEditing: true,
      cell: cellMockEmptyOptions as any,
    });
    expect(screen.queryAllByTestId("mock-select-item")).toHaveLength(0);

    // When (missing options)
    rerender(
      <TableCell
        {...defaultProps}
        isEditing={true}
        cell={cellMockMissingOptions as any}
      />,
    );
    expect(screen.queryAllByTestId("mock-select-item")).toHaveLength(0);
  });

  // Given: TableCell component
  // When: colIndex and rowIndex are provided
  // Then: The cell should have correct aria-colindex and aria-rowindex attributes
  it("should have correct aria-colindex and aria-rowindex attributes", () => {
    // Given
    const colIndex = 5;
    const rowIndex = 10;

    // When
    renderTableCell({ colIndex, rowIndex });
    const cellElement = screen.getByRole("gridcell");

    // Then
    expect(cellElement).toHaveAttribute("aria-colindex", String(colIndex + 1));
    expect(cellElement).toHaveAttribute("aria-rowindex", String(rowIndex + 1));
  });
});
