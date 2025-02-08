import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import React from "react";

import { TableToolbar } from "./TableToolbar";
import { useScreenReaderAnnouncement } from "../screen-reader/hooks/useScreenReaderAnnouncement";

// Mock dependencies
vi.mock("../screen-reader/hooks/useScreenReaderAnnouncement", () => ({
  useScreenReaderAnnouncement: vi.fn(() => ({
    announce: vi.fn(),
  })),
}));

vi.mock("./ShortcutHelp", () => ({
  ShortcutHelp: vi.fn(() => <div>Mocked ShortcutHelp</div>),
}));

// Mock the UI components from @lumeweb/portal-framework-ui-core
vi.mock("@lumeweb/portal-framework-ui-core", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@lumeweb/portal-framework-ui-core")>();
  return {
    ...actual,
    Button: vi.fn(({ children, onClick, disabled, className, ...props }) => (
      <button
        onClick={onClick}
        disabled={disabled}
        className={className}
        {...props}>
        {children}
      </button>
    )),
    DropdownMenu: vi.fn(({ children }) => <div>{children}</div>),
    DropdownMenuTrigger: vi.fn(({ children }) => (
      <div data-testid="dropdown-trigger">{children}</div>
    )),
    DropdownMenuContent: vi.fn(({ children }) => (
      <div data-testid="dropdown-content">{children}</div>
    )),
    DropdownMenuItem: vi.fn(({ children, onClick }) => (
      <div onClick={onClick}>{children}</div>
    )),
    DropdownMenuLabel: vi.fn(({ children }) => <div>{children}</div>),
    DropdownMenuSeparator: vi.fn(() => <hr />),
    DropdownMenuRadioGroup: vi.fn(({ children, onValueChange, value }) => (
      <div
        role="group" // Added role="group"
        onChange={(e) => onValueChange((e.target as HTMLInputElement).value)}
        data-value={value}>
        {children}
      </div>
    )),
    DropdownMenuRadioItem: vi.fn(({ children, value }) => (
      <label>
        <input type="radio" value={value} name="radio-group" />
        {children}
      </label>
    )),
    TooltipProvider: vi.fn(({ children }) => <div>{children}</div>),
    Tooltip: vi.fn(({ children }) => <div>{children}</div>),
    TooltipTrigger: vi.fn(({ children }) => (
      <div data-testid="tooltip-trigger">{children}</div>
    )),
    TooltipContent: vi.fn(({ children }) => (
      <div data-testid="tooltip-content">{children}</div>
    )),
    cn: vi.fn((...classes) => classes.join(" ")), // Simple cn mock
  };
});

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
  FileDown: () => <span>Export Icon</span>,
  FileText: () => <span>Format Icon</span>,
  Keyboard: () => <span>Keyboard Icon</span>,
  Monitor: () => <span>Density Icon</span>,
  RefreshCw: () => <span>Loading Icon</span>,
  X: () => <span>Clear Icon</span>,
}));

