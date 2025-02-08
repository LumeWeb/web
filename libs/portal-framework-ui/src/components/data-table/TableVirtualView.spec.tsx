import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import React from "react";

import { TableVirtualView } from "./TableVirtualView";

// Mock dependencies
vi.mock("./EmptyState", () => ({
  EmptyState: vi.fn(({ title, description, type }) => (
    <div>
      Mocked EmptyState: {title} - {description} - {type}
    </div>
  )),
}));

vi.mock("./VirtualScrollTable", () => ({
  VirtualScrollTable: vi.fn(() => <div>Mocked VirtualScrollTable</div>),
}));

// Mock lucide-react icons (if used in loading/error states, though not directly in this component's logic)
// Adding this just in case the mocked EmptyState or other internal components use them.
vi.mock("lucide-react", () => ({
  RefreshCw: () => <span>Loading Icon</span>,
}));

describe("TableVirtualView", () => {
  const defaultProps = {
    cellRefs: { current: {} },
    emptyState: undefined,
    enableExpandableRows: false,
    enableKeyboardNavigation: false,
    enableRowSelection: false,
    errorState: undefined,
    estimateSize: 40,
    expanded: {},
    focusedCell: null,
    getCellStyle: vi.fn(() => ""),
    getHeaderGroups: vi.fn(() => []),
    getRowAnimationClass: vi.fn(() => ""),
    getRowAnimationStyle: vi.fn(() => ({})),
    getRowHighlightClass: vi.fn(() => ""), // Corrected to return a string
    getRowModel: vi.fn(() => ({ rows: [] as any[] })), // Default to no rows, typed as any[]
    isDataError: false,
    isDataLoading: false,
    isLoadingMore: false,
    onScroll: vi.fn(),
    overscan: 10,
    renderCellContent: vi.fn(() => null),
    renderEmptyState: vi.fn(() => <div>Default Empty State</div>),
    renderExpandedRow: undefined,
    scrollToIndex: undefined,
    setFocusedCell: vi.fn(),
    tableHeight: 500,
    virtualData: [], // Default to no data
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset default props for mocks that return data
    defaultProps.getRowModel.mockReturnValue({ rows: [] });
    defaultProps.virtualData = [];
  });

  afterEach(() => {
    cleanup();
  });

  // Helper function to render the component
  const renderComponent = (props = {}) => {
    return render(<TableVirtualView {...defaultProps} {...props} />);
  };

  // GIVEN: The TableVirtualView is rendered
  // WHEN: isDataLoading is true and isLoadingMore is false (initial loading)
  // THEN: It should display the initial loading state
  it("should display initial loading state when isDataLoading is true and isLoadingMore is false", () => {
    // GIVEN: isDataLoading is true, isLoadingMore is false
    // WHEN: Component is rendered
    renderComponent({ isDataLoading: true, isLoadingMore: false });

    // THEN: The loading indicator text should be visible
    expect(screen.getByText("Loading...")).toBeInTheDocument();
    // AND: The VirtualScrollTable should not be rendered
    expect(
      screen.queryByText("Mocked VirtualScrollTable"),
    ).not.toBeInTheDocument();
    // AND: The "Loading more..." indicator should not be visible
    expect(screen.queryByText("Loading more...")).not.toBeInTheDocument();
  });

  // GIVEN: The TableVirtualView is rendered
  // WHEN: isDataError is true
  // THEN: It should display the error state
  it("should display error state when isDataError is true", () => {
    // GIVEN: isDataError is true
    // WHEN: Component is rendered
    renderComponent({ isDataError: true });

    // THEN: The default error EmptyState should be visible
    expect(
      screen.getByText(
        "Mocked EmptyState: Error loading data - There was an error loading the data. Please try again. - error",
      ),
    ).toBeInTheDocument();
    // AND: The VirtualScrollTable should not be rendered
    expect(
      screen.queryByText("Mocked VirtualScrollTable"),
    ).not.toBeInTheDocument();
  });

  // GIVEN: The TableVirtualView is rendered
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
    expect(
      screen.queryByText(
        "Mocked EmptyState: Error loading data - There was an error loading the data. Please try again. - error",
      ),
    ).not.toBeInTheDocument();
  });

  // GIVEN: The TableVirtualView is rendered
  // WHEN: virtualData is empty and not loading or in error
  // THEN: It should display the empty state
  it("should display empty state when virtualData is empty and not loading or error", () => {
    // GIVEN: virtualData is empty, isDataLoading is false, isDataError is false
    // WHEN: Component is rendered
    renderComponent({ virtualData: [] });

    // THEN: The default empty state rendered by renderEmptyState should be visible
    expect(screen.getByText("Default Empty State")).toBeInTheDocument();
    // AND: The VirtualScrollTable should not be rendered
    expect(
      screen.queryByText("Mocked VirtualScrollTable"),
    ).not.toBeInTheDocument();
  });

  // GIVEN: The TableVirtualView is rendered
  // WHEN: virtualData is empty and not loading or in error, and a custom emptyState is provided
  // THEN: It should display the custom empty state
  it("should display custom empty state when virtualData is empty and emptyState is provided", () => {
    // GIVEN: virtualData is empty, isDataLoading is false, isDataError is false, and custom emptyState is provided
    const customEmptyState = <div>No Data Available</div>;
    // WHEN: Component is rendered
    renderComponent({ virtualData: [], emptyState: customEmptyState });

    // THEN: The custom empty state should be visible
    expect(screen.getByText("No Data Available")).toBeInTheDocument();
    // AND: The default empty state should not be visible
    expect(screen.queryByText("Default Empty State")).not.toBeInTheDocument();
  });

  // GIVEN: The TableVirtualView is rendered
  // WHEN: virtualData is not empty and not loading or in error
  // THEN: It should render the VirtualScrollTable
  it("should render VirtualScrollTable when virtualData is not empty and not loading or error", () => {
    // GIVEN: virtualData has items, isDataLoading is false, isDataError is false
    const virtualData = [{ id: 1 }, { id: 2 }];
    defaultProps.getRowModel.mockReturnValue({ rows: virtualData }); // Ensure getRowModel also reflects data
    // WHEN: Component is rendered
    renderComponent({ virtualData });

    // THEN: The mocked VirtualScrollTable should be visible
    expect(screen.getByText("Mocked VirtualScrollTable")).toBeInTheDocument();
    // AND: Loading/Error/Empty states should not be visible
    expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    expect(screen.queryByText(/Mocked EmptyState/)).not.toBeInTheDocument();
    expect(screen.queryByText("Default Empty State")).not.toBeInTheDocument();
  });

  // GIVEN: The TableVirtualView is rendered
  // WHEN: isLoadingMore is true and virtualData is not empty
  // THEN: It should render the VirtualScrollTable and the "Loading more..." indicator
  it("should render VirtualScrollTable and 'Loading more...' when isLoadingMore is true and data is present", () => {
    // GIVEN: virtualData has items, isLoadingMore is true
    const virtualData = [{ id: 1 }, { id: 2 }];
    defaultProps.getRowModel.mockReturnValue({ rows: virtualData });
    // WHEN: Component is rendered
    renderComponent({ virtualData, isLoadingMore: true });

    // THEN: The mocked VirtualScrollTable should be visible
    expect(screen.getByText("Mocked VirtualScrollTable")).toBeInTheDocument();
    // AND: The "Loading more..." indicator should be visible
    expect(screen.getByText("Loading more...")).toBeInTheDocument();
    // AND: Initial loading state should not be visible
    expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
  });

  // GIVEN: The TableVirtualView is rendered
  // WHEN: isLoadingMore is true but virtualData is empty
  // THEN: It should display the empty state (or initial loading if isDataLoading is also true)
  // Note: The component logic prioritizes loading/error over empty if data is empty.
  // If isLoadingMore is true, it implies there *was* data, but the mock setup might not reflect this.
  // Let's test the case where isLoadingMore is true, but virtualData is empty (which might indicate an issue or edge case).
  it("should display empty state when isLoadingMore is true but virtualData is empty (edge case)", () => {
    // GIVEN: virtualData is empty, isLoadingMore is true, isDataLoading is false, isDataError is false
    // WHEN: Component is rendered
    renderComponent({
      virtualData: [],
      isLoadingMore: true,
      isDataLoading: false,
      isDataError: false,
    });

    // THEN: The default empty state should be visible
    expect(screen.getByText("Default Empty State")).toBeInTheDocument();
    // AND: The "Loading more..." indicator should NOT be visible (it's inside the data rendering block)
    expect(screen.queryByText("Loading more...")).not.toBeInTheDocument();
    // AND: The VirtualScrollTable should not be rendered
    expect(
      screen.queryByText("Mocked VirtualScrollTable"),
    ).not.toBeInTheDocument();
  });
});
