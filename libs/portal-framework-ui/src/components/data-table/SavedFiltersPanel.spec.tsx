import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { useAtom } from "jotai";
import { useNotification } from "@refinedev/core";

import { SavedFiltersPanel } from "./SavedFiltersPanel";
import { useScreenReaderAnnouncement } from "../screen-reader/hooks/useScreenReaderAnnouncement";

// --- Define Mock Variables and Implementations First ---

// Mock Refine hooks - Get the mocked function reference
const mockUseNotification = vi.mocked(useNotification);
const mockNotificationOpen = vi.fn();
mockUseNotification.mockReturnValue({ open: mockNotificationOpen });

// Mock Jotai atoms - Get the mocked function reference
const mockUseAtom = vi.mocked(useAtom);

const mockSavedFilters = vi.fn();
const mockSelectedFilter = vi.fn();
const mockGetResourceFilters = vi.fn();
const mockSaveFilter = vi.fn();
const mockUpdateFilter = vi.fn();
const mockDeleteFilter = vi.fn();
const mockApplyFilter = vi.fn();
const mockClearSelectedFilter = vi.fn();

mockUseAtom.mockImplementation((atom) => {
  if (atom.toString().includes("resourceFiltersAtom")) return [mockSavedFilters(), vi.fn()];
  if (atom.toString().includes("selectedFilterAtom")) return [mockSelectedFilter(), vi.fn()];
  if (atom.toString().includes("getResourceFiltersAtom")) return [null, mockGetResourceFilters];
  if (atom.toString().includes("saveFilterAtom")) return [null, mockSaveFilter];
  if (atom.toString().includes("updateFilterAtom")) return [null, mockUpdateFilter];
  if (atom.toString().includes("deleteFilterAtom")) return [null, mockDeleteFilter];
  if (atom.toString().includes("applyFilterAtom")) return [null, mockApplyFilter];
  if (atom.toString().includes("clearSelectedFilterAtom")) return [null, mockClearSelectedFilter];
  return [vi.fn(), vi.fn()]; // Default for other atoms if any
});

// Mock screen reader announcement hook
const mockUseScreenReaderAnnouncement = useScreenReaderAnnouncement as vi.Mock;
const mockAnnounce = vi.fn();
mockUseScreenReaderAnnouncement.mockReturnValue({ announce: mockAnnounce });

// --- Place vi.mock calls after variable/implementation definitions ---

// Mock Refine hooks
vi.mock("@refinedev/core", () => ({
  useNotification: vi.fn(),
}));

// Mock Jotai atoms
vi.mock("jotai", () => ({
  useAtom: vi.fn(), // Explicitly mock useAtom
}));

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
  Dialog: vi.fn(({ open, onOpenChange, children }) => (
    open ? <div data-testid="dialog">{children}</div> : null
  )),
  DialogClose: vi.fn(({ children }) => <button>{children}</button>),
  DialogContent: vi.fn(({ children }) => <div>{children}</div>),
  DialogFooter: vi.fn(({ children }) => <div>{children}</div>),
  DialogHeader: vi.fn(({ children }) => <div>{children}</div>),
  DialogTitle: vi.fn(({ children }) => <h3>{children}</h3>),
  DropdownMenu: vi.fn(({ children }) => <div>{children}</div>),
  DropdownMenuContent: vi.fn(({ children }) => <div>{children}</div>),
  DropdownMenuItem: vi.fn(({ children, onSelect, onClick }) => (
    <button onClick={onClick || (() => onSelect?.(new Event('select')))}>{children}</button>
  )),
  DropdownMenuSeparator: vi.fn(() => <hr />),
  DropdownMenuTrigger: vi.fn(({ children }) => <button>{children}</button>),
  Input: vi.fn(({ value, onChange, ...props }) => (
    <input value={value} onChange={(e) => onChange?.(e)} {...props} />
  )),
  Label: vi.fn(({ children, ...props }) => <label {...props}>{children}</label>),
  Tooltip: vi.fn(({ children }) => <div>{children}</div>),
  TooltipContent: vi.fn(({ children }) => <div>{children}</div>),
  TooltipProvider: vi.fn(({ children }) => <div>{children}</div>),
  TooltipTrigger: vi.fn(({ children }) => <span>{children}</span>),
}));

