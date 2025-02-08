import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ColumnFilter } from "./ColumnFilter";

// Mock state for the popover
let mockPopoverOpen = false;
let mockOnOpenChange = vi.fn();

// Mock Popover component
const MockPopover = vi.fn(({ children, onOpenChange, open }) => {
  // Capture the open state and handler
  mockPopoverOpen = open;
  mockOnOpenChange = onOpenChange || vi.fn();

  // Render children. The PopoverContent mock will use mockPopoverOpen
  return <div data-testid="popover">{children}</div>;
});

// Mock PopoverTrigger component
const MockPopoverTrigger = vi.fn(({ children }) => {
  // Render the actual button child.
  // When clicked, simulate calling the onOpenChange handler.
  const triggerButton = React.Children.only(children); // Assuming only one child (the button)
  return React.cloneElement(triggerButton, {
    onClick: (e) => {
      // Call the original onClick if it exists
      if (triggerButton.props.onClick) {
        triggerButton.props.onClick(e);
      }
      // Simulate opening the popover
      mockOnOpenChange(true);
    },
  });
});

// Mock PopoverContent component
const MockPopoverContent = vi.fn(({ align, children, className }) => {
  // Render content only if the mock state indicates the popover is open
  return mockPopoverOpen ? (
    <div className={className} data-align={align} data-testid="popover-content">
      {children}
    </div>
  ) : null;
});


// Mock necessary components
vi.mock("@lumeweb/portal-framework-ui-core", () => ({
  Button: vi.fn(({ children, className, onClick, size, variant }) => (
    <button
      className={className}
      data-size={size}
      data-variant={variant}
      onClick={onClick}>
      {children}
    </button>
  )),
  cn: vi.fn((...classes) => classes.join(" ")),
  DatePicker: vi.fn(({ className, date, placeholder, setDate }) => (
    <input
      className={className}
      data-testid="datepicker"
      onChange={(e) =>
        setDate?.(e.target.value ? new Date(e.target.value) : undefined)
      }
      placeholder={placeholder}
      type="date"
      value={date ? date.toISOString().split("T")[0] : ""}
    />
  )),
  Input: vi.fn(({ className, onChange, placeholder, type, value }) => (
    <input
      className={className}
      data-testid={`input-${type || "text"}`}
      onChange={onChange}
      placeholder={placeholder}
      type={type}
      value={value}
    />
  )),
  Popover: MockPopover, // Use the refined mock
  PopoverContent: MockPopoverContent, // Use the refined mock
  PopoverTrigger: MockPopoverTrigger, // Use the refined mock
  Select: vi.fn(({ children, onValueChange, value }) => (
    <select onChange={(e) => onValueChange?.(e.target.value)} value={value}>
      {children}
    </select>
  )),
  SelectContent: vi.fn(({ children }) => <div>{children}</div>),
  SelectItem: vi.fn(({ children, value }) => (
    <option value={value}>{children}</option>
  )),
  SelectTrigger: vi.fn(({ children }) => (
    <button data-testid="select-trigger">{children}</button>
  )),
  SelectValue: vi.fn(({ placeholder }) => <span>{placeholder}</span>),
}));

vi.mock("lucide-react", () => ({
  Filter: vi.fn(() => <svg data-testid="icon-filter" />),
}));

