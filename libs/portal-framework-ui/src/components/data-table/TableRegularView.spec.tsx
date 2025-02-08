import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";

import { TableRegularView } from "./TableRegularView";
import { EmptyState } from "./EmptyState";
import { ColumnFilter } from "./ColumnFilter";

// Mock dependencies
vi.mock("./EmptyState", () => ({
  EmptyState: vi.fn(({ title, description, type }) => (
    <div>
      Mocked EmptyState: {title} - {description} - {type}
    </div>
  )),
}));

vi.mock("./ColumnFilter", () => ({
  ColumnFilter: vi.fn(({ columnId, onApplyFilter, hasActiveFilter }) => (
    <div data-testid={`column-filter-${columnId}`} data-has-active-filter={hasActiveFilter}>
      Mocked ColumnFilter for {columnId}
      <button onClick={() => onApplyFilter({ field: columnId, operator: "eq", value: "test" })}>Apply Filter</button>
      <button onClick={() => onApplyFilter(null)}>Clear Filter</button>
    </div>
  )),
}));

// Mock the UI components from @lumeweb/portal-framework-ui-core
vi.mock("@lumeweb/portal-framework-ui-core", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@lumeweb/portal-framework-ui-core")>();
  return {
    ...actual,
    Table: vi.fn(({ children, ...props }) => <table {...props}>{children}</table>),
    TableHeader: vi.fn(({ children }) => <thead>{children}</thead>),
    TableBody: vi.fn(({ children }) => <tbody>{children}</tbody>),
    TableRow: vi.fn(({ children, className, style, ...props }) => (
      <tr className={className} style={style} {...props}>
        {children}
      </tr>
    )),
    TableHead: vi.fn(({ children, className, ...props }) => (
      <th className={className} {...props}>
        {children}
      </th>
    )),
    TableCell: vi.fn(({ children, className, colSpan, ...props }) => (
      <td className={className} colSpan={colSpan} {...props}>
        {children}
      </td>
    )),
    cn: vi.fn((...classes) => classes.join(" ")), // Simple cn mock
  };
});

// Mock @tanstack/react-table's flexRender
vi.mock("@tanstack/react-table", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-table")>();
  return {
    ...actual,
    flexRender: vi.fn((content) => content), // Simply render the content directly
  };
});

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
  GripVertical: () => <span>Drag Handle</span>,
  RefreshCw: () => <span>Loading Icon</span>,
}));

