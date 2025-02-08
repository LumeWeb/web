import { render, screen, fireEvent, waitFor, act, cleanup } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { z } from "zod";

import { FilterPanel } from "./FilterPanel";
// Remove the direct import of the hook
// import { useScreenReaderAnnouncement } from "../screen-reader/hooks/useScreenReaderAnnouncement";
import { SavedFiltersPanel } from "./SavedFiltersPanel"; // Import the actual component to mock it
import { FilterField } from "./types/filter-types"; // Import the FilterField type

// Mock necessary components and hooks
vi.mock("@lumeweb/portal-framework-ui-core", () => ({
  cn: vi.fn((...classes) => classes.join(" ")),
  Button: vi.fn(({ children, onClick, ...props }) => (
    <button {...props} onClick={onClick}>
      {children}
    </button>
  )),
  Checkbox: vi.fn(({ checked, onCheckedChange, ...props }) => (
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
      {...props}
    />
  )),
  DatePicker: vi.fn(({ date, setDate, placeholder, disabled, className }) => (
    <input
      type="date"
      value={date ? date.toISOString().split("T")[0] : ""}
      onChange={(e) => setDate?.(e.target.value ? new Date(e.target.value) : undefined)}
      placeholder={placeholder}
      disabled={disabled}
      className={className}
      data-testid={`datepicker-${placeholder?.replace(/\s+/g, "-").toLowerCase()}`}
    />
  )),
  Dialog: vi.fn(({ open, onOpenChange, children }) => (
    open ? <div data-testid="dialog">{children}</div> : null
  )),
  DialogClose: vi.fn(({ children, onClick }) => <button onClick={onClick}>{children}</button>),
  DialogContent: vi.fn(({ children, className }) => <div className={className}>{children}</div>),
  DialogDescription: vi.fn(({ children }) => <p>{children}</p>),
  DialogFooter: vi.fn(({ children }) => <div>{children}</div>),
  DialogHeader: vi.fn(({ children }) => <div>{children}</div>),
  DialogTitle: vi.fn(({ children }) => <h3>{children}</h3>),
  Input: vi.fn(({ value, onChange, placeholder, type, className, disabled }) => (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      type={type}
      className={className}
      disabled={disabled}
      data-testid={`input-${placeholder?.replace(/\s+/g, "-").toLowerCase() || type}`}
    />
  )),
  Label: vi.fn(({ children, htmlFor, className }) => (
    <label htmlFor={htmlFor} className={className}>
      {children}
    </label>
  )),
  Popover: vi.fn(({ children, open, onOpenChange }) => (
    <div data-testid="popover">{children}</div>
  )),
  PopoverContent: vi.fn(({ children, className }) => <div className={className}>{children}</div>),
  PopoverTrigger: vi.fn(({ children }) => <button>{children}</button>),
  Select: vi.fn(({ value, onValueChange, children, disabled }) => (
    <select value={value} onChange={(e) => onValueChange?.(e.target.value)} disabled={disabled}>
      {children}
    </select>
  )),
  SelectContent: vi.fn(({ children }) => <div>{children}</div>),
  SelectItem: vi.fn(({ value, children }) => <option value={value}>{children}</option>),
  SelectTrigger: vi.fn(({ children }) => <button>{children}</button>),
  SelectValue: vi.fn(({ placeholder }) => <span>{placeholder}</span>),
  Tooltip: vi.fn(({ children }) => <div>{children}</div>),
  TooltipContent: vi.fn(({ children }) => <div>{children}</div>),
  TooltipProvider: vi.fn(({ children }) => <div>{children}</div>),
  TooltipTrigger: vi.fn(({ children }) => <span>{children}</span>),
}));

vi.mock("lucide-react", () => ({
  Calendar: vi.fn(() => <svg data-testid="icon-calendar" />),
  ChevronDown: vi.fn(() => <svg data-testid="icon-chevron-down" />),
  ChevronUp: vi.fn(() => <svg data-testid="icon-chevron-up" />),
  Filter: vi.fn(() => <svg data-testid="icon-filter" />),
  Hash: vi.fn(() => <svg data-testid="icon-hash" />),
  Info: vi.fn(() => <svg data-testid="icon-info" />),
  Plus: vi.fn(() => <svg data-testid="icon-plus" />),
  RefreshCw: vi.fn(() => <svg data-testid="icon-refresh-cw" />),
  Search: vi.fn(() => <svg data-testid="icon-search" />),
  SlidersHorizontal: vi.fn(() => <svg data-testid="icon-sliders-horizontal" />),
  Tag: vi.fn(() => <svg data-testid="icon-tag" />),
  Trash2: vi.fn(() => <svg data-testid="icon-trash" />),
  X: vi.fn(() => <svg data-testid="icon-x" />),
}));

// Mock the SavedFiltersPanel component
vi.mock("./SavedFiltersPanel", () => ({
  SavedFiltersPanel: vi.fn(({ enableSavedFilters, ...props }) =>
    enableSavedFilters ? (
      <div data-testid="mock-saved-filters-panel" {...props}>
        Mock Saved Filters Panel
      </div>
    ) : null,
  ),
}));

// Mock the FilterChip component
vi.mock("../../components/FilterChip", () => ({
  FilterChip: vi.fn(({ label, onRemove, variant }) => (
    <div data-testid={`filter-chip-${variant}`} onClick={onRemove}>
      {label} <button>X</button>
    </div>
  )),
}));

// Mock screen reader announcement hook
const mockAnnounce = vi.fn(); // Define the mock function here

vi.mock("../screen-reader/hooks/useScreenReaderAnnouncement", async (importOriginal) => {
  // Use dynamic import to ensure mockAnnounce is available
  const actual = await importOriginal<typeof import("../screen-reader/hooks/useScreenReaderAnnouncement")>();
  return {
    ...actual,
    useScreenReaderAnnouncement: vi.fn(() => ({
      announce: mockAnnounce, // Reference the mockAnnounce from the outer scope
    })),
  };
});


// Helper function to create mock data
const createMockData = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: String(i),
    name: `Item ${i}`,
    value: i * 10,
    isActive: i % 2 === 0,
    createdAt: `2023-01-${String(i + 1).padStart(2, "0")}`,
    category: i % 3 === 0 ? "A" : i % 3 === 1 ? "B" : "C",
  }));
};

const mockSampleRecord = createMockData(10);

