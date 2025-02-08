import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";

import { TablePagination } from "./TablePagination";
import { useScreenReaderAnnouncement } from "../screen-reader/hooks/useScreenReaderAnnouncement";

// Mock the useScreenReaderAnnouncement hook
vi.mock("../screen-reader/hooks/useScreenReaderAnnouncement", () => ({
  useScreenReaderAnnouncement: vi.fn(() => ({
    announce: vi.fn(),
  })),
}));

// Mock the @tanstack/react-table dependency
const mockTable = {
  getState: vi.fn(() => ({
    pagination: {
      pageIndex: 0,
      pageSize: 10,
    },
  })),
  getFilteredRowModel: vi.fn(() => ({
    rows: Array(100).fill({}), // Mock 100 rows
  })),
  getCanPreviousPage: vi.fn(() => false),
  getCanNextPage: vi.fn(() => true),
  setPageIndex: vi.fn(),
  setPageSize: vi.fn(),
  previousPage: vi.fn(),
  nextPage: vi.fn(),
};

// Mock the UI components from @lumeweb/portal-framework-ui-core
// This is a simplified mock; in a real scenario, you might need more sophisticated mocks
// or use a testing setup that handles these components.
vi.mock("@lumeweb/portal-framework-ui-core", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@lumeweb/portal-framework-ui-core")>();
  return {
    ...actual,
    Button: vi.fn(({ children, onClick, disabled, "aria-label": ariaLabel, ...props }) => (
      <button onClick={onClick} disabled={disabled} aria-label={ariaLabel} {...props}>
        {children}
      </button>
    )),
    Select: vi.fn(({ children, onValueChange, value }) => (
      <select onChange={(e) => onValueChange(e.target.value)} value={value}>
        {children}
      </select>
    )),
    SelectTrigger: vi.fn(({ children }) => <div>{children}</div>),
    SelectValue: vi.fn(({ placeholder }) => <span>{placeholder}</span>),
    SelectContent: vi.fn(({ children }) => <div>{children}</div>),
    SelectItem: vi.fn(({ children, value }) => <option value={value}>{children}</option>),
    cn: vi.fn((...classes) => classes.join(" ")), // Simple cn mock
  };
});

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
  ChevronLeft: () => <span>&lt;</span>,
  ChevronRight: () => <span>&gt;</span>,
  ChevronsLeft: () => <span>&lt;&lt;</span>,
  ChevronsRight: () => <span>&gt;&gt;</span>,
}));