describe("TableRegularView", () => {
  const mockHandleApplyColumnFilter = vi.fn();
  const mockOnColumnReorder = vi.fn();
  const mockRenderCellContent = vi.fn((cell) => `Cell: ${cell.id}`);
  const mockRenderEmptyState = vi.fn(() => <div>Default Empty State</div>);
  const mockRenderExpandedRow = vi.fn((row) => <div>Expanded: {row.id}</div>);
  const mockRenderHoverActions = vi.fn(() => <div>Hover Actions</div>);
  const mockGetCellStyle = vi.fn(() => "");
  const mockGetRowHighlightClass = vi.fn(() => "");
  const mockGetRowAnimationClass = vi.fn(() => "");
  const mockGetRowAnimationStyle = vi.fn(() => ({}));

  // Mock TanStack Table structure
  const mockHeaderGroups = [
    {
      id: "headerGroup1",
      headers: [
        {
          id: "col1",
          isPlaceholder: false,
          column: {
            id: "col1",
            columnDef: { header: "Column 1", meta: { type: "string" } },
            getCanFilter: vi.fn(() => true),
          },
          getContext: vi.fn(() => ({})),
        },
        {
          id: "col2",
          isPlaceholder: false,
          column: {
            id: "col2",
            columnDef: { header: "Column 2", meta: { type: "number" } },
            getCanFilter: vi.fn(() => true),
          },
          getContext: vi.fn(() => ({})),
        },
        {
          id: "actions", // Special column ID
          isPlaceholder: false,
          column: {
            id: "actions",
            columnDef: { header: "Actions" },
            getCanFilter: vi.fn(() => false),
          },
          getContext: vi.fn(() => ({})),
        },
      ],
    },
  ];

  const mockTableData = [{ id: 1, col1: "data1", col2: 10 }];
  const mockRowModel = {
    rows: mockTableData.map((item) => ({
      id: item.id.toString(),
      original: item,
      getVisibleCells: vi.fn(() => [
        { id: `cell-${item.id}-col1`, column: { id: "col1" }, getContext: vi.fn(() => ({})), },
        { id: `cell-${item.id}-col2`, column: { id: "col2" }, getContext: vi.fn(() => ({})), },
        { id: `cell-${item.id}-actions`, column: { id: "actions" }, getContext: vi.fn(() => ({})), },
      ]),
      getIsSelected: vi.fn(() => false),
    })),
  };

  const defaultProps = {
    activeColumnFilters: {},
    densityStyles: { row: "default-row-density" },
    emptyState: undefined,
    enableColumnFilters: false,
    enableColumnReordering: false,
    enableExpandableRows: false,
    enableHoverActions: false,
    enableKeyboardNavigation: false,
    errorState: undefined,
    expanded: {},
    getCellStyle: mockGetCellStyle,
    getHeaderGroups: vi.fn(() => mockHeaderGroups),
    getRowAnimationClass: mockGetRowAnimationClass,
    getRowAnimationStyle: mockGetRowAnimationStyle,
    getRowHighlightClass: mockGetRowHighlightClass,
    getRowModel: vi.fn(() => mockRowModel),
    handleApplyColumnFilter: mockHandleApplyColumnFilter,
    hoverActionsPosition: "end" as const,
    isDataError: false,
    isDataLoading: false,
    onColumnReorder: mockOnColumnReorder,
    renderCellContent: mockRenderCellContent,
    renderEmptyState: mockRenderEmptyState,
    renderExpandedRow: undefined,
    renderHoverActions: undefined,
    tableColumns: mockHeaderGroups[0].headers.map(h => h.column), // Simplified column list
    tableData: mockTableData,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mocks that return data/elements
    defaultProps.getHeaderGroups.mockReturnValue(mockHeaderGroups);
    defaultProps.getRowModel.mockReturnValue(mockRowModel);
    mockRenderCellContent.mockImplementation((cell) => `Cell: ${cell.id}`);
    mockRenderEmptyState.mockImplementation(() => <div>Default Empty State</div>);
    mockRenderExpandedRow.mockImplementation((row) => <div>Expanded: {row.id}</div>);
    mockRenderHoverActions.mockImplementation(() => <div>Hover Actions</div>);
    mockGetCellStyle.mockImplementation(() => "");
    mockGetRowHighlightClass.mockImplementation(() => "");
    mockGetRowAnimationClass.mockImplementation(() => "");
    mockGetRowAnimationStyle.mockImplementation(() => ({}));
  });

  afterEach(() => {
    cleanup();
  });

  // Helper function to render the component
  const renderComponent = (props = {}) => {
    return render(<TableRegularView {...defaultProps} {...props} />);
  };

  // GIVEN: The TableRegularView is rendered
  // WHEN: isDataLoading is true
  // THEN: It should display the loading state
  it("should display loading state when isDataLoading is true", () => {
    // GIVEN: isDataLoading is true
    // WHEN: Component is rendered
    renderComponent({ isDataLoading: true });

    // THEN: The loading indicator text should be visible
    expect(screen.getByText("Loading...")).toBeInTheDocument();
    // AND: No table rows should be rendered from getRowModel
    expect(screen.queryByText("Cell:")).not.toBeInTheDocument();
  });

  // GIVEN: The TableRegularView is rendered
  // WHEN: isDataError is true
  // THEN: It should display the error state
  it("should display error state when isDataError is true", () => {
    // GIVEN: isDataError is true
    // WHEN: Component is rendered
    renderComponent({ isDataError: true });

    // THEN: The default error EmptyState should be visible
    expect(screen.getByText("Mocked EmptyState: Error loading data - There was an error loading the data. Please try again. - error")).toBeInTheDocument();
    // AND: No table rows should be rendered
    expect(screen.queryByText("Cell:")).not.toBeInTheDocument();
  });

  // GIVEN: The TableRegularView is rendered
  // WHEN: isDataError is true and a custom errorState is provided
  // THEN: It should display the custom error state
  it("should display custom error state when isDataError is true and errorState is provided", () => {
    // GIVEN: isDataError is true and a custom errorState is provided
    const customErrorState = <div>Custom Error Message</div>;
    // WHEN: Component is rendered
    renderComponent({ isDataError: true, errorState: customErrorState });

    // THEN: The custom error state should be visible
    expect(screen.getByText("Custom Error Message")).toBeInTheDocument();
    // AND: The default error EmptyState should not be visible
    expect(screen.queryByText("Mocked EmptyState: Error loading data")).not.toBeInTheDocument();
  });

  // GIVEN: The TableRegularView is rendered
  // WHEN: tableData is empty and not loading or in error
  // THEN: It should display the empty state
  it("should display empty state when tableData is empty and not loading or error", () => {
    // GIVEN: tableData is empty, isDataLoading is false, isDataError is false
    defaultProps.getRowModel.mockReturnValue({ rows: [] }); // Ensure rowModel is also empty
    // WHEN: Component is rendered
    renderComponent({ tableData: [] });

    // THEN: The default empty state rendered by renderEmptyState should be visible
    expect(screen.getByText("Default Empty State")).toBeInTheDocument();
    // AND: No table rows should be rendered
    expect(screen.queryByText("Cell:")).not.toBeInTheDocument();
  });

  // GIVEN: The TableRegularView is rendered
  // WHEN: tableData is empty and not loading or in error, and a custom emptyState is provided
  // THEN: It should display the custom empty state
  it("should display custom empty state when tableData is empty and emptyState is provided", () => {
    // GIVEN: tableData is empty, isDataLoading is false, isDataError is false, and custom emptyState is provided
    defaultProps.getRowModel.mockReturnValue({ rows: [] });
    const customEmptyState = <div>No Data Available</div>;
    // WHEN: Component is rendered
    renderComponent({ tableData: [], emptyState: customEmptyState });

    // THEN: The custom empty state should be visible
    expect(screen.getByText("No Data Available")).toBeInTheDocument();
  });

  // GIVEN: The TableRegularView is rendered
  // WHEN: tableData is not empty and not loading or in error
  // THEN: It should render the table headers and rows
  it("should render table headers and rows when data is present", () => {
    // GIVEN: tableData has items, isDataLoading is false, isDataError is false
    // WHEN: Component is rendered
    renderComponent();

    // THEN: Table headers should be visible
    expect(screen.getByText("Column 1")).toBeInTheDocument();
    expect(screen.getByText("Column 2")).toBeInTheDocument();
    expect(screen.getByText("Actions")).toBeInTheDocument();
    // AND: Table cells should be rendered using renderCellContent
    expect(screen.getByText("Cell: cell-1-col1")).toBeInTheDocument();
    expect(screen.getByText("Cell: cell-1-col2")).toBeInTheDocument();
    expect(screen.getByText("Cell: cell-1-actions")).toBeInTheDocument();
    // AND: Loading/Error/Empty states should not be visible
    expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    expect(screen.queryByText(/Mocked EmptyState/)).not.toBeInTheDocument();
    expect(screen.queryByText("Default Empty State")).not.toBeInTheDocument();
  });

  // GIVEN: The TableRegularView is rendered
  // WHEN: enableColumnFilters is true and a column is filterable
  // THEN: The ColumnFilter component should be rendered for that column
  it("should render ColumnFilter for filterable columns when enableColumnFilters is true", () => {
    // GIVEN: enableColumnFilters is true, and columns 'col1' and 'col2' are filterable in mockHeaderGroups
    // WHEN: Component is rendered
    renderComponent({ enableColumnFilters: true });

    // THEN: ColumnFilter should be rendered for 'col1'
    expect(screen.getByTestId("column-filter-col1")).toBeInTheDocument();
    // AND: ColumnFilter should be rendered for 'col2'
    expect(screen.getByTestId("column-filter-col2")).toBeInTheDocument();
    // AND: ColumnFilter should NOT be rendered for 'actions' (which is not filterable)
    expect(screen.queryByTestId("column-filter-actions")).not.toBeInTheDocument();
  });

  // GIVEN: The TableRegularView is rendered with column filters enabled
  // WHEN: A filter is applied via the ColumnFilter component
  // THEN: The handleApplyColumnFilter prop should be called
  it("should call handleApplyColumnFilter when a filter is applied via ColumnFilter", () => {
    // GIVEN: enableColumnFilters is true
    renderComponent({ enableColumnFilters: true });
    const applyFilterButton = screen.getByTestId("column-filter-col1").querySelector("button:first-of-type");

    // WHEN: The "Apply Filter" button inside the mocked ColumnFilter is clicked
    fireEvent.click(applyFilterButton!);

    // THEN: handleApplyColumnFilter should be called with the column ID and filter object
    expect(mockHandleApplyColumnFilter).toHaveBeenCalledWith("col1", { field: "col1", operator: "eq", value: "test" });
  });

  // GIVEN: The TableRegularView is rendered with column filters enabled
  // WHEN: A filter is cleared via the ColumnFilter component
  // THEN: The handleApplyColumnFilter prop should be called with null
  it("should call handleApplyColumnFilter with null when a filter is cleared via ColumnFilter", () => {
    // GIVEN: enableColumnFilters is true
    renderComponent({ enableColumnFilters: true });
    const clearFilterButton = screen.getByTestId("column-filter-col1").querySelector("button:last-of-type");

    // WHEN: The "Clear Filter" button inside the mocked ColumnFilter is clicked
    fireEvent.click(clearFilterButton!);

    // THEN: handleApplyColumnFilter should be called with the column ID and null
    expect(mockHandleApplyColumnFilter).toHaveBeenCalledWith("col1", null);
  });

  // GIVEN: The TableRegularView is rendered
  // WHEN: enableColumnReordering is true
  // THEN: Filterable columns should be draggable and show the drag handle
  it("should make filterable columns draggable and show drag handle when enableColumnReordering is true", () => {
    // GIVEN: enableColumnReordering is true
    // WHEN: Component is rendered
    renderComponent({ enableColumnReordering: true });

    // THEN: 'Column 1' header should be draggable and show drag handle
    const col1Header = screen.getByText("Column 1").closest("th");
    expect(col1Header).toHaveAttribute("draggable", "true");
    expect(col1Header).toHaveTextContent("Drag Handle");

    // AND: 'Column 2' header should be draggable and show drag handle
    const col2Header = screen.getByText("Column 2").closest("th");
    expect(col2Header).toHaveAttribute("draggable", "true");
    expect(col2Header).toHaveTextContent("Drag Handle");

    // AND: 'Actions' header should NOT be draggable and NOT show drag handle
    const actionsHeader = screen.getByText("Actions").closest("th");
    expect(actionsHeader).toHaveAttribute("draggable", "false");
    expect(actionsHeader).not.toHaveTextContent("Drag Handle"); // Assuming Drag Handle is only added if draggable
  });

  // GIVEN: The TableRegularView is rendered with column reordering enabled
  // WHEN: A draggable column header is dragged over another draggable column header and dropped
  // THEN: The onColumnReorder prop should be called
  it("should call onColumnReorder when a draggable column is dropped onto another", () => {
    // GIVEN: enableColumnReordering is true
    renderComponent({ enableColumnReordering: true });
    const col1Header = screen.getByText("Column 1").closest("th")!;
    const col2Header = screen.getByText("Column 2").closest("th")!;

    // WHEN: Drag starts on col1, drags over col2, and drops on col2
    fireEvent.dragStart(col1Header, { dataTransfer: { setData: vi.fn(), effectAllowed: "move" } });
    fireEvent.dragOver(col2Header, { dataTransfer: { dropEffect: "move" } });
    fireEvent.drop(col2Header, { dataTransfer: { getData: vi.fn(() => "col1") } }); // Simulate dataTransfer.getData

    // THEN: onColumnReorder should be called with the dragged and target column IDs
    expect(mockOnColumnReorder).toHaveBeenCalledWith("col1", "col2");
  });

  // GIVEN: The TableRegularView is rendered
  // WHEN: enableHoverActions is true and renderHoverActions is provided
  // THEN: The hover actions content should be rendered inside each data cell
  it("should render hover actions in data cells when enabled", () => {
    // GIVEN: enableHoverActions is true and renderHoverActions is provided
    // WHEN: Component is rendered
    renderComponent({ enableHoverActions: true, renderHoverActions: mockRenderHoverActions });

    // THEN: The mocked hover actions should be visible inside each data cell
    const cells = screen.getAllByText(/^Cell:/); // Find all data cells
    cells.forEach(cell => {
      // Check if the hover actions content is a descendant of the cell
      expect(cell.closest("td")).toHaveTextContent("Hover Actions");
    });
    // AND: renderHoverActions should have been called for each row/cell combination (simplified check)
    expect(mockRenderHoverActions).toHaveBeenCalled();
  });

  // GIVEN: The TableRegularView is rendered
  // WHEN: enableExpandableRows is true and renderExpandedRow is provided, and a row is expanded
  // THEN: The expanded row content should be rendered below the row
  it("should render expanded row content when enabled and row is expanded", () => {
    // GIVEN: enableExpandableRows is true, renderExpandedRow is provided, and row with id '1' is expanded
    const expanded = { "1": true };
    // WHEN: Component is rendered
    renderComponent({ enableExpandableRows: true, renderExpandedRow: mockRenderExpandedRow, expanded });

    // THEN: The mocked expanded row content for row '1' should be visible
    expect(screen.getByText("Expanded: 1")).toBeInTheDocument();
    // AND: renderExpandedRow should have been called for the expanded row
    expect(mockRenderExpandedRow).toHaveBeenCalledWith(mockTableData[0]);
  });

  // GIVEN: The TableRegularView is rendered
  // WHEN: enableKeyboardNavigation is true
  // THEN: Table elements should have appropriate ARIA attributes (role, aria-colcount, aria-rowcount, aria-colindex, aria-rowindex, aria-selected, aria-expanded)
  it("should add ARIA attributes when enableKeyboardNavigation is true", () => {
    // GIVEN: enableKeyboardNavigation is true, enableExpandableRows is true, a row is selected and expanded
    const expanded = { "1": true };
    const mockRowModelWithSelection = {
      rows: mockTableData.map((item) => ({
        ...mockRowModel.rows[0], // Use existing cell mocks
        id: item.id.toString(),
        original: item,
        getIsSelected: vi.fn(() => item.id === 1), // Select row 1
      })),
    };
    defaultProps.getRowModel.mockReturnValue(mockRowModelWithSelection);

    // WHEN: Component is rendered
    renderComponent({ enableKeyboardNavigation: true, enableExpandableRows: true, expanded });

    // THEN: The table element should have role="grid" and aria-colcount/aria-rowcount
    const table = screen.getByRole("grid");
    expect(table).toBeInTheDocument();
    expect(table).toHaveAttribute("aria-colcount", mockHeaderGroups[0].headers.length.toString());
    expect(table).toHaveAttribute("aria-rowcount", mockRowModelWithSelection.rows.length.toString());

    // AND: Header row should have role="row"
    const headerRow = screen.getByRole("row", { name: /Column 1/ }); // Find the header row
    expect(headerRow).toBeInTheDocument();

    // AND: Header cells should have role="columnheader" and aria-colindex
    const headerCells = screen.getAllByRole("columnheader");
    expect(headerCells.length).toBe(mockHeaderGroups[0].headers.length);
    headerCells.forEach((cell, index) => {
      expect(cell).toHaveAttribute("aria-colindex", (index + 1).toString());
    });

    // AND: Data rows should have role="row" and aria-rowindex
    const dataRows = screen.getAllByRole("row", { name: /Cell:/ }); // Find data rows
    expect(dataRows.length).toBe(mockTableData.length);
    dataRows.forEach((row, index) => {
      expect(row).toHaveAttribute("aria-rowindex", (index + 1).toString());
    });

    // AND: Data cells should have role="gridcell"
    const dataCells = screen.getAllByRole("gridcell");
    expect(dataCells.length).toBe(mockTableData.length * mockHeaderGroups[0].headers.length); // Total cells = rows * columns

    // AND: Selected row should have aria-selected="true"
    const selectedRow = screen.getByRole("row", { name: /Cell: cell-1-col1/ }); // Find row 1
    expect(selectedRow).toHaveAttribute("aria-selected", "true");

    // AND: Non-selected row should have aria-selected="false" (assuming there's another row)
    if (mockTableData.length > 1) {
      const nonSelectedRow = screen.getByRole("row", { name: /Cell: cell-2-col1/ }); // Find row 2
      expect(nonSelectedRow).toHaveAttribute("aria-selected", "false");
    }

    // AND: Expanded row should have aria-expanded="true"
    expect(selectedRow).toHaveAttribute("aria-expanded", "true");

    // AND: Non-expanded row should have aria-expanded="false" (assuming there's another row)
    if (mockTableData.length > 1) {
      const nonExpandedRow = screen.getByRole("row", { name: /Cell: cell-2-col1/ }); // Find row 2
      expect(nonExpandedRow).toHaveAttribute("aria-expanded", "false");
    }
  });
});