const mockFields: FilterField[] = [
  { field: "id", label: "ID", type: "string", isSearchable: true, isFilterable: true, priority: "low" },
  { field: "name", label: "Name", type: "string", isSearchable: true, isFilterable: true, priority: "high" },
  { field: "age", label: "Age", type: "number", isSearchable: false, isFilterable: true, priority: "medium" },
  { field: "isActive", label: "Active", type: "boolean", isSearchable: false, isFilterable: true, priority: "high" },
  { field: "createdAt", label: "Created At", type: "date", isSearchable: false, isFilterable: true, priority: "medium" },
  { field: "category", label: "Category", type: "select", isSearchable: false, isFilterable: true, priority: "high", options: [{ label: "A", value: "A" }, { label: "B", value: "B" }, { label: "C", value: "C" }] },
];

const mockSchema = z.object({
  id: z.string(),
  name: z.string(),
  age: z.number(),
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
  category: z.enum(["A", "B", "C"]),
});

const mockSchemaWithOptions = {
  id: { type: "string" as const },
  name: { type: "string" as const },
  age: { type: "number" as const },
  isActive: { type: "boolean" as const },
  createdAt: { type: "date" as const },
  category: { type: "select" as const, options: [{ label: "A", value: "A" }, { label: "B", value: "B" }, { label: "C", value: "C" }] },
};