vi.mock("lucide-react", () => ({
  Bookmark: vi.fn(() => <svg data-testid="icon-bookmark" />),
  BookmarkPlus: vi.fn(() => <svg data-testid="icon-bookmark-plus" />),
  Check: vi.fn(() => <svg data-testid="icon-check" />),
  Filter: vi.fn(() => <svg data-testid="icon-filter" />),
  MoreHorizontal: vi.fn(() => <svg data-testid="icon-more-horizontal" />),
  Pencil: vi.fn(() => <svg data-testid="icon-pencil" />),
  Save: vi.fn(() => <svg data-testid="icon-save" />),
  Star: vi.fn(() => <svg data-testid="icon-star" />),
  Trash2: vi.fn(() => <svg data-testid="icon-trash" />),
  X: vi.fn(() => <svg data-testid="icon-x" />),
}));

// Mock ChevronDownIcon within the mock factory
vi.mock("./SavedFiltersPanel", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./SavedFiltersPanel")>();
  return {
    ...actual,
    // Provide a simple mock implementation for the icon
    ChevronDownIcon: vi.fn((props) => <svg data-testid="icon-chevron-down" {...props} />),
  };
});


describe("SavedFiltersPanel", () => {
  const defaultProps = {
    currentFilters: [],
    onApplyFilter: vi.fn(),
    onClearFilters: vi.fn(),
    resource: "posts",
  };

  beforeEach(() => {
    // Reset mocks and state before each test
    vi.clearAllMocks();
    mockSavedFilters.mockReturnValue([]);
    mockSelectedFilter.mockReturnValue(null);
    mockGetResourceFilters.mockClear();
    mockSaveFilter.mockClear();
    mockUpdateFilter.mockClear();
    mockDeleteFilter.mockClear();
    mockApplyFilter.mockClear();
    mockClearSelectedFilter.mockClear();
    mockAnnounce.mockClear();
    mockNotificationOpen.mockClear(); // Use the specific mock function
  });

  it("renders without crashing", () => {
    render(<SavedFiltersPanel {...defaultProps} />);
    // Basic check for a common element that should always be present if enabled
    expect(screen.getByText("Save Filter")).toBeInTheDocument();
  });

  it("does not render if enableSavedFilters is false", () => {
    const { container } = render(<SavedFiltersPanel {...defaultProps} enableSavedFilters={false} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("calls getResourceFilters on mount", () => {
    render(<SavedFiltersPanel {...defaultProps} />);
    expect(mockGetResourceFilters).toHaveBeenCalledWith("posts");
  });

  it("renders 'Save Filter' button", () => {
    render(<SavedFiltersPanel {...defaultProps} />);
    expect(screen.getByText("Save Filter")).toBeInTheDocument();
    expect(screen.getByTestId("icon-bookmark-plus")).toBeInTheDocument();
  });

  it("opens the create filter modal when 'Save Filter' is clicked", async () => {
    render(<SavedFiltersPanel {...defaultProps} />);
    fireEvent.click(screen.getByText("Save Filter"));

    await waitFor(() => {
      expect(screen.getByTestId("dialog")).toBeInTheDocument();
      expect(screen.getByText("Save Filter")).toBeInTheDocument(); // Modal title
      expect(screen.getByLabelText("Filter Name")).toBeInTheDocument();
      expect(screen.getByLabelText("Set as default filter")).toBeInTheDocument();
      expect(screen.getByText("Save")).toBeInTheDocument(); // Modal save button
      expect(screen.getByText("Cancel")).toBeInTheDocument(); // Modal cancel button
    });
  });

  it("pre-populates filter name in create modal based on searchTerm", async () => {
    render(<SavedFiltersPanel {...defaultProps} searchTerm="test search" />);
    fireEvent.click(screen.getByText("Save Filter"));

    await waitFor(() => {
      expect(screen.getByLabelText("Filter Name")).toHaveValue("Search: test search");
    });
  });

  it("pre-populates filter name in create modal based on simpleFilters", async () => {
    render(<SavedFiltersPanel {...defaultProps} simpleFilters={{ status: ["active", "pending"] }} />);
    fireEvent.click(screen.getByText("Save Filter"));

    await waitFor(() => {
      expect(screen.getByLabelText("Filter Name")).toHaveValue("status: active, pending");
    });
  });

  it("calls saveFilter atom when saving a new filter", async () => {
    render(<SavedFiltersPanel {...defaultProps} currentFilters={[{ field: "name", operator: "eq", value: "test" }]} />);
    fireEvent.click(screen.getByText("Save Filter"));

    await waitFor(() => {
      fireEvent.change(screen.getByLabelText("Filter Name"), { target: { value: "My New Filter" } });
      fireEvent.click(screen.getByLabelText("Set as default filter"));
    });

    fireEvent.click(screen.getByText("Save"));

    await waitFor(() => {
      expect(mockSaveFilter).toHaveBeenCalledWith({
        filters: [{ field: "name", operator: "eq", value: "test" }],
        isDefault: true,
        name: "My New Filter",
        resource: "posts",
      });
      expect(mockNotificationOpen).toHaveBeenCalledWith({
        description: 'Filter "My New Filter" has been saved',
        message: "Success",
        type: "success",
      });
      expect(mockAnnounce).toHaveBeenCalledWith('Filter "My New Filter" has been saved', "polite");
    });
  });

  it("shows error notification if filter name is empty when saving", async () => {
    render(<SavedFiltersPanel {...defaultProps} />);
    fireEvent.click(screen.getByText("Save Filter"));

    await waitFor(() => {
      fireEvent.click(screen.getByText("Save"));
    });

    await waitFor(() => {
      expect(mockNotificationOpen).toHaveBeenCalledWith({
        description: "Filter name cannot be empty",
        message: "Error",
        type: "error",
      });
      expect(mockSaveFilter).not.toHaveBeenCalled();
    });
  });

  it("renders 'Saved Filters' dropdown when there are saved filters", () => {
    mockSavedFilters.mockReturnValue([{ id: "1", name: "Filter 1", filters: [], createdAt: "", updatedAt: "" }]);
    render(<SavedFiltersPanel {...defaultProps} />);
    expect(screen.getByText("Saved Filters")).toBeInTheDocument();
    expect(screen.getByTestId("icon-chevron-down")).toBeInTheDocument();
  });

  it("does not render 'Saved Filters' dropdown when there are no saved filters", () => {
    mockSavedFilters.mockReturnValue([]);
    render(<SavedFiltersPanel {...defaultProps} />);
    expect(screen.queryByText("Saved Filters")).not.toBeInTheDocument();
  });

  it("renders saved filters in the dropdown", () => {
    const filters = [
      { id: "1", name: "Filter 1", filters: [], createdAt: "", updatedAt: "" },
      { id: "2", name: "Default Filter", filters: [], isDefault: true, createdAt: "", updatedAt: "" },
    ];
    mockSavedFilters.mockReturnValue(filters);
    render(<SavedFiltersPanel {...defaultProps} />);

    fireEvent.click(screen.getByText("Saved Filters")); // Open dropdown

    expect(screen.getByText("Filter 1")).toBeInTheDocument();
    expect(screen.getByText("Default Filter")).toBeInTheDocument();
    expect(screen.getByTestId("icon-star")).toBeInTheDocument(); // Check for default indicator
  });

  it("calls applyFilter atom and onApplyFilter when a saved filter is clicked", async () => {
    const filterToApply = { id: "1", name: "Filter 1", filters: [{ field: "status", operator: "eq", value: "active" }], createdAt: "", updatedAt: "" };
    mockSavedFilters.mockReturnValue([filterToApply]);
    mockApplyFilter.mockReturnValue(filterToApply.filters); // Simulate atom returning filters

    render(<SavedFiltersPanel {...defaultProps} />);
    fireEvent.click(screen.getByText("Saved Filters")); // Open dropdown
    fireEvent.click(screen.getByText("Filter 1")); // Click filter item

    await waitFor(() => {
      expect(mockApplyFilter).toHaveBeenCalledWith("1");
      expect(defaultProps.onApplyFilter).toHaveBeenCalledWith(filterToApply.filters);
      expect(mockAnnounce).toHaveBeenCalledWith("Applied saved filter: Filter 1", "polite");
    });
  });

  it("renders selected filter indicator", () => {
    const selected = { id: "1", name: "Selected Filter", filters: [], createdAt: "", updatedAt: "" };
    mockSelectedFilter.mockReturnValue(selected);
    render(<SavedFiltersPanel {...defaultProps} />);

    expect(screen.getByText("Selected Filter")).toBeInTheDocument();
    expect(screen.getByTestId("icon-bookmark")).toBeInTheDocument();
    expect(screen.getByLabelText("Clear filter")).toBeInTheDocument();
  });

  it("calls clearSelectedFilter atom and onClearFilters when 'Clear filter' is clicked", async () => {
    const selected = { id: "1", name: "Selected Filter", filters: [], createdAt: "", updatedAt: "" };
    mockSelectedFilter.mockReturnValue(selected);
    render(<SavedFiltersPanel {...defaultProps} />);

    fireEvent.click(screen.getByLabelText("Clear filter"));

    await waitFor(() => {
      expect(mockClearSelectedFilter).toHaveBeenCalled();
      expect(defaultProps.onClearFilters).toHaveBeenCalled();
      expect(mockAnnounce).toHaveBeenCalledWith("Cleared saved filter", "polite");
    });
  });

  it("renders 'Current filters active' indicator when current filters are present but no saved filter is selected", () => {
    render(<SavedFiltersPanel {...defaultProps} searchTerm="test" />);
    expect(screen.getByText("Current filters active")).toBeInTheDocument();
    expect(screen.getByTestId("icon-filter")).toBeInTheDocument();
    expect(screen.getByLabelText("Clear all filters")).toBeInTheDocument();
  });

  it("does not render 'Current filters active' indicator if no current filters and no selected filter", () => {
    render(<SavedFiltersPanel {...defaultProps} searchTerm="" simpleFilters={{}} simpleDateRange={{ field: "date" }} />);
    expect(screen.queryByText("Current filters active")).not.toBeInTheDocument();
  });

  it("calls clearAllFilters when 'Clear all filters' is clicked (if provided)", async () => {
    const mockClearAllFilters = vi.fn();
    render(<SavedFiltersPanel {...defaultProps} searchTerm="test" clearAllFilters={mockClearAllFilters} />);
    fireEvent.click(screen.getByLabelText("Clear all filters"));

    await waitFor(() => {
      expect(mockClearAllFilters).toHaveBeenCalled();
      expect(defaultProps.onClearFilters).not.toHaveBeenCalled(); // clearAllFilters takes precedence
      expect(mockAnnounce).toHaveBeenCalledWith("All filters cleared", "polite");
    });
  });

  it("falls back to onClearFilters when 'Clear all filters' is clicked (if clearAllFilters not provided)", async () => {
    render(<SavedFiltersPanel {...defaultProps} searchTerm="test" clearAllFilters={undefined} />);
    fireEvent.click(screen.getByLabelText("Clear all filters"));

    await waitFor(() => {
      expect(defaultProps.onClearFilters).toHaveBeenCalled();
      expect(mockAnnounce).toHaveBeenCalledWith("All filters cleared", "polite");
    });
  });


  it("renders 'Update' button when a filter is selected", () => {
    const selected = { id: "1", name: "Selected Filter", filters: [], createdAt: "", updatedAt: "" };
    mockSelectedFilter.mockReturnValue(selected);
    render(<SavedFiltersPanel {...defaultProps} />);
    expect(screen.getByText("Update")).toBeInTheDocument();
    expect(screen.getByTestId("icon-save")).toBeInTheDocument();
  });

  it("does not render 'Update' button when no filter is selected", () => {
    mockSelectedFilter.mockReturnValue(null);
    render(<SavedFiltersPanel {...defaultProps} />);
    expect(screen.queryByText("Update")).not.toBeInTheDocument();
  });

  it("calls updateFilter atom when 'Update' button is clicked (for selected filter)", async () => {
    const selected = { id: "1", name: "Selected Filter", filters: [{ field: "old", operator: "eq", value: "value" }], createdAt: "", updatedAt: "" };
    mockSelectedFilter.mockReturnValue(selected);
    const currentFilters = [{ field: "new", operator: "eq", value: "value" }];
    render(<SavedFiltersPanel {...defaultProps} currentFilters={currentFilters} />);

    fireEvent.click(screen.getByText("Update"));

    await waitFor(() => {
      expect(mockUpdateFilter).toHaveBeenCalledWith({
        filterId: "1",
        resource: "posts",
        updates: { filters: currentFilters },
      });
      expect(mockNotificationOpen).toHaveBeenCalledWith({
        description: 'Filter "Selected Filter" has been updated with current settings',
        message: "Success",
        type: "success",
      });
    });
  });

  it("opens the edit filter modal from the dropdown menu", async () => {
    const filterToEdit = { id: "1", name: "Filter to Edit", filters: [], isDefault: false, createdAt: "", updatedAt: "" };
    mockSavedFilters.mockReturnValue([filterToEdit]);
    render(<SavedFiltersPanel {...defaultProps} />);

    fireEvent.click(screen.getByText("Saved Filters")); // Open dropdown
    fireEvent.click(screen.getByTestId("icon-more-horizontal")); // Click options menu for the filter

    await waitFor(() => {
      fireEvent.click(screen.getByText("Edit")); // Click Edit option
    });

    await waitFor(() => {
      expect(screen.getByTestId("dialog")).toBeInTheDocument();
      expect(screen.getByText("Edit Filter")).toBeInTheDocument(); // Modal title
      expect(screen.getByLabelText("Filter Name")).toHaveValue("Filter to Edit");
      expect(screen.getByLabelText("Set as default filter")).not.toBeChecked();
      expect(screen.getByText("Update")).toBeInTheDocument(); // Modal update button
    });
  });

  it("calls updateFilter atom when updating a filter from the edit modal", async () => {
    const filterToEdit = { id: "1", name: "Filter to Edit", filters: [], isDefault: false, createdAt: "", updatedAt: "" };
    mockSavedFilters.mockReturnValue([filterToEdit]);
    render(<SavedFiltersPanel {...defaultProps} />);

    fireEvent.click(screen.getByText("Saved Filters"));
    fireEvent.click(screen.getByTestId("icon-more-horizontal"));
    await waitFor(() => fireEvent.click(screen.getByText("Edit")));

    await waitFor(() => {
      fireEvent.change(screen.getByLabelText("Filter Name"), { target: { value: "Edited Filter Name" } });
      fireEvent.click(screen.getByLabelText("Set as default filter"));
    });

    fireEvent.click(screen.getByText("Update")); // Modal update button

    await waitFor(() => {
      expect(mockUpdateFilter).toHaveBeenCalledWith({
        filterId: "1",
        resource: "posts",
        updates: { name: "Edited Filter Name", isDefault: true },
      });
      expect(mockNotificationOpen).toHaveBeenCalledWith({
        description: 'Filter "Edited Filter Name" has been updated',
        message: "Success",
        type: "success",
      });
    });
  });

  it("shows error notification if filter name is empty when updating", async () => {
    const filterToEdit = { id: "1", name: "Filter to Edit", filters: [], isDefault: false, createdAt: "", updatedAt: "" };
    mockSavedFilters.mockReturnValue([filterToEdit]);
    render(<SavedFiltersPanel {...defaultProps} />);

    fireEvent.click(screen.getByText("Saved Filters"));
    fireEvent.click(screen.getByTestId("icon-more-horizontal"));
    await waitFor(() => fireEvent.click(screen.getByText("Edit")));

    await waitFor(() => {
      fireEvent.change(screen.getByLabelText("Filter Name"), { target: { value: "" } });
    });

    fireEvent.click(screen.getByText("Update")); // Modal update button

    await waitFor(() => {
      expect(mockNotificationOpen).toHaveBeenCalledWith({
        description: "Filter name cannot be empty",
        message: "Error",
        type: "error",
      });
      expect(mockUpdateFilter).not.toHaveBeenCalled();
    });
  });


  it("calls deleteFilter atom when 'Delete' is clicked from the dropdown menu", async () => {
    const filterToDelete = { id: "1", name: "Filter to Delete", filters: [], createdAt: "", updatedAt: "" };
    mockSavedFilters.mockReturnValue([filterToDelete]);
    render(<SavedFiltersPanel {...defaultProps} />);

    fireEvent.click(screen.getByText("Saved Filters")); // Open dropdown
    fireEvent.click(screen.getByTestId("icon-more-horizontal")); // Click options menu for the filter

    await waitFor(() => {
      fireEvent.click(screen.getByText("Delete")); // Click Delete option
    });

    await waitFor(() => {
      expect(mockDeleteFilter).toHaveBeenCalledWith({
        filterId: "1",
        resource: "posts",
      });
      expect(mockNotificationOpen).toHaveBeenCalledWith({
        description: 'Filter "Filter to Delete" has been deleted',
        message: "Success",
        type: "success",
      });
      expect(mockAnnounce).toHaveBeenCalledWith('Filter "Filter to Delete" has been deleted', "polite");
    });
  });

  it("renders 'Combine with Current' option when current filters are active", () => {
    const savedFilter = { id: "1", name: "Saved Filter", filters: [], createdAt: "", updatedAt: "" };
    mockSavedFilters.mockReturnValue([savedFilter]);
    render(<SavedFiltersPanel {...defaultProps} searchTerm="test" />); // searchTerm makes current filters active

    fireEvent.click(screen.getByText("Saved Filters")); // Open dropdown
    fireEvent.click(screen.getByTestId("icon-more-horizontal")); // Click options menu for the filter

    expect(screen.getByText("Combine with Current")).toBeInTheDocument();
    expect(screen.getByTestId("icon-filter")).toBeInTheDocument(); // Icon for combine option
  });

  it("does not render 'Combine with Current' option when no current filters are active", () => {
    const savedFilter = { id: "1", name: "Saved Filter", filters: [], createdAt: "", updatedAt: "" };
    mockSavedFilters.mockReturnValue([savedFilter]);
    render(<SavedFiltersPanel {...defaultProps} searchTerm="" simpleFilters={{}} simpleDateRange={{ field: "date" }} />); // No current filters

    fireEvent.click(screen.getByText("Saved Filters")); // Open dropdown
    fireEvent.click(screen.getByTestId("icon-more-horizontal")); // Click options menu for the filter

    expect(screen.queryByText("Combine with Current")).not.toBeInTheDocument();
  });

  it("calls onApplyFilters with combined filters when 'Combine with Current' is clicked", async () => {
    const savedFilter = { id: "1", name: "Saved Filter", filters: [{ field: "saved", operator: "eq", value: "value" }], createdAt: "", updatedAt: "" };
    mockSavedFilters.mockReturnValue([savedFilter]);
    const activeFilters = [{ field: "active", operator: "eq", value: "value" }];
    const mockOnApplyFilters = vi.fn();

    render(<SavedFiltersPanel {...defaultProps} activeFilters={activeFilters} onApplyFilters={mockOnApplyFilters} searchTerm="test" />); // searchTerm makes current filters active

    fireEvent.click(screen.getByText("Saved Filters")); // Open dropdown
    fireEvent.click(screen.getByTestId("icon-more-horizontal")); // Click options menu for the filter
    await waitFor(() => fireEvent.click(screen.getByText("Combine with Current"))); // Click Combine option

    await waitFor(() => {
      expect(mockOnApplyFilters).toHaveBeenCalledWith([
        { field: "saved", operator: "eq", value: "value" },
        { field: "active", operator: "eq", value: "value" },
      ]);
      expect(mockAnnounce).toHaveBeenCalledWith("Applied saved filter: Saved Filter combined with current filters", "polite");
    });
  });

  it("falls back to handleApplyFilter if onApplyFilters is not provided when 'Combine with Current' is clicked", async () => {
    const savedFilter = { id: "1", name: "Saved Filter", filters: [{ field: "saved", operator: "eq", value: "value" }], createdAt: "", updatedAt: "" };
    mockSavedFilters.mockReturnValue([savedFilter]);
    const activeFilters = [{ field: "active", operator: "eq", value: "value" }];
    mockApplyFilter.mockReturnValue(savedFilter.filters); // Simulate atom returning filters

    render(<SavedFiltersPanel {...defaultProps} activeFilters={activeFilters} onApplyFilters={undefined} searchTerm="test" />); // searchTerm makes current filters active

    fireEvent.click(screen.getByText("Saved Filters")); // Open dropdown
    fireEvent.click(screen.getByTestId("icon-more-horizontal")); // Click options menu for the filter
    await waitFor(() => fireEvent.click(screen.getByText("Combine with Current"))); // Click Combine option

    await waitFor(() => {
      expect(mockApplyFilter).toHaveBeenCalledWith("1"); // Should call the regular apply
      expect(defaultProps.onApplyFilter).toHaveBeenCalledWith(savedFilter.filters); // Should call the regular onApplyFilter
      expect(mockAnnounce).toHaveBeenCalledWith("Applied saved filter: Saved Filter", "polite"); // Should announce regular apply
    });
  });
});