describe("TableToolbar", () => {
  const mockOnDensityChange = vi.fn();
  const mockOnExport = vi.fn();
  const mockOnClearSelection = vi.fn();
  const mockToggleShortcutHelp = vi.fn();
  const mockBulkActionClick = vi.fn();

  const defaultProps = {
    density: "default" as const,
    enableExport: false,
    enableKeyboardShortcuts: false,
    isExporting: false,
    isLoading: false,
    onDensityChange: mockOnDensityChange,
    onExport: mockOnExport,
    onClearSelection: mockOnClearSelection, // Added missing prop
    selectedRows: [],
    showDensityToggle: false,
    showKeyboardShortcutCheatSheet: false,
    showShortcutHelp: false,
    toggleShortcutHelp: mockToggleShortcutHelp,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    cleanup(); // Clean up the DOM after each test
  });

  // Helper function to render the component
  const renderComponent = (props = {}) => {
    return render(<TableToolbar {...defaultProps} {...props} />);
  };

  // GIVEN: The TableToolbar is rendered
  // WHEN: No specific features are enabled
  // THEN: Only the children prop should be rendered
  it("should render only children when no features are enabled", () => {
    // GIVEN: Default props (all features disabled)
    // WHEN: Component is rendered with children
    renderComponent({ children: <span>Custom Content</span> });

    // THEN: The custom content should be visible
    expect(screen.getByText("Custom Content")).toBeInTheDocument();
    // AND: Density toggle should not be visible
    expect(screen.queryByText("Density")).not.toBeInTheDocument();
    // AND: Shortcut help button should not be visible
    expect(screen.queryByText("Show Shortcuts")).not.toBeInTheDocument();
    // AND: Export button should not be visible
    expect(screen.queryByText("Export")).not.toBeInTheDocument();
    // AND: Bulk actions toolbar should not be visible
    expect(screen.queryByText(/row selected/)).not.toBeInTheDocument();
  });

  // GIVEN: The TableToolbar is rendered
  // WHEN: showDensityToggle is true
  // THEN: The Density toggle button should be visible
  it("should show density toggle button when showDensityToggle is true", () => {
    // GIVEN: showDensityToggle is true
    // WHEN: Component is rendered
    renderComponent({ showDensityToggle: true });

    // THEN: The Density button should be visible
    expect(screen.getByText("Density")).toBeInTheDocument();
  });

  // GIVEN: The TableToolbar is rendered with density toggle enabled
  // WHEN: The user changes the density via the dropdown
  // THEN: The onDensityChange prop should be called and an announcement made
  it("should call onDensityChange and announce when density is changed", () => {
    // GIVEN: showDensityToggle is true
    renderComponent({ showDensityToggle: true });
    const densityTrigger = screen.getByText("Density");

    // WHEN: User clicks the trigger and selects 'Compact'
    fireEvent.click(densityTrigger); // Simulate opening dropdown (mock doesn't fully simulate this)
    // Simulate selecting a radio item by clicking the radio input
    const compactRadio = screen.getByLabelText("Compact");
    fireEvent.click(compactRadio);

    // THEN: onDensityChange should be called with 'compact'
    expect(mockOnDensityChange).toHaveBeenCalledWith("compact");
    // AND: An announcement should be made
    const announceMockInstance =
      vi.mocked(useScreenReaderAnnouncement).mock.results[0].value.announce;
    expect(announceMockInstance).toHaveBeenCalledWith(
      "Table density set to compact",
      "polite",
    );
  });

  // GIVEN: The TableToolbar is rendered
  // WHEN: showShortcutHelp and enableKeyboardShortcuts are true
  // THEN: The Shortcut Help button should be visible
  it("should show shortcut help button when showShortcutHelp and enableKeyboardShortcuts are true", () => {
    // GIVEN: showShortcutHelp and enableKeyboardShortcuts are true
    // WHEN: Component is rendered
    renderComponent({ showShortcutHelp: true, enableKeyboardShortcuts: true });

    // THEN: The "Show Shortcuts" button should be visible
    expect(screen.getByText("Show Shortcuts")).toBeInTheDocument();
  });

  // GIVEN: The TableToolbar is rendered with shortcut help enabled
  // WHEN: The user clicks the Shortcut Help button
  // THEN: The toggleShortcutHelp prop should be called
  it("should call toggleShortcutHelp when shortcut help button is clicked", () => {
    // GIVEN: showShortcutHelp and enableKeyboardShortcuts are true
    renderComponent({ showShortcutHelp: true, enableKeyboardShortcuts: true });
    const shortcutButton = screen.getByText("Show Shortcuts");

    // WHEN: The button is clicked
    fireEvent.click(shortcutButton);

    // THEN: toggleShortcutHelp should be called
    expect(mockToggleShortcutHelp).toHaveBeenCalled();
  });

  // GIVEN: The TableToolbar is rendered with shortcut help enabled and cheat sheet shown
  // WHEN: showKeyboardShortcutCheatSheet is true
  // THEN: The ShortcutHelp component should be rendered
  it("should render ShortcutHelp component when showKeyboardShortcutCheatSheet and showShortcutHelp are true", () => {
    // GIVEN: showShortcutHelp and showKeyboardShortcutCheatSheet are true
    // WHEN: Component is rendered
    renderComponent({
      showShortcutHelp: true,
      showKeyboardShortcutCheatSheet: true,
    });

    // THEN: The mocked ShortcutHelp component should be visible
    expect(screen.getByText("Mocked ShortcutHelp")).toBeInTheDocument();
  });

  // GIVEN: The TableToolbar is rendered
  // WHEN: enableExport is true
  // THEN: The Export button should be visible
  it("should show export button when enableExport is true", () => {
    // GIVEN: enableExport is true
    // WHEN: Component is rendered
    renderComponent({ enableExport: true });

    // THEN: The Export button should be visible
    expect(screen.getByText("Export")).toBeInTheDocument();
  });

  // GIVEN: The TableToolbar is rendered with export enabled
  // WHEN: The user selects an export format from the dropdown
  // THEN: The onExport prop should be called with the selected format
  it("should call onExport when an export format is selected", () => {
    // GIVEN: enableExport is true and exportFormats are specified
    renderComponent({ enableExport: true, exportFormats: ["csv", "pdf"] });
    const exportTrigger = screen.getByText("Export");

    // WHEN: User clicks the trigger and selects 'Export as PDF'
    fireEvent.click(exportTrigger); // Simulate opening dropdown
    const pdfMenuItem = screen.getByText("Export as PDF");
    fireEvent.click(pdfMenuItem);

    // THEN: onExport should be called with 'pdf'
    expect(mockOnExport).toHaveBeenCalledWith("pdf");
  });

  // GIVEN: The TableToolbar is rendered with export enabled
  // WHEN: isExporting is true
  // THEN: The Export button should show a loading indicator and be disabled
  it("should show loading indicator and disable export button when isExporting is true", () => {
    // GIVEN: enableExport is true and isExporting is true
    // WHEN: Component is rendered
    renderComponent({ enableExport: true, isExporting: true });

    // THEN: The Export button should be disabled
    const exportButton = screen.getByText("Export").closest("button");
    expect(exportButton).toBeDisabled();
    // AND: The loading icon should be visible (mocked as "Loading Icon")
    expect(screen.getByText("Loading Icon")).toBeInTheDocument();
    // AND: The regular export icon should not be visible
    expect(screen.queryByText("Export Icon")).not.toBeInTheDocument();
  });

  // GIVEN: The TableToolbar is rendered
  // WHEN: selectedRows is not empty and bulkActions are provided
  // THEN: The bulk actions toolbar should be visible
  it("should show bulk actions toolbar when rows are selected and actions are provided", () => {
    // GIVEN: selectedRows has items and bulkActions are provided
    const selectedRows = [{ id: 1 }, { id: 2 }];
    const bulkActions = [{ label: "Delete", onClick: mockBulkActionClick }];
    // WHEN: Component is rendered
    renderComponent({
      selectedRows,
      bulkActions,
      onClearSelection: mockOnClearSelection,
    });

    // THEN: The bulk actions toolbar should be visible
    expect(screen.getByText("2 rows selected")).toBeInTheDocument();
    // AND: The bulk action button should be visible
    expect(screen.getByText("Delete")).toBeInTheDocument();
    // AND: The Clear selection button should be visible
    expect(screen.getByText("Clear")).toBeInTheDocument();
  });

  // GIVEN: The bulk actions toolbar is visible
  // WHEN: A bulk action button is clicked
  // THEN: The corresponding onClick function should be called with the selected rows
  it("should call the bulk action onClick with selected rows when clicked", () => {
    // GIVEN: Bulk actions toolbar is visible with a "Delete" action
    const selectedRows = [{ id: 1 }, { id: 2 }];
    const bulkActions = [{ label: "Delete", onClick: mockBulkActionClick }];
    renderComponent({ selectedRows, bulkActions });
    const deleteButton = screen.getByText("Delete");

    // WHEN: The "Delete" button is clicked
    fireEvent.click(deleteButton);

    // THEN: The mockBulkActionClick should be called with the selected rows
    expect(mockBulkActionClick).toHaveBeenCalledWith(selectedRows);
  });

  // GIVEN: The bulk actions toolbar is visible
  // WHEN: The "Clear" button is clicked
  // THEN: The onClearSelection prop should be called
  it("should call onClearSelection when the Clear button is clicked", () => {
    // GIVEN: Bulk actions toolbar is visible with a "Clear" button
    const selectedRows = [{ id: 1 }];
    const bulkActions = [{ label: "Action", onClick: vi.fn() }];
    renderComponent({
      selectedRows,
      bulkActions,
      onClearSelection: mockOnClearSelection,
    });
    const clearButton = screen.getByText("Clear");

    // WHEN: The "Clear" button is clicked
    fireEvent.click(clearButton);

    // THEN: onClearSelection should be called
    expect(mockOnClearSelection).toHaveBeenCalled();
  });

  // GIVEN: The TableToolbar is rendered
  // WHEN: selectedRows is empty
  // THEN: The bulk actions toolbar should not be visible
  it("should not show bulk actions toolbar when no rows are selected", () => {
    // GIVEN: selectedRows is empty
    const selectedRows: any[] = [];
    const bulkActions = [{ label: "Delete", onClick: mockBulkActionClick }];
    // WHEN: Component is rendered
    renderComponent({
      selectedRows,
      bulkActions,
      onClearSelection: mockOnClearSelection,
    });

    // THEN: The bulk actions toolbar should not be visible
    expect(screen.queryByText(/row selected/)).not.toBeInTheDocument();
  });

  // GIVEN: The TableToolbar is rendered
  // WHEN: bulkActions is empty
  // THEN: The bulk actions toolbar should not be visible even if rows are selected
  it("should not show bulk actions toolbar when no bulk actions are provided", () => {
    // GIVEN: selectedRows has items but bulkActions is empty
    const selectedRows = [{ id: 1 }];
    const bulkActions: any[] = [];
    // WHEN: Component is rendered
    renderComponent({
      selectedRows,
      bulkActions,
      onClearSelection: mockOnClearSelection,
    });

    // THEN: The bulk actions toolbar should not be visible
    expect(screen.queryByText(/row selected/)).not.toBeInTheDocument();
  });
});