describe("ColumnFilter", () => {
  const defaultProps = {
    columnId: "testColumn",
    columnLabel: "Test Column",
    columnType: "string",
    existingFilter: undefined,
    hasActiveFilter: false,
    onApplyFilter: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock state before each test
    mockPopoverOpen = false;
    mockOnOpenChange = vi.fn();
  });

  it("renders the filter button", () => {
    render(<ColumnFilter {...defaultProps} />);
    // Use getByRole('button') as it's more semantic and avoids data-testid conflict
    expect(screen.getByRole('button', { name: /filter/i })).toBeInTheDocument();
    expect(screen.getByTestId("icon-filter")).toBeInTheDocument();
  });

  it("applies active filter class to button when hasActiveFilter is true", () => {
    render(<ColumnFilter {...defaultProps} hasActiveFilter={true} />);
    // Use getByRole('button')
    const button = screen.getByRole('button', { name: /filter/i });
    expect(button).toHaveClass("text-primary bg-primary/10");
    expect(screen.getByText("Filter applied")).toBeInDocument(); // Check SR text
  });

  it("opens the popover when the button is clicked", () => {
    render(<ColumnFilter {...defaultProps} />);
    // Use getByRole('button')
    const button = screen.getByRole('button', { name: /filter/i });
    fireEvent.click(button);
    expect(screen.getByTestId("popover-content")).toBeInTheDocument();
    expect(screen.getByText("Filter Test Column")).toBeInTheDocument();
  });

  it("renders correct input and operators for 'string' type", async () => {
    render(<ColumnFilter {...defaultProps} columnType="string" />);
    // Use getByRole('button')
    fireEvent.click(screen.getByRole('button', { name: /filter/i }));

    // Check default operator
    expect(screen.getByRole("combobox")).toHaveValue("contains");
    // Check input type
    expect(screen.getByTestId("input-text")).toBeInTheDocument();

    // Check operator options
    fireEvent.click(screen.getByTestId("select-trigger")); // Open operator select
    await waitFor(() => {
      expect(screen.getByText("Contains")).toBeInTheDocument();
      expect(screen.getByText("Equals")).toBeInTheDocument();
      expect(screen.getByText("Not equals")).toBeInTheDocument();
      expect(screen.getByText("Starts with")).toBeInTheDocument();
      expect(screen.getByText("Ends with")).toBeInTheDocument();
    });
  });

  it("renders correct input and operators for 'number' type", async () => {
    render(<ColumnFilter {...defaultProps} columnType="number" />);
    // Use getByRole('button')
    fireEvent.click(screen.getByRole('button', { name: /filter/i }));

    // Check default operator
    expect(screen.getByRole("combobox")).toHaveValue("eq");
    // Check input type
    expect(screen.getByTestId("input-number")).toBeInTheDocument();

    // Check operator options
    fireEvent.click(screen.getByTestId("select-trigger")); // Open operator select
    await waitFor(() => {
      expect(screen.getByText("Equals")).toBeInTheDocument();
      expect(screen.getByText("Not equals")).toBeInTheDocument();
      expect(screen.getByText("Greater than")).toBeInTheDocument();
      expect(screen.getByText("Greater than or equals")).toBeInTheDocument();
      expect(screen.getByText("Less than")).toBeInTheDocument();
      expect(screen.getByText("Less than or equals")).toBeInTheDocument();
    });
  });

  it("renders correct input and operators for 'date' type", async () => {
    render(<ColumnFilter {...defaultProps} columnType="date" />);
    // Use getByRole('button')
    fireEvent.click(screen.getByRole('button', { name: /filter/i }));

    // Check default operator
    expect(screen.getByRole("combobox")).toHaveValue("eq");
    // Check input type
    expect(screen.getByTestId("datepicker")).toBeInTheDocument();

    // Check operator options
    fireEvent.click(screen.getByTestId("select-trigger")); // Open operator select
    await waitFor(() => {
      expect(screen.getByText("On")).toBeInTheDocument();
      expect(screen.getByText("Not On")).toBeInTheDocument();
      expect(screen.getByText("After")).toBeInTheDocument();
      expect(screen.getByText("Before")).toBeInTheDocument();
      expect(screen.getByText("On or After")).toBeInTheDocument();
      expect(screen.getByText("On or Before")).toBeInTheDocument();
    });
  });

  it("renders correct input and operators for 'boolean' type", async () => {
    render(<ColumnFilter {...defaultProps} columnType="boolean" />);
    // Use getByRole('button')
    fireEvent.click(screen.getByRole('button', { name: /filter/i }));

    // Check default operator
    expect(screen.getByRole("combobox")).toHaveValue("eq");
    // Check input type (should be a select for boolean)
    expect(
      screen.getByRole("combobox", { name: "Select..." }),
    ).toBeInTheDocument();

    // Check operator options (should only be "Is")
    fireEvent.click(screen.getByTestId("select-trigger")); // Open operator select
    await waitFor(() => {
      expect(screen.getByText("Is")).toBeInTheDocument();
      expect(screen.queryByText("Is Not")).not.toBeInTheDocument();
    });
  });

  it("renders correct input and operators for 'select' type", async () => {
    const mockOptions = [
      { label: "Option A", value: "a" },
      { label: "Option B", value: "b" },
    ];
    render(
      <ColumnFilter
        {...defaultProps}
        columnOptions={mockOptions}
        columnType="select"
      />,
    );
    // Use getByRole('button')
    fireEvent.click(screen.getByRole('button', { name: /filter/i }));

    // Check default operator
    expect(screen.getByRole("combobox")).toHaveValue("eq");
    // Check input type (should be a select for select)
    expect(
      screen.getByRole("combobox", { name: "Select..." }),
    ).toBeInTheDocument();

    // Check operator options
    fireEvent.click(screen.getByTestId("select-trigger")); // Open operator select
    await waitFor(() => {
      expect(screen.getByText("Is")).toBeInTheDocument();
      expect(screen.getByText("Is Not")).toBeInTheDocument();
    });

    // Check select options
    fireEvent.click(screen.getByRole("combobox", { name: "Select..." })); // Open value select
    await waitFor(() => {
      expect(screen.getByText("Option A")).toBeInTheDocument();
      expect(screen.getByText("Option B")).toBeInTheDocument();
    });
  });

  it("updates filter state when operator and value change", async () => {
    render(<ColumnFilter {...defaultProps} columnType="number" />);
    // Use getByRole('button')
    fireEvent.click(screen.getByRole('button', { name: /filter/i }));

    // Change operator to 'Greater than'
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "gt" } });
    await waitFor(() => {
      expect(screen.getByRole("combobox")).toHaveValue("gt");
    });

    // Change value
    fireEvent.change(screen.getByTestId("input-number"), {
      target: { value: "42" },
    });
    await waitFor(() => {
      expect(screen.getByTestId("input-number")).toHaveValue(42);
    });

    // Click Apply Filter
    fireEvent.click(screen.getByText("Apply Filter"));

    // Expect onApplyFilter to be called with the updated filter
    expect(defaultProps.onApplyFilter).toHaveBeenCalledWith({
      field: "testColumn",
      operator: "gt",
      value: 42,
    });
  });

  it("calls onApplyFilter with null when Clear is clicked", () => {
    render(<ColumnFilter {...defaultProps} hasActiveFilter={true} />); // Simulate active filter
    // Use getByRole('button')
    fireEvent.click(screen.getByRole('button', { name: /filter/i }));

    // Click Clear
    fireEvent.click(screen.getByText("Clear"));

    // Expect onApplyFilter to be called with null
    expect(defaultProps.onApplyFilter).toHaveBeenCalledWith(null);
    // Expect value state to be reset
    // Re-open popover to check state after clear
    fireEvent.click(screen.getByRole('button', { name: /filter/i }));
    expect(screen.getByTestId("input-text")).toHaveValue("");
  });

  it("initializes with existing filter", () => {
    const existingFilter = {
      field: "testColumn",
      operator: "gt" as const,
      value: 100,
    };
    render(
      <ColumnFilter
        {...defaultProps}
        columnType="number"
        existingFilter={existingFilter}
        hasActiveFilter={true}
      />,
    );
    // Use getByRole('button')
    fireEvent.click(screen.getByRole('button', { name: /filter/i }));

    // Check if operator and value are initialized correctly
    expect(screen.getByRole("combobox")).toHaveValue("gt");
    expect(screen.getByTestId("input-number")).toHaveValue(100);
  });

  it("resets state when existing filter becomes undefined", () => {
    const existingFilter = {
      field: "testColumn",
      operator: "gt" as const,
      value: 100,
    };
    const { rerender } = render(
      <ColumnFilter
        {...defaultProps}
        columnType="number"
        existingFilter={existingFilter}
        hasActiveFilter={true}
      />,
    );
    // Use getByRole('button')
    fireEvent.click(screen.getByRole('button', { name: /filter/i }));

    // Rerender without existing filter
    rerender(<ColumnFilter {...defaultProps} columnType="number" />);

    // Re-open popover to check state
    // Use getByRole('button')
    fireEvent.click(screen.getByRole('button', { name: /filter/i }));

    // Expect state to be reset to default
    expect(screen.getByRole("combobox")).toHaveValue("eq");
    expect(screen.getByTestId("input-number")).toHaveValue(null); // Number input value is null when empty
  });
});