describe("FilterPanel", () => {
  const defaultProps = {
    onApplyFilters: vi.fn(),
    onClearFilters: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders without crashing", () => {
    render(<FilterPanel {...defaultProps} />);
    expect(screen.getByText("Advanced Filters")).toBeInTheDocument();
  });

  it("renders Quick Filters button when enabled", () => {
    render(<FilterPanel {...defaultProps} enableQuickFilters />);
    expect(screen.getByText("Quick Filters")).toBeInTheDocument();
  });

  it("does not render Quick Filters button when disabled", () => {
    render(<FilterPanel {...defaultProps} enableQuickFilters={false} />);
    expect(screen.queryByText("Quick Filters")).not.toBeInTheDocument();
  });

  it("renders Advanced Filters button when enabled", () => {
    render(<FilterPanel {...defaultProps} enableAdvancedFilters />);
    expect(screen.getByText("Advanced Filters")).toBeInTheDocument();
  });

  it("does not render Advanced Filters button when disabled", () => {
    render(<FilterPanel {...defaultProps} enableAdvancedFilters={false} />);
    expect(screen.queryByText("Advanced Filters")).not.toBeInTheDocument();
  });

  it("renders Saved Filters Panel when enabled", () => {
    render(<FilterPanel {...defaultProps} enableSavedFilters />);
    expect(screen.getByTestId("mock-saved-filters-panel")).toBeInTheDocument();
  });

  it("does not render Saved Filters Panel when disabled", () => {
    render(<FilterPanel {...defaultProps} enableSavedFilters={false} />);
    expect(screen.queryByTestId("mock-saved-filters-panel")).not.toBeInTheDocument();
  });

  describe("Field Detection", () => {
    it("uses explicit fields prop when provided", () => {
      render(<FilterPanel {...defaultProps} fields={mockFields} />);
      // Check for elements that would only appear if mockFields were used
      fireEvent.click(screen.getByText("Advanced Filters")); // Expand panel
      expect(screen.getByLabelText("Field")).toBeInTheDocument(); // Check for a field select
      // Check if 'Age' is an option in the field select (only present in mockFields)
      expect(screen.getByRole("option", { name: "Age" })).toBeInTheDocument();
    });

    it("infers fields from Zod schema", () => {
      render(<FilterPanel {...defaultProps} schema={mockSchema} />);
      fireEvent.click(screen.getByText("Advanced Filters")); // Expand panel
      expect(screen.getByLabelText("Field")).toBeInTheDocument();
      // Check if 'age' is an option (inferred from schema)
      expect(screen.getByRole("option", { name: "age" })).toBeInTheDocument();
      // Check if 'category' is inferred as select with options
      expect(screen.getByRole("option", { name: "category" })).toBeInTheDocument();
    });

    it("infers fields from JSON schema with options", () => {
      render(<FilterPanel {...defaultProps} schema={mockSchemaWithOptions} />);
      fireEvent.click(screen.getByText("Advanced Filters")); // Expand panel
      expect(screen.getByLabelText("Field")).toBeInTheDocument();
      // Check if 'age' is an option (inferred from schema)
      expect(screen.getByRole("option", { name: "age" })).toBeInTheDocument();
      // Check if 'category' is inferred as select with options
      expect(screen.getByRole("option", { name: "category" })).toBeInTheDocument();
    });


    it("infers fields from sampleRecord", () => {
      render(<FilterPanel {...defaultProps} sampleRecord={mockSampleRecord} />);
      fireEvent.click(screen.getByText("Advanced Filters")); // Expand panel
      expect(screen.getByLabelText("Field")).toBeInTheDocument();
      // Check if 'name' is an option (inferred from sampleRecord)
      expect(screen.getByRole("option", { name: "name" })).toBeInTheDocument();
      // Check if 'isActive' is inferred as boolean
      expect(screen.getByRole("option", { name: "isActive" })).toBeInTheDocument();
      // Check if 'createdAt' is inferred as date
      expect(screen.getByRole("option", { name: "createdAt" })).toBeInTheDocument();
      // Check if 'category' is inferred as select with options
      expect(screen.getByRole("option", { name: "category" })).toBeInTheDocument();
    });

    it("prioritizes fields prop over schema and sampleRecord", () => {
      render(
        <FilterPanel
          {...defaultProps}
          fields={mockFields}
          schema={mockSchema}
          sampleRecord={mockSampleRecord}
        />,
      );
      fireEvent.click(screen.getByText("Advanced Filters")); // Expand panel
      expect(screen.getByLabelText("Field")).toBeInTheDocument();
      // Check if 'Age' is present (from mockFields), not 'age' (from schema/sample)
      expect(screen.getByRole("option", { name: "Age" })).toBeInTheDocument();
      expect(screen.queryByRole("option", { name: "age" })).not.toBeInTheDocument();
    });

    it("prioritizes schema over sampleRecord when fields prop is not provided", () => {
      render(
        <FilterPanel
          {...defaultProps}
          schema={mockSchema}
          sampleRecord={mockSampleRecord}
        />,
      );
      fireEvent.click(screen.getByText("Advanced Filters")); // Expand panel
      expect(screen.getByLabelText("Field")).toBeInTheDocument();
      // Check if 'age' is present (from schema), not 'value' (from sampleRecord)
      expect(screen.getByRole("option", { name: "age" })).toBeInTheDocument();
      expect(screen.queryByRole("option", { name: "value" })).not.toBeInTheDocument();
    });
  });

  describe("Quick Filters", () => {
    it("renders quick filter panel when button is clicked", () => {
      render(<FilterPanel {...defaultProps} enableQuickFilters fields={mockFields} />);
      fireEvent.click(screen.getByText("Quick Filters"));
      expect(screen.getByText("Quick Filters")).toBeInTheDocument(); // Panel title
      expect(screen.getByText("Select Filters")).toBeInTheDocument();
      expect(screen.getByText("Date Range")).toBeInTheDocument();
    });

    it("closes quick filter panel when Close button is clicked", () => {
      render(<FilterPanel {...defaultProps} enableQuickFilters fields={mockFields} />);
      fireEvent.click(screen.getByText("Quick Filters"));
      expect(screen.getByText("Quick Filters")).toBeInTheDocument(); // Panel title
      fireEvent.click(screen.getByText("Close"));
      expect(screen.queryByText("Quick Filters")).not.toBeInTheDocument(); // Panel title should be gone
    });

    it("renders simple filter fields (select and boolean) with high/medium priority", () => {
      render(<FilterPanel {...defaultProps} enableQuickFilters fields={mockFields} />);
      fireEvent.click(screen.getByText("Quick Filters"));

      expect(screen.getByText("Active")).toBeInTheDocument(); // Boolean, high priority
      expect(screen.getByText("Category")).toBeInTheDocument(); // Select, high priority
      // Age is medium priority but numeric, so not in simple select filters
      expect(screen.queryByText("Age")).not.toBeInTheDocument();
      // ID is low priority, so not in simple select filters
      expect(screen.queryByText("ID")).not.toBeInTheDocument();
    });

    it("renders date range filter in quick panel if date fields exist", () => {
      render(<FilterPanel {...defaultProps} enableQuickFilters fields={mockFields} />);
      fireEvent.click(screen.getByText("Quick Filters"));
      expect(screen.getByText("Date Range")).toBeInTheDocument();
      expect(screen.getByTestId("datepicker-start date")).toBeInTheDocument();
      expect(screen.getByTestId("datepicker-end date")).toBeInTheDocument();
    });

    it("does not render date range filter in quick panel if no date fields exist", () => {
      const fieldsWithoutDate = mockFields.filter((f) => f.type !== "date");
      render(<FilterPanel {...defaultProps} enableQuickFilters fields={fieldsWithoutDate} />);
      fireEvent.click(screen.getByText("Quick Filters"));
      expect(screen.queryByText("Date Range")).not.toBeInTheDocument();
    });

    it("toggles simple filter values and applies filters immediately", async () => {
      const onApplyFilters = vi.fn();
      render(
        <FilterPanel
          {...defaultProps}
          enableQuickFilters
          fields={mockFields}
          onApplyFilters={onApplyFilters}
        />,
      );
      fireEvent.click(screen.getByText("Quick Filters"));

      // Click 'A' button for Category filter
      fireEvent.click(screen.getByText("A"));

      // Expect onApplyFilters to be called with the filter
      await waitFor(() => {
        expect(onApplyFilters).toHaveBeenCalledWith([
          { field: "category", operator: "eq", value: "A" },
        ]);
      });

      // Click 'A' button again to remove
      fireEvent.click(screen.getByText("A"));

      // Expect onApplyFilters to be called with no filters
      await waitFor(() => {
        expect(onApplyFilters).toHaveBeenCalledWith([]);
      });
    });

    it("applies search term filter immediately (debounced)", async () => {
      vi.useFakeTimers(); // Use fake timers for debounce test
      const onApplyFilters = vi.fn();
      render(
        <FilterPanel
          {...defaultProps}
          enableQuickFilters
          fields={mockFields}
          onApplyFilters={onApplyFilters}
        />,
      );

      const searchInput = screen.getByPlaceholderText("Search...");
      fireEvent.change(searchInput, { target: { value: "test" } });

      // onApplyFilters should not be called immediately
      expect(onApplyFilters).not.toHaveBeenCalled();

      // Advance timers by less than debounce delay
      act(() => {
        vi.advanceTimersByTime(200);
      });
      expect(onApplyFilters).not.toHaveBeenCalled();

      // Advance timers by more than debounce delay
      act(() => {
        vi.advanceTimersByTime(100); // Total 300ms
      });

      // Expect onApplyFilters to be called with the search filter
      await waitFor(() => {
        expect(onApplyFilters).toHaveBeenCalledWith([
          { field: "name", operator: "contains", value: "test" }, // 'name' is high priority searchable
        ]);
      });

      vi.useRealTimers(); // Restore real timers
    });

    it("applies simple date range filter immediately", async () => {
      const onApplyFilters = vi.fn();
      render(
        <FilterPanel
          {...defaultProps}
          enableQuickFilters
          fields={mockFields}
          onApplyFilters={onApplyFilters}
        />,
      );
      fireEvent.click(screen.getByText("Quick Filters"));

      const startDatePicker = screen.getByTestId("datepicker-start date");
      const endDatePicker = screen.getByTestId("datepicker-end date");

      // Set start date
      fireEvent.change(startDatePicker, { target: { value: "2023-01-01" } });

      await waitFor(() => {
        expect(onApplyFilters).toHaveBeenCalledWith([
          { field: "createdAt", operator: "gte", value: "2023-01-01" },
        ]);
      });

      // Set end date
      fireEvent.change(endDatePicker, { target: { value: "2023-01-31" } });

      await waitFor(() => {
        expect(onApplyFilters).toHaveBeenCalledWith([
          { field: "createdAt", operator: "gte", value: "2023-01-01" },
          { field: "createdAt", operator: "lte", value: "2023-01-31" },
        ]);
      });
    });

    it("clears simple filters and search term when Clear Filters is clicked", async () => {
      const onApplyFilters = vi.fn();
      render(
        <FilterPanel
          {...defaultProps}
          enableQuickFilters
          fields={mockFields}
          onApplyFilters={onApplyFilters}
        />,
      );
      fireEvent.click(screen.getByText("Quick Filters"));

      // Set some filters
      fireEvent.change(screen.getByPlaceholderText("Search..."), { target: { value: "test" } });
      fireEvent.click(screen.getByText("A"));
      fireEvent.change(screen.getByTestId("datepicker-start date"), { target: { value: "2023-01-01" } });

      // Wait for filters to be applied
      await waitFor(() => expect(onApplyFilters).toHaveBeenCalled());
      onApplyFilters.mockClear(); // Clear mock history

      // Click Clear Filters button
      fireEvent.click(screen.getByText("Clear Filters"));

      // Expect onApplyFilters to be called with empty array
      await waitFor(() => {
        expect(onApplyFilters).toHaveBeenCalledWith([]);
      });

      // Check if inputs are cleared
      expect(screen.getByPlaceholderText("Search...")).toHaveValue("");
      expect(screen.getByTestId("datepicker-start date")).toHaveValue("");
      expect(screen.getByTestId("datepicker-end date")).toHaveValue("");
      // Check if filter chip is gone (mocked behavior)
      expect(screen.queryByText("Category: A")).not.toBeInTheDocument();
    });
  });

  describe("Advanced Filters Modal", () => {
    it("opens advanced filter modal when button is clicked", () => {
      render(<FilterPanel {...defaultProps} enableAdvancedFilters />);
      fireEvent.click(screen.getByText("Advanced Filters"));
      expect(screen.getByTestId("dialog")).toBeInTheDocument();
      expect(screen.getByText("Advanced Filters")).toBeInTheDocument(); // Modal title
    });

    it("closes advanced filter modal when Cancel button is clicked", async () => {
      render(<FilterPanel {...defaultProps} enableAdvancedFilters />);
      fireEvent.click(screen.getByText("Advanced Filters"));
      expect(screen.getByTestId("dialog")).toBeInTheDocument();
      fireEvent.click(screen.getByText("Cancel"));
      await waitFor(() => {
        expect(screen.queryByTestId("dialog")).not.toBeInTheDocument();
      });
    });

    it("closes advanced filter modal when X button is clicked", async () => {
      render(<FilterPanel {...defaultProps} enableAdvancedFilters />);
      fireEvent.click(screen.getByText("Advanced Filters"));
      expect(screen.getByTestId("dialog")).toBeInTheDocument();
      fireEvent.click(screen.getByRole("button", { name: "Close" })); // Click the X button
      await waitFor(() => {
        expect(screen.queryByTestId("dialog")).not.toBeInTheDocument();
      });
    });

    it("shows unsaved changes warning tooltip when clicking outside with changes", async () => {
      // Temporarily mock Dialog to capture onOpenChange
      const DialogSpy = vi.fn(({ onOpenChange, children }) => {
        DialogSpy.onOpenChange = onOpenChange; // Capture the handler
        // Simulate the dialog being open initially
        return <div data-testid="dialog">{children}</div>;
      });
      vi.mock("@lumeweb/portal-framework-ui-core", async (importOriginal) => {
        const actual = await importOriginal<typeof import("@lumeweb/portal-framework-ui-core")>();
        return {
          ...actual,
          Dialog: DialogSpy, // Use the spy
          // Keep other mocks as before
          cn: vi.fn((...classes) => classes.join(" ")),
          Button: vi.fn(({ children, onClick, ...props }) => (
            <button {...props} onClick={onClick}>
              {children}
            </button>
          )),
          Checkbox: vi.fn(({ checked, onCheckedChange, ...props }) => (
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => onCheckedChange?.(e.target.checked)}
              {...props}
            />
          )),
          DatePicker: vi.fn(({ date, setDate, placeholder, disabled, className }) => (
            <input
              type="date"
              value={date ? date.toISOString().split("T")[0] : ""}
              onChange={(e) => setDate?.(e.target.value ? new Date(e.target.value) : undefined)}
              placeholder={placeholder}
              disabled={disabled}
              className={className}
              data-testid={`datepicker-${placeholder?.replace(/\s+/g, "-").toLowerCase()}`}
            />
          )),
          DialogClose: vi.fn(({ children, onClick }) => <button onClick={onClick}>{children}</button>),
          DialogContent: vi.fn(({ children, className }) => <div className={className}>{children}</div>),
          DialogDescription: vi.fn(({ children }) => <p>{children}</p>),
          DialogFooter: vi.fn(({ children }) => <div>{children}</div>),
          DialogHeader: vi.fn(({ children }) => <div>{children}</div>),
          DialogTitle: vi.fn(({ children }) => <h3>{children}</h3>),
          Input: vi.fn(({ value, onChange, placeholder, type, className, disabled }) => (
            <input
              value={value}
              onChange={onChange}
              placeholder={placeholder}
              type={type}
              className={className}
              disabled={disabled}
              data-testid={`input-${placeholder?.replace(/\s+/g, "-").toLowerCase() || type}`}
            />
          )),
          Label: vi.fn(({ children, htmlFor, className }) => (
            <label htmlFor={htmlFor} className={className}>
              {children}
            </label>
          )),
          Popover: vi.fn(({ children, open, onOpenChange }) => (
            <div data-testid="popover">{children}</div>
          )),
          PopoverContent: vi.fn(({ children, className }) => <div className={className}>{children}</div>),
          PopoverTrigger: vi.fn(({ children }) => <button>{children}</button>),
          Select: vi.fn(({ value, onValueChange, children, disabled }) => (
            <select value={value} onChange={(e) => onValueChange?.(e.target.value)} disabled={disabled}>
              {children}
            </select>
          )),
          SelectContent: vi.fn(({ children }) => <div>{children}</div>),
          SelectItem: vi.fn(({ value, children }) => <option value={value}>{children}</option>),
          SelectTrigger: vi.fn(({ children }) => <button>{children}</button>),
          SelectValue: vi.fn(({ placeholder }) => <span>{placeholder}</span>),
          Tooltip: vi.fn(({ children }) => <div>{children}</div>),
          TooltipContent: vi.fn(({ children }) => <div>{children}</div>),
          TooltipProvider: vi.fn(({ children }) => <div>{children}</div>),
          TooltipTrigger: vi.fn(({ children }) => <span>{children}</span>),
        };
      });

      render(<FilterPanel {...defaultProps} enableAdvancedFilters fields={mockFields} />);
      fireEvent.click(screen.getByText("Advanced Filters")); // Open modal

      // Add a filter to create unsaved changes
      fireEvent.click(screen.getByText("Add Filter"));

      // Simulate clicking outside by calling the captured onOpenChange handler with false
      await act(async () => {
        DialogSpy.onOpenChange(false);
      });

      // Expect the warning tooltip to be visible
      await waitFor(() => {
        expect(screen.getByText("Please use the X button or Cancel to close without losing your changes")).toBeInTheDocument();
      });

      // Expect the modal to *not* close
      expect(screen.getByTestId("dialog")).toBeInTheDocument();

      // Click the tooltip's close button
      fireEvent.click(screen.getByRole("button", { name: "Close" }));
      expect(screen.queryByText("Please use the X button or Cancel to close without losing your changes")).not.toBeInTheDocument();

      // Now click the modal's Cancel button, it should close without warning
      fireEvent.click(screen.getByText("Cancel"));
      await waitFor(() => {
        expect(screen.queryByTestId("dialog")).not.toBeInTheDocument();
      });

      // Restore original mock after the test
      vi.restoreAllMocks();
      // Re-mock necessary components that were restored
      vi.mock("@lumeweb/portal-framework-ui-core", async (importOriginal) => {
        const actual = await importOriginal<typeof import("@lumeweb/portal-framework-ui-core")>();
        return {
          ...actual,
          cn: vi.fn((...classes) => classes.join(" ")),
          Button: vi.fn(({ children, onClick, ...props }) => (
            <button {...props} onClick={onClick}>
              {children}
            </button>
          )),
          Checkbox: vi.fn(({ checked, onCheckedChange, ...props }) => (
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => onCheckedChange?.(e.target.checked)}
              {...props}
            />
          )),
          DatePicker: vi.fn(({ date, setDate, placeholder, disabled, className }) => (
            <input
              type="date"
              value={date ? date.toISOString().split("T")[0] : ""}
              onChange={(e) => setDate?.(e.target.value ? new Date(e.target.value) : undefined)}
              placeholder={placeholder}
              disabled={disabled}
              className={className}
              data-testid={`datepicker-${placeholder?.replace(/\s+/g, "-").toLowerCase()}`}
            />
          )),
          Dialog: vi.fn(({ open, onOpenChange, children }) => (
            open ? <div data-testid="dialog">{children}</div> : null
          )),
          DialogClose: vi.fn(({ children, onClick }) => <button onClick={onClick}>{children}</button>),
          DialogContent: vi.fn(({ children, className }) => <div className={className}>{children}</div>),
          DialogDescription: vi.fn(({ children }) => <p>{children}</p>),
          DialogFooter: vi.fn(({ children }) => <div>{children}</div>),
          DialogHeader: vi.fn(({ children }) => <div>{children}</div>),
          DialogTitle: vi.fn(({ children }) => <h3>{children}</h3>),
          Input: vi.fn(({ value, onChange, placeholder, type, className, disabled }) => (
            <input
              value={value}
              onChange={onChange}
              placeholder={placeholder}
              type={type}
              className={className}
              disabled={disabled}
              data-testid={`input-${placeholder?.replace(/\s+/g, "-").toLowerCase() || type}`}
            />
          )),
          Label: vi.fn(({ children, htmlFor, className }) => (
            <label htmlFor={htmlFor} className={className}>
              {children}
            </label>
          )),
          Popover: vi.fn(({ children, open, onOpenChange }) => (
            <div data-testid="popover">{children}</div>
          )),
          PopoverContent: vi.fn(({ children, className }) => <div className={className}>{children}</div>),
          PopoverTrigger: vi.fn(({ children }) => <button>{children}</button>),
          Select: vi.fn(({ value, onValueChange, children, disabled }) => (
            <select value={value} onChange={(e) => onValueChange?.(e.target.value)} disabled={disabled}>
              {children}
            </select>
          )),
          SelectContent: vi.fn(({ children }) => <div>{children}</div>),
          SelectItem: vi.fn(({ value, children }) => <option value={value}>{children}</option>),
          SelectTrigger: vi.fn(({ children }) => <button>{children}</button>),
          SelectValue: vi.fn(({ placeholder }) => <span>{placeholder}</span>),
          Tooltip: vi.fn(({ children }) => <div>{children}</div>),
          TooltipContent: vi.fn(({ children }) => <div>{children}</div>),
          TooltipProvider: vi.fn(({ children }) => <div>{children}</div>),
          TooltipTrigger: vi.fn(({ children }) => <span>{children}</span>),
        };
      });
      vi.mock("lucide-react", () => ({
        Calendar: vi.fn(() => <svg data-testid="icon-calendar" />),
        ChevronDown: vi.fn(() => <svg data-testid="icon-chevron-down" />),
        ChevronUp: vi.fn(() => <svg data-testid="icon-chevron-up" />),
        Filter: vi.fn(() => <svg data-testid="icon-filter" />),
        Hash: vi.fn(() => <svg data-testid="icon-hash" />),
        Info: vi.fn(() => <svg data-testid="icon-info" />),
        Plus: vi.fn(() => <svg data-testid="icon-plus" />),
        RefreshCw: vi.fn(() => <svg data-testid="icon-refresh-cw" />),
        Search: vi.fn(() => <svg data-testid="icon-search" />),
        SlidersHorizontal: vi.fn(() => <svg data-testid="icon-sliders-horizontal" />),
        Tag: vi.fn(() => <svg data-testid="icon-tag" />),
        Trash2: vi.fn(() => <svg data-testid="icon-trash" />),
        X: vi.fn(() => <svg data-testid="icon-x" />),
      }));
      vi.mock("./SavedFiltersPanel", () => ({
        SavedFiltersPanel: vi.fn(({ enableSavedFilters, ...props }) =>
          enableSavedFilters ? (
            <div data-testid="mock-saved-filters-panel" {...props}>
              Mock Saved Filters Panel
            </div>
          ) : null,
        ),
      }));
      vi.mock("../../components/FilterChip", () => ({
        FilterChip: vi.fn(({ label, onRemove, variant }) => (
          <div data-testid={`filter-chip-${variant}`} onClick={onRemove}>
            {label} <button>X</button>
          </div>
        )),
      }));
      // The mock for useScreenReaderAnnouncement is now global at the top
    });


    it("adds and removes custom filters in the modal", async () => {
      render(<FilterPanel {...defaultProps} enableAdvancedFilters fields={mockFields} />);
      fireEvent.click(screen.getByText("Advanced Filters")); // Open modal

      // Add a filter
      fireEvent.click(screen.getByText("Add Filter"));
      await waitFor(() => {
        expect(screen.getAllByText("Remove filter")).toHaveLength(1);
      });

      // Add another filter
      fireEvent.click(screen.getByText("Add Filter"));
      await waitFor(() => {
        expect(screen.getAllByText("Remove filter")).toHaveLength(2);
      });

      // Remove the first filter
      fireEvent.click(screen.getAllByText("Remove filter")[0]);
      await waitFor(() => {
        expect(screen.getAllByText("Remove filter")).toHaveLength(1);
      });

      // Remove the last filter
      fireEvent.click(screen.getAllByText("Remove filter")[0]);
      await waitFor(() => {
        expect(screen.queryByText("Remove filter")).not.toBeInTheDocument();
        expect(screen.getByText("No custom filters added yet")).toBeInTheDocument();
      });
    });

    it("updates custom filter field, operator, and value", async () => {
      render(<FilterPanel {...defaultProps} enableAdvancedFilters fields={mockFields} />);
      fireEvent.click(screen.getByText("Advanced Filters")); // Open modal
      fireEvent.click(screen.getByText("Add Filter")); // Add a filter

      // Update field to 'Age'
      fireEvent.change(screen.getByRole("combobox", { name: "Field" }), { target: { value: "age" } });
      await waitFor(() => {
        // Operator should reset to default for number ('Equals')
        expect(screen.getByRole("combobox", { name: "Operator" })).toHaveValue("eq");
        // Value input should be type number
        expect(screen.getByPlaceholderText("Enter value")).toHaveAttribute("type", "number");
      });

      // Update operator to 'Greater Than'
      fireEvent.change(screen.getByRole("combobox", { name: "Operator" }), { target: { value: "gt" } });
      await waitFor(() => {
        expect(screen.getByRole("combobox", { name: "Operator" })).toHaveValue("gt");
      });

      // Update value
      fireEvent.change(screen.getByPlaceholderText("Enter value"), { target: { value: "42" } });
      await waitFor(() => {
        expect(screen.getByPlaceholderText("Enter value")).toHaveValue("42");
      });

      // Update field to 'Category' (select)
      fireEvent.change(screen.getByRole("combobox", { name: "Field" }), { target: { value: "category" } });
      await waitFor(() => {
        // Operator should reset to default for select ('Is')
        expect(screen.getByRole("combobox", { name: "Operator" })).toHaveValue("eq");
        // Value input should be a select
        expect(screen.getByRole("combobox", { name: "Value" })).toBeInTheDocument();
        // Select value 'B'
        fireEvent.change(screen.getByRole("combobox", { name: "Value" }), { target: { value: "B" } });
      });
      await waitFor(() => {
        expect(screen.getByRole("combobox", { name: "Value" })).toHaveValue("B");
      });

      // Update field to 'Active' (boolean)
      fireEvent.change(screen.getByRole("combobox", { name: "Field" }), { target: { value: "isActive" } });
      await waitFor(() => {
        // Operator should reset to default for boolean ('Is')
        expect(screen.getByRole("combobox", { name: "Operator" })).toHaveValue("eq");
        // Value input should be a select
        expect(screen.getByRole("combobox", { name: "Value" })).toBeInTheDocument();
        // Select value 'false'
        fireEvent.change(screen.getByRole("combobox", { name: "Value" }), { target: { value: "false" } });
      });
      await waitFor(() => {
        expect(screen.getByRole("combobox", { name: "Value" })).toHaveValue("false");
      });

      // Update field to 'Created At' (date)
      fireEvent.change(screen.getByRole("combobox", { name: "Field" }), { target: { value: "createdAt" } });
      await waitFor(() => {
        // Operator should reset to default for date ('On')
        expect(screen.getByRole("combobox", { name: "Operator" })).toHaveValue("eq");
        // Value input should be a date picker
        expect(screen.getByTestId("datepicker-select date")).toBeInTheDocument();
        // Set date
        fireEvent.change(screen.getByTestId("datepicker-select date"), { target: { value: "2024-01-15" } });
      });
      await waitFor(() => {
        expect(screen.getByTestId("datepicker-select date")).toHaveValue("2024-01-15");
      });
    });

    it("handles 'between' operator for numeric and date fields", async () => {
      render(<FilterPanel {...defaultProps} enableAdvancedFilters fields={mockFields} />);
      fireEvent.click(screen.getByText("Advanced Filters")); // Open modal
      fireEvent.click(screen.getByText("Add Filter")); // Add a filter

      // Set field to 'Age' (numeric)
      fireEvent.change(screen.getByRole("combobox", { name: "Field" }), { target: { value: "age" } });
      await waitFor(() => {
        // Set operator to 'Between'
        fireEvent.change(screen.getByRole("combobox", { name: "Operator" }), { target: { value: "between" } });
      });
      await waitFor(() => {
        // Should show two number inputs
        expect(screen.getByLabelText("Min Value")).toBeInTheDocument();
        expect(screen.getByLabelText("Max Value")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Enter value")).toHaveAttribute("type", "number");
        expect(screen.getByPlaceholderText("Enter max value")).toHaveAttribute("type", "number");
      });

      // Set field to 'Created At' (date)
      fireEvent.change(screen.getByRole("combobox", { name: "Field" }), { target: { value: "createdAt" } });
      await waitFor(() => {
        // Set operator to 'Between'
        fireEvent.change(screen.getByRole("combobox", { name: "Operator" }), { target: { value: "between" } });
      });
      await waitFor(() => {
        // Should show two date pickers
        expect(screen.getByLabelText("Value")).toBeInTheDocument(); // Label remains "Value" for date pickers
        expect(screen.getByLabelText("End Value")).toBeInTheDocument();
        expect(screen.getByTestId("datepicker-select date")).toBeInTheDocument();
        expect(screen.getByTestId("datepicker-end date")).toBeInTheDocument();
      });
    });

    it("handles multi-field search in the modal", async () => {
      render(<FilterPanel {...defaultProps} enableAdvancedFilters fields={mockFields} />);
      fireEvent.click(screen.getByText("Advanced Filters")); // Open modal

      // Enter search term
      fireEvent.change(screen.getByPlaceholderText("Search term..."), { target: { value: "modal search" } });
      await waitFor(() => {
        expect(screen.getByPlaceholderText("Search term...")).toHaveValue("modal search");
      });

      // Select search fields (Name and ID)
      fireEvent.click(screen.getByLabelText("Name"));
      fireEvent.click(screen.getByLabelText("ID"));

      await waitFor(() => {
        expect(screen.getByLabelText("Name")).toBeChecked();
        expect(screen.getByLabelText("ID")).toBeChecked();
      });

      // Click Apply Filters
      fireEvent.click(screen.getByText("Apply Filters"));

      // Expect onApplyFilters to be called with search filters
      await waitFor(() => {
        expect(defaultProps.onApplyFilters).toHaveBeenCalledWith([
          { field: "name", operator: "contains", value: "modal search" },
          { field: "id", operator: "contains", value: "modal search" },
        ]);
      });
    });

    it("handles date range filter in the modal", async () => {
      render(<FilterPanel {...defaultProps} enableAdvancedFilters fields={mockFields} />);
      fireEvent.click(screen.getByText("Advanced Filters")); // Open modal

      // Select date field
      fireEvent.change(screen.getByRole("combobox", { name: "Field" }), { target: { value: "createdAt" } });
      await waitFor(() => {
        expect(screen.getByRole("combobox", { name: "Field" })).toHaveValue("createdAt");
      });

      // Set start and end dates
      fireEvent.change(screen.getByTestId("datepicker-from"), { target: { value: "2023-02-01" } });
      fireEvent.change(screen.getByTestId("datepicker-to"), { target: { value: "2023-02-28" } });

      await waitFor(() => {
        expect(screen.getByTestId("datepicker-from")).toHaveValue("2023-02-01");
        expect(screen.getByTestId("datepicker-to")).toHaveValue("2023-02-28");
      });

      // Click Apply Filters
      fireEvent.click(screen.getByText("Apply Filters"));

      // Expect onApplyFilters to be called with date range filters
      await waitFor(() => {
        expect(defaultProps.onApplyFilters).toHaveBeenCalledWith([
          { field: "createdAt", operator: "gte", value: "2023-02-01" },
          { field: "createdAt", operator: "lte", value: "2023-02-28" },
        ]);
      });
    });

    it("handles numeric filter in the modal", async () => {
      render(<FilterPanel {...defaultProps} enableAdvancedFilters fields={mockFields} />);
      fireEvent.click(screen.getByText("Advanced Filters")); // Open modal

      // Select numeric field
      fireEvent.change(screen.getByRole("combobox", { name: "Field" }), { target: { value: "age" } });
      await waitFor(() => {
        expect(screen.getByRole("combobox", { name: "Field" })).toHaveValue("age");
      });

      // Select operator and value
      fireEvent.change(screen.getByRole("combobox", { name: "Operator" }), { target: { value: "gt" } });
      fireEvent.change(screen.getByPlaceholderText("Enter value"), { target: { value: "18" } });

      await waitFor(() => {
        expect(screen.getByRole("combobox", { name: "Operator" })).toHaveValue("gt");
        expect(screen.getByPlaceholderText("Enter value")).toHaveValue("18");
      });

      // Click Apply Filters
      fireEvent.click(screen.getByText("Apply Filters"));

      // Expect onApplyFilters to be called with numeric filter
      await waitFor(() => {
        expect(defaultProps.onApplyFilters).toHaveBeenCalledWith([
          { field: "age", operator: "gt", value: 18 },
        ]);
      });
    });

    it("clears all modal filters when Clear All is clicked", async () => {
      render(<FilterPanel {...defaultProps} enableAdvancedFilters fields={mockFields} />);
      fireEvent.click(screen.getByText("Advanced Filters")); // Open modal

      // Add some filters
      fireEvent.click(screen.getByText("Add Filter")); // Custom filter
      fireEvent.change(screen.getByPlaceholderText("Search term..."), { target: { value: "test" } }); // Search term
      fireEvent.click(screen.getByLabelText("Name")); // Search field
      fireEvent.change(screen.getByRole("combobox", { name: "Field" }), { target: { value: "createdAt" } }); // Date field
      fireEvent.change(screen.getByTestId("datepicker-from"), { target: { value: "2023-01-01" } }); // Date value
      fireEvent.change(screen.getByRole("combobox", { name: "Field" }), { target: { value: "age" } }); // Numeric field
      fireEvent.change(screen.getByPlaceholderText("Enter value"), { target: { value: "10" } }); // Numeric value

      // Click Clear All
      fireEvent.click(screen.getByText("Clear All"));

      // Expect all modal inputs/states to be reset
      await waitFor(() => {
        expect(screen.queryByText("Remove filter")).not.toBeInTheDocument(); // Custom filters cleared
        expect(screen.getByPlaceholderText("Search term...")).toHaveValue(""); // Search term cleared
        expect(screen.getByLabelText("Name")).not.toBeChecked(); // Search field unchecked
        expect(screen.getByRole("combobox", { name: "Field" })).toHaveValue(""); // Date field reset
        expect(screen.getByTestId("datepicker-from")).toHaveValue(""); // Date value cleared
        expect(screen.getByRole("combobox", { name: "Field" })).toHaveValue(""); // Numeric field reset
        expect(screen.getByPlaceholderText("Enter value")).toHaveValue(""); // Numeric value cleared
      });
    });
  });

  describe("Initial Filters", () => {
    it("initializes state from initialFilters prop", () => {
      const initialFilters = [
        { field: "name", operator: "contains", value: "initial search" },
        { field: "age", operator: "gt", value: 50 },
        { field: "isActive", operator: "eq", value: true },
        { field: "createdAt", operator: "gte", value: "2024-01-01" },
        { field: "category", operator: "eq", value: "B" }, // Simple filter
      ];
      render(<FilterPanel {...defaultProps} initialFilters={initialFilters as any} fields={mockFields} />);

      // Check simple search term
      expect(screen.getByPlaceholderText("Search...")).toHaveValue("initial search");
      // Check simple filter chip
      expect(screen.getByText("Category: B")).toBeInTheDocument();
      // Check simple date range (should not be set from GTE/LTE unless it's the only date filter)
      expect(screen.getByTestId("datepicker-start date")).toHaveValue(""); // Simple date range not set by default from advanced

      // Open advanced modal to check advanced state
      fireEvent.click(screen.getByText("Advanced Filters"));

      // Check advanced search term and fields
      expect(screen.getByPlaceholderText("Search term...")).toHaveValue("initial search");
      expect(screen.getByLabelText("Name")).toBeChecked(); // 'name' is searchable

      // Check custom filters
      expect(screen.getAllByText("Remove filter")).toHaveLength(2); // age > 50, isActive = true
      // Check the first custom filter (age > 50)
      const ageFilter = screen.getAllByRole("combobox", { name: "Field" })[0];
      expect(ageFilter).toHaveValue("age");
      expect(screen.getAllByRole("combobox", { name: "Operator" })[0]).toHaveValue("gt");
      expect(screen.getAllByPlaceholderText("Enter value")[0]).toHaveValue("50");
      // Check the second custom filter (isActive = true)
      const activeFilter = screen.getAllByRole("combobox", { name: "Field" })[1];
      expect(activeFilter).toHaveValue("isActive");
      expect(screen.getAllByRole("combobox", { name: "Operator" })[1]).toHaveValue("eq");
      expect(screen.getAllByRole("combobox", { name: "Value" })[1]).toHaveValue("true");

      // Check date range filter
      expect(screen.getByRole("combobox", { name: "Field" })).toHaveValue("createdAt");
      expect(screen.getByTestId("datepicker-from")).toHaveValue("2024-01-01");
      expect(screen.getByTestId("datepicker-to")).toHaveValue(""); // Only GTE was provided
    });
  });

  describe("Applying and Clearing Filters", () => {
    it("calls onApplyFilters with combined filters from modal", async () => {
      const onApplyFilters = vi.fn();
      render(<FilterPanel {...defaultProps} enableAdvancedFilters fields={mockFields} onApplyFilters={onApplyFilters} />);
      fireEvent.click(screen.getByText("Advanced Filters")); // Open modal

      // Add a custom filter
      fireEvent.click(screen.getByText("Add Filter"));
      fireEvent.change(screen.getByRole("combobox", { name: "Field" }), { target: { value: "age" } });
      fireEvent.change(screen.getByRole("combobox", { name: "Operator" }), { target: { value: "lt" } });
      fireEvent.change(screen.getByPlaceholderText("Enter value"), { target: { value: "30" } });

      // Add a search filter
      fireEvent.change(screen.getByPlaceholderText("Search term..."), { target: { value: "test" } });
      fireEvent.click(screen.getByLabelText("Name"));

      // Add a date range filter
      fireEvent.change(screen.getByRole("combobox", { name: "Field" }), { target: { value: "createdAt" } });
      fireEvent.change(screen.getByTestId("datepicker-from"), { target: { value: "2023-01-01" } });

      // Click Apply Filters
      fireEvent.click(screen.getByText("Apply Filters"));

      // Expect onApplyFilters to be called with all filters
      await waitFor(() => {
        expect(onApplyFilters).toHaveBeenCalledWith([
          { field: "age", operator: "lt", value: 30 },
          { field: "name", operator: "contains", value: "test" },
          { field: "createdAt", operator: "gte", value: "2023-01-01" },
        ]);
      });
    });

    it("calls onClearFilters when Clear all button is clicked", async () => {
      const onClearFilters = vi.fn();
      render(<FilterPanel {...defaultProps} enableAdvancedFilters onClearFilters={onClearFilters} />);
      fireEvent.click(screen.getByText("Advanced Filters")); // Open modal

      // Add some filters to make the Clear all button visible
      fireEvent.click(screen.getByText("Add Filter"));
      fireEvent.click(screen.getByText("Apply Filters")); // Apply to make count > 0

      await waitFor(() => {
        expect(screen.getByText("Clear all")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Clear all"));

      // Expect onClearFilters to be called
      await waitFor(() => {
        expect(onClearFilters).toHaveBeenCalled();
      });

      // Expect filter count to be 0
      expect(screen.queryByText(/\d+/)).not.toBeInTheDocument();
    });

    it("calls onClearFilters when Clear All button in modal is clicked", async () => {
      const onClearFilters = vi.fn();
      render(<FilterPanel {...defaultProps} enableAdvancedFilters onClearFilters={onClearFilters} fields={mockFields} />);
      fireEvent.click(screen.getByText("Advanced Filters")); // Open modal

      // Add some filters
      fireEvent.click(screen.getByText("Add Filter"));
      fireEvent.change(screen.getByPlaceholderText("Search term..."), { target: { value: "test" } });

      // Click Clear All in modal
      fireEvent.click(screen.getByText("Clear All"));

      // Click Apply Filters in modal
      fireEvent.click(screen.getByText("Apply Filters"));

      // Expect onClearFilters to be called (because applying empty filters clears)
      await waitFor(() => {
        expect(onClearFilters).toHaveBeenCalled();
      });
    });
  });

  describe("Accessibility", () => {
    it("announces filter changes to screen reader", async () => {
      render(<FilterPanel {...defaultProps} enableQuickFilters fields={mockFields} />);
      fireEvent.click(screen.getByText("Quick Filters"));

      // Toggle simple filter
      fireEvent.click(screen.getByText("A"));
      await waitFor(() => {
        expect(mockAnnounce).toHaveBeenCalledWith("Added filter: Category is A", "polite");
      });

      // Toggle off simple filter
      fireEvent.click(screen.getByText("A"));
      await waitFor(() => {
        expect(mockAnnounce).toHaveBeenCalledWith("Removed filter: Category is A", "polite");
      });

      // Apply quick filters
      fireEvent.click(screen.getByText("Apply Filters"));
      await waitFor(() => {
        expect(mockAnnounce).toHaveBeenCalledWith("All quick filters cleared", "polite"); // Since no filters were active
      });

      // Clear all filters button
      fireEvent.change(screen.getByPlaceholderText("Search..."), { target: { value: "test" } });
      fireEvent.click(screen.getByText("Clear all"));
      await waitFor(() => {
        expect(mockAnnounce).toHaveBeenCalledWith("All filters cleared", "polite");
      });

      // Open advanced modal
      fireEvent.click(screen.getByText("Advanced Filters"));
      // Clear modal filters
      fireEvent.click(screen.getByText("Clear All"));
      await waitFor(() => {
        expect(mockAnnounce).toHaveBeenCalledWith("Modal filters cleared", "polite");
      });

      // Apply advanced filters
      fireEvent.click(screen.getByText("Add Filter"));
      fireEvent.click(screen.getByText("Apply Filters"));
      await waitFor(() => {
        expect(mockAnnounce).toHaveBeenCalledWith("Applied 1 advanced filters", "polite");
      });
    });
  });
});
