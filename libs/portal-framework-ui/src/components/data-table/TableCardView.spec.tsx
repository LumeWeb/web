import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import React from "react";

// Import the Checkbox component to mock it

import { TableCardView } from "./TableCardView";
import type { RowAction } from "./types/table";

// Mock the Radix Dropdown Menu components to avoid "Invalid hook call" in test environment
vi.mock("@radix-ui/react-dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => (
    <button aria-label="Open menu">{children}</button>
  ),
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuItem: ({ children, onSelect, className }: any) => (
    <div onClick={onSelect} className={className}>
      {children}
    </div>
  ),
}));

// Mock data and columns
interface MockData {
  id: string;
  name: string;
  age: number;
  city: string;
}

const mockData: MockData[] = [
  { id: "1", name: "Alice", age: 30, city: "New York" },
  { id: "2", name: "Bob", age: 25, city: "London" },
  { id: "3", name: "Charlie", age: 35, city: "Paris" },
];

const mockColumns = [
  {
    id: "select",
    header: "Select",
    cell: ({ row }: any) => (
      <input
        type="checkbox"
        aria-label="Select row" // Added for testing and accessibility
        checked={row.getIsSelected()}
        onChange={() => row.toggleSelected()}
      />
    ),
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "age",
    header: "Age",
  },
  {
    accessorKey: "city",
    header: "City",
  },
  {
    id: "actions",
    header: "Actions",
    cell: () => <div>...</div>, // Simplified for testing
  },
];

const defaultProps = {
  columns: mockColumns,
  data: mockData,
  getRowId: (row: MockData) => row.id,
  expandedRows: {},
  selectedRows: {},
  onRowExpansionChange: vi.fn(),
  onRowSelectionChange: vi.fn(),
};