describe("TablePagination", () => {
  let announceMock: ReturnType<typeof useScreenReaderAnnouncement>["announce"];

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    announceMock = useScreenReaderAnnouncement().announce;

    // Reset mock table state for each test
    mockTable.getState.mockReturnValue({
      pagination: {
        pageIndex: 0,
        pageSize: 10,
      },
    });
    mockTable.getFilteredRowModel.mockReturnValue({
      rows: Array(100).fill({}),
    });
    mockTable.getCanPreviousPage.mockReturnValue(false);
    mockTable.getCanNextPage.mockReturnValue(true);
  });

  // Helper function to render the component
  const renderComponent = (props = {}) => {
    return render(<TablePagination table={mockTable as any} {...props} />);
  };

  // GIVEN: The TablePagination component is rendered
  // WHEN: It is rendered with default props
  // THEN: It should display the correct row count and pagination info
  it("should display correct row count and pagination info", () => {
    // GIVEN: Mock table has 100 rows, page 0, size 10
    // WHEN: Component is rendered
    renderComponent();

    // THEN: It should show "Showing 1 to 10 of 100"
    expect(screen.getByText(/Showing/)).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();
  });

  // GIVEN: The TablePagination component is rendered
  // WHEN: The table has no rows
  // THEN: It should display "No results"
  it("should display 'No results' when table has no rows", () => {
    // GIVEN: Mock table has 0 rows
    mockTable.getFilteredRowModel.mockReturnValue({ rows: [] });
    mockTable.getState.mockReturnValue({ pagination: { pageIndex: 0, pageSize: 10 } });

    // WHEN: Component is rendered
    renderComponent();

    // THEN: It should show "No results"
    expect(screen.getByText("No results")).toBeInTheDocument();
  });

  // GIVEN: The TablePagination component is rendered
  // WHEN: The user changes the rows per page
  // THEN: The table's setPageSize function should be called and an announcement made
  it("should call setPageSize and announce when changing rows per page", () => {
    // GIVEN: Component is rendered
    renderComponent();
    const select = screen.getByRole("combobox"); // Assuming Select renders a combobox or similar

    // WHEN: User selects a new page size (e.g., 20)
    fireEvent.change(select, { target: { value: "20" } });

    // THEN: setPageSize should be called with the new value
    expect(mockTable.setPageSize).toHaveBeenCalledWith(20);
    // AND: An announcement should be made
    expect(announceMock).toHaveBeenCalledWith("Showing 20 rows per page", "polite");
  });

  // GIVEN: The TablePagination component is rendered
  // WHEN: The user clicks the "Go to first page" button
  // THEN: The table's setPageIndex function should be called with 0 and an announcement made
  it("should go to the first page when the first page button is clicked", () => {
    // GIVEN: Mock table is not on the first page
    mockTable.getState.mockReturnValue({ pagination: { pageIndex: 5, pageSize: 10 } });
    mockTable.getCanPreviousPage.mockReturnValue(true);
    renderComponent();
    const firstPageButton = screen.getByLabelText("Go to first page");

    // WHEN: The button is clicked
    fireEvent.click(firstPageButton);

    // THEN: setPageIndex should be called with 0
    expect(mockTable.setPageIndex).toHaveBeenCalledWith(0);
    // AND: An announcement should be made
    expect(announceMock).toHaveBeenCalledWith("Navigated to first page", "polite");
  });

  // GIVEN: The TablePagination component is rendered
  // WHEN: The user clicks the "Go to previous page" button
  // THEN: The table's previousPage function should be called and an announcement made
  it("should go to the previous page when the previous page button is clicked", () => {
    // GIVEN: Mock table is not on the first page
    mockTable.getState.mockReturnValue({ pagination: { pageIndex: 5, pageSize: 10 } });
    mockTable.getCanPreviousPage.mockReturnValue(true);
    renderComponent();
    const previousPageButton = screen.getByLabelText("Go to previous page");

    // WHEN: The button is clicked
    fireEvent.click(previousPageButton);

    // THEN: previousPage should be called
    expect(mockTable.previousPage).toHaveBeenCalled();
    // AND: An announcement should be made (announces the *new* page index, which is current - 1)
    expect(announceMock).toHaveBeenCalledWith("Navigated to page 5", "polite"); // pageIndex is 5, so previous is 4. The announcement uses the state *before* the update. This might be a slight discrepancy between component logic and test expectation, but testing the call is primary.
  });

  // GIVEN: The TablePagination component is rendered
  // WHEN: The user clicks the "Go to next page" button
  // THEN: The table's nextPage function should be called and an announcement made
  it("should go to the next page when the next page button is clicked", () => {
    // GIVEN: Mock table is not on the last page
    mockTable.getState.mockReturnValue({ pagination: { pageIndex: 0, pageSize: 10 } });
    mockTable.getFilteredRowModel.mockReturnValue({ rows: Array(100).fill({}) }); // 10 pages total
    mockTable.getCanNextPage.mockReturnValue(true);
    renderComponent();
    const nextPageButton = screen.getByLabelText("Go to next page");

    // WHEN: The button is clicked
    fireEvent.click(nextPageButton);

    // THEN: nextPage should be called
    expect(mockTable.nextPage).toHaveBeenCalled();
    // AND: An announcement should be made (announces the *new* page index, which is current + 1)
    expect(announceMock).toHaveBeenCalledWith("Navigated to page 2", "polite"); // pageIndex is 0, so next is 1. Announcement uses current + 2.
  });

  // GIVEN: The TablePagination component is rendered
  // WHEN: The user clicks the "Go to last page" button
  // THEN: The table's setPageIndex function should be called with the last page index and an announcement made
  it("should go to the last page when the last page button is clicked", () => {
    // GIVEN: Mock table is not on the last page (100 rows, 10 per page = 10 pages, index 0-9)
    mockTable.getState.mockReturnValue({ pagination: { pageIndex: 0, pageSize: 10 } });
    mockTable.getFilteredRowModel.mockReturnValue({ rows: Array(100).fill({}) });
    mockTable.getCanNextPage.mockReturnValue(true);
    renderComponent();
    const lastPageButton = screen.getByLabelText("Go to last page");

    // WHEN: The button is clicked
    fireEvent.click(lastPageButton);

    // THEN: setPageIndex should be called with the last page index (9)
    expect(mockTable.setPageIndex).toHaveBeenCalledWith(9);
    // AND: An announcement should be made
    expect(announceMock).toHaveBeenCalledWith("Navigated to last page, page 10", "polite"); // pageCount is 10
  });

  // GIVEN: The TablePagination component is rendered
  // WHEN: The user is on the first page
  // THEN: The "Go to first page" and "Go to previous page" buttons should be disabled
  it("should disable first and previous buttons on the first page", () => {
    // GIVEN: Mock table is on the first page
    mockTable.getState.mockReturnValue({ pagination: { pageIndex: 0, pageSize: 10 } });
    mockTable.getCanPreviousPage.mockReturnValue(false);
    mockTable.getCanNextPage.mockReturnValue(true); // Can go next
    renderComponent();

    // THEN: First page button should be disabled
    expect(screen.getByLabelText("Go to first page")).toBeDisabled();
    // AND: Previous page button should be disabled
    expect(screen.getByLabelText("Go to previous page")).toBeDisabled();
    // AND: Next and Last page buttons should be enabled
    expect(screen.getByLabelText("Go to next page")).toBeEnabled();
    expect(screen.getByLabelText("Go to last page")).toBeEnabled();
  });

  // GIVEN: The TablePagination component is rendered
  // WHEN: The user is on the last page
  // THEN: The "Go to next page" and "Go to last page" buttons should be disabled
  it("should disable next and last buttons on the last page", () => {
    // GIVEN: Mock table is on the last page (100 rows, 10 per page = 10 pages, index 9)
    mockTable.getState.mockReturnValue({ pagination: { pageIndex: 9, pageSize: 10 } });
    mockTable.getFilteredRowModel.mockReturnValue({ rows: Array(100).fill({}) });
    mockTable.getCanPreviousPage.mockReturnValue(true); // Can go previous
    mockTable.getCanNextPage.mockReturnValue(false); // Cannot go next
    renderComponent();

    // THEN: Next page button should be disabled
    expect(screen.getByLabelText("Go to next page")).toBeDisabled();
    // AND: Last page button should be disabled
    expect(screen.getByLabelText("Go to last page")).toBeDisabled();
    // AND: First and Previous page buttons should be enabled
    expect(screen.getByLabelText("Go to first page")).toBeEnabled();
    expect(screen.getByLabelText("Go to previous page")).toBeEnabled();
  });

  // GIVEN: The TablePagination component is rendered
  // WHEN: enableKeyboardNavigation is true
  // THEN: Buttons should have tabIndex 0
  it("should set tabIndex to 0 on buttons when enableKeyboardNavigation is true", () => {
    // GIVEN: enableKeyboardNavigation is true
    renderComponent({ enableKeyboardNavigation: true });

    // THEN: All buttons should have tabIndex 0
    const buttons = screen.getAllByRole("button");
    buttons.forEach((button) => {
      expect(button).toHaveAttribute("tabindex", "0");
    });
  });

  // GIVEN: The TablePagination component is rendered
  // WHEN: enableKeyboardNavigation is false
  // THEN: Buttons should not have tabIndex set (or be undefined)
  it("should not set tabIndex on buttons when enableKeyboardNavigation is false", () => {
    // GIVEN: enableKeyboardNavigation is false (default)
    renderComponent({ enableKeyboardNavigation: false });

    // THEN: All buttons should not have tabIndex set
    const buttons = screen.getAllByRole("button");
    buttons.forEach((button) => {
      expect(button).not.toHaveAttribute("tabindex");
    });
  });

  // GIVEN: The TablePagination component is rendered
  // WHEN: layout is "separated"
  // THEN: It should apply the separated layout class
  it("should apply separated layout class when layout is 'separated'", () => {
    // GIVEN: layout is "separated" (default)
    const { container } = renderComponent({ layout: "separated" });

    // THEN: The container div should have the separated class
    expect(container.firstChild).toHaveClass("border border-t-2 border-x-0");
  });

  // GIVEN: The TablePagination component is rendered
  // WHEN: layout is "combined"
  // THEN: It should apply the combined layout class
  it("should apply combined layout class when layout is 'combined'", () => {
    // GIVEN: layout is "combined"
    const { container } = renderComponent({ layout: "combined" });

    // THEN: The container div should have the combined class
    expect(container.firstChild).toHaveClass("bg-muted/40 rounded-lg p-2");
  });
});