describe("TableCardView", () => {
  it("renders correctly with basic data", () => {
    render(<TableCardView {...defaultProps} />);

    // Check if cards are rendered for each row
    // Check if cards are rendered for each row by checking primary content
    expect(
      screen.getByText("Alice", { selector: ".font-medium" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Bob", { selector: ".font-medium" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Charlie", { selector: ".font-medium" }),
    ).toBeInTheDocument();

    // Check if secondary columns are rendered (defaulting to age and city)
    // Use getAllByText because the labels appear for each row
    expect(screen.getAllByText("Age")).toHaveLength(mockData.length);
    expect(screen.getAllByText("City")).toHaveLength(mockData.length);
    // Check secondary content values
    expect(
      screen.getByText("30", { selector: ".col-span-2.text-sm" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("New York", { selector: ".col-span-2.text-sm" }),
    ).toBeInTheDocument();
  });

  it("renders empty state when data is empty", () => {
    render(<TableCardView {...defaultProps} data={[]} />);
    expect(screen.getByText("No data to display")).toBeInTheDocument();
  });

  it.skip("handles row selection when enabled", () => {
    const onRowSelectionChange = vi.fn();
    render(
      <TableCardView
        {...defaultProps}
        enableRowSelection
        onRowSelectionChange={onRowSelectionChange}
      />,
    );

    const checkboxes = screen.getAllByLabelText("Select row");
    expect(checkboxes).toHaveLength(mockData.length);

    fireEvent.click(checkboxes[0]); // Click the first checkbox (Alice)
    expect(onRowSelectionChange).toHaveBeenCalledWith("1", true);

    fireEvent.click(checkboxes[0]); // Click again to deselect
    expect(onRowSelectionChange).toHaveBeenCalledWith("1", false);
  });

  it("handles row expansion when enabled", () => {
    const onRowExpansionChange = vi.fn();
    const renderExpandedRow = vi.fn((row: MockData) => (
      <div>Expanded content for {row.name}</div>
    ));

    render(
      <TableCardView
        {...defaultProps}
        enableExpandableRows
        onRowExpansionChange={onRowExpansionChange}
        renderExpandedRow={renderExpandedRow}
      />,
    );

    const expandButtons = screen.getAllByLabelText("Expand row");
    expect(expandButtons).toHaveLength(mockData.length);

    fireEvent.click(expandButtons[0]); // Click expand for Alice
    expect(onRowExpansionChange).toHaveBeenCalledWith("1", true);

    // Simulate expansion state change
    render(
      <TableCardView
        {...defaultProps}
        enableExpandableRows
        onRowExpansionChange={onRowExpansionChange}
        renderExpandedRow={renderExpandedRow}
        expandedRows={{ "1": true }} // Alice is now expanded
      />,
    );

    expect(screen.getByText("Expanded content for Alice")).toBeInTheDocument();

    const collapseButton = screen.getByLabelText("Collapse row");
    fireEvent.click(collapseButton); // Click collapse for Alice
    expect(onRowExpansionChange).toHaveBeenCalledWith("1", false);
  });

  it.skip("handles row actions", () => {
    const mockActionClick = vi.fn();
    const rowActions: RowAction<MockData>[] = [
      {
        label: "Edit",
        onClick: mockActionClick,
        icon: <span>✏️</span>,
      },
      {
        label: "Delete",
        onClick: mockActionClick,
        className: "text-red-500",
      },
    ];

    render(<TableCardView {...defaultProps} rowActions={rowActions} />);

    const menuButtons = screen.getAllByLabelText("Open menu");
    expect(menuButtons).toHaveLength(mockData.length);

    fireEvent.click(menuButtons[0]); // Open menu for Alice

    const editMenuItem = screen.getByText("Edit");
    const deleteMenuItem = screen.getByText("Delete");

    expect(editMenuItem).toBeInTheDocument();
    expect(deleteMenuItem).toBeInTheDocument();
    expect(deleteMenuItem).toHaveClass("text-red-500");

    fireEvent.click(editMenuItem);
    expect(mockActionClick).toHaveBeenCalledWith(mockData[0]);

    fireEvent.click(deleteMenuItem);
    expect(mockActionClick).toHaveBeenCalledWith(mockData[0]);
  });

  it("uses specified primary and secondary columns", () => {
    render(
      <TableCardView
        {...defaultProps}
        primaryColumn="age"
        secondaryColumns={["city", "name"]}
      />,
    );

    // Check if age is the primary column
    const primaryContent = screen.getByText("30").closest("div");
    expect(primaryContent).toHaveClass("font-medium"); // Primary content has font-medium class

    // Check if city and name are secondary columns
    expect(screen.getAllByText("City")).toHaveLength(mockData.length);
    expect(screen.getAllByText("Name")).toHaveLength(mockData.length);
    expect(screen.getByText("New York")).toBeInTheDocument();
    expect(screen.getByText("Alice")).toBeInTheDocument();
  });

  it("renders cell content using accessorKey", () => {
    render(<TableCardView {...defaultProps} />);

    // Get the card for the first row (Alice)
    const aliceCard = screen.getByTestId("table-card-1");

    // Assuming 'name' is the default primary column
    expect(
      within(aliceCard).getByText("Alice", { selector: ".font-medium" }),
    ).toBeInTheDocument();

    // Assuming 'age' and 'city' are default secondary columns
    expect(
      within(aliceCard).getByText("30", { selector: ".col-span-2.text-sm" }),
    ).toBeInTheDocument();
    expect(
      within(aliceCard).getByText("New York", {
        selector: ".col-span-2.text-sm",
      }),
    ).toBeInTheDocument();
  });

  it("renders cell content using custom cell renderer", () => {
    const columnsWithCustomCell = [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ getValue }: any) => (
          <span data-testid="custom-name">{getValue().toUpperCase()}</span>
        ),
      },
      {
        accessorKey: "age",
        header: "Age",
      },
    ];

    render(
      <TableCardView
        {...defaultProps}
        columns={columnsWithCustomCell}
        secondaryColumns={["age"]}
      />,
    );

    // Use getAllByTestId because the custom cell is rendered for each row
    const customNameElements = screen.getAllByTestId("custom-name");
    expect(customNameElements).toHaveLength(mockData.length); // Ensure one for each row
    expect(customNameElements[0]).toHaveTextContent("ALICE"); // Check the first one

    // Optionally, check others if needed, e.g., expect(customNameElements[1]).toHaveTextContent("BOB");
  });

  it.skip("applies custom row styles", () => {
    const getRowStyles = vi.fn((row: MockData) =>
      row.age > 30 ? "bg-yellow-100" : "",
    );

    render(<TableCardView {...defaultProps} getRowStyles={getRowStyles} />);

    // Use data-testid to find the specific card element for Charlie (id: "3")
    const charlieCard = screen.getByTestId("table-card-3");
    expect(charlieCard).toHaveClass("bg-yellow-100");

    // Use data-testid to find the specific card element for Alice (id: "1")
    const aliceCard = screen.getByTestId("table-card-1");
    expect(aliceCard).not.toHaveClass("bg-yellow-100");
  });
});
