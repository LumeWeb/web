import { render, screen, fireEvent, cleanup } from "@testing-library/react"; // Import cleanup
import React from "react";
import { describe, expect, it, vi, afterEach } from "vitest"; // Import afterEach

import { EmptyState } from "./EmptyState";

// Mock necessary components and icons
vi.mock("@lumeweb/portal-framework-ui-core", () => ({
  cn: vi.fn((...classes) => classes.join(" ")),
  Button: vi.fn(({ children, onClick, variant, className }) => (
    <button onClick={onClick} className={className} data-variant={variant}>
      {children}
    </button>
  )),
}));

vi.mock("lucide-react", () => ({
  AlertTriangle: vi.fn(() => <svg data-testid="icon-alert-triangle" />),
  FileQuestion: vi.fn(() => <svg data-testid="icon-file-question" />),
  Filter: vi.fn(() => <svg data-testid="icon-filter" />),
  FolderX: vi.fn(() => <svg data-testid="icon-folder-x" />),
  Lock: vi.fn(() => <svg data-testid="icon-lock" />),
  RefreshCw: vi.fn(() => <svg data-testid="icon-refresh-cw" />),
  WifiOff: vi.fn(() => <svg data-testid="icon-wifi-off" />),
}));

// Clean up the DOM after each test run
afterEach(cleanup);

describe("EmptyState", () => {
  it("renders with default 'noData' type", () => {
    render(<EmptyState title="No Items Found" />);
    expect(screen.getByText("No Items Found")).toBeInTheDocument();
    expect(screen.getByText("There's no data to display at the moment.")).toBeInTheDocument();
    expect(screen.getByTestId("icon-folder-x")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument(); // No default action for noData
  });

  it("renders with 'filtered' type and default action", () => {
    const mockClearFilters = vi.fn();
    render(<EmptyState title="No Results" type="filtered" action={{ label: "Clear filters", onClick: mockClearFilters }} />);
    expect(screen.getByText("No Results")).toBeInTheDocument();
    expect(screen.getByText("Try adjusting your filters to find what you're looking for.")).toBeInTheDocument();
    expect(screen.getByTestId("icon-filter")).toBeInTheDocument();
    const clearFiltersButton = screen.getByRole("button", { name: "Clear filters" });
    expect(clearFiltersButton).toBeInTheDocument();
    fireEvent.click(clearFiltersButton);
    expect(mockClearFilters).toHaveBeenCalled();
  });

  it("renders with 'error' type and default action", () => {
    const mockTryAgain = vi.fn();
    render(<EmptyState title="Failed to Load" type="error" action={{ label: "Try again", onClick: mockTryAgain }} />);
    expect(screen.getByText("Failed to Load")).toBeInTheDocument();
    expect(screen.getByText("An error occurred while fetching data. Please try again later.")).toBeInTheDocument();
    expect(screen.getByTestId("icon-alert-triangle")).toBeInTheDocument();
    const tryAgainButton = screen.getByRole("button", { name: "Try again" });
    expect(tryAgainButton).toBeInTheDocument();
    expect(screen.getByTestId("icon-refresh-cw")).toBeInTheDocument(); // Check for refresh icon
    fireEvent.click(tryAgainButton);
    expect(mockTryAgain).toHaveBeenCalled();
  });

  it("renders with 'network' type and default action", () => {
    const mockTryAgain = vi.fn();
    render(<EmptyState title="Connection Lost" type="network" action={{ label: "Try again", onClick: mockTryAgain }} />);
    expect(screen.getByText("Connection Lost")).toBeInTheDocument();
    expect(screen.getByText("Unable to connect to the server. Please check your internet connection.")).toBeInTheDocument();
    expect(screen.getByTestId("icon-wifi-off")).toBeInTheDocument();
    const tryAgainButton = screen.getByRole("button", { name: "Try again" });
    expect(tryAgainButton).toBeInTheDocument();
    expect(screen.getByTestId("icon-refresh-cw")).toBeInTheDocument(); // Check for refresh icon
    fireEvent.click(tryAgainButton);
    expect(mockTryAgain).toHaveBeenCalled();
  });

  it("renders with 'permission' type", () => {
    render(<EmptyState title="Access Denied" type="permission" />);
    expect(screen.getByText("Access Denied")).toBeInTheDocument();
    expect(screen.getByText("You don't have permission to access this resource.")).toBeInTheDocument();
    expect(screen.getByTestId("icon-lock")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument(); // No default action for permission
  });

  it("renders with 'custom' type and default icon", () => {
    render(<EmptyState title="Custom State" type="custom" description="This is a custom description." />);
    expect(screen.getByText("Custom State")).toBeInTheDocument();
    expect(screen.getByText("This is a custom description.")).toBeInTheDocument();
    expect(screen.getByTestId("icon-file-question")).toBeInTheDocument(); // Default custom icon
    expect(screen.queryByRole("button")).not.toBeInTheDocument(); // No default action for custom
  });

  it("renders with custom icon", () => {
    const CustomIcon = () => <svg data-testid="custom-icon" />;
    render(<EmptyState title="Custom Icon" icon={<CustomIcon />} />);
    expect(screen.getByText("Custom Icon")).toBeInTheDocument();
    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
    expect(screen.queryByTestId("icon-folder-x")).not.toBeInTheDocument(); // Default icon should not be present
  });

  it("renders with custom illustration (takes priority over icon)", () => {
    const CustomIcon = () => <svg data-testid="custom-icon" />;
    const CustomIllustration = () => <svg data-testid="custom-illustration" />;
    render(
      <EmptyState
        title="Custom Illustration"
        icon={<CustomIcon />}
        illustration={<CustomIllustration />}
      />,
    );
    expect(screen.getByText("Custom Illustration")).toBeInTheDocument();
    expect(screen.getByTestId("custom-illustration")).toBeInTheDocument();
    expect(screen.queryByTestId("custom-icon")).not.toBeInTheDocument(); // Icon should not be present
    expect(screen.queryByTestId("icon-folder-x")).not.toBeInTheDocument(); // Default icon should not be present
  });

  it("renders with custom description", () => {
    render(<EmptyState title="Custom Description" description={<span>Rich text description</span>} />);
    expect(screen.getByText("Custom Description")).toBeInTheDocument();
    expect(screen.getByText("Rich text description")).toBeInTheDocument();
    expect(screen.queryByText("There's no data to display at the moment.")).not.toBeInTheDocument(); // Default description should not be present
  });

  it("renders with custom action", () => {
    const mockCustomAction = vi.fn();
    render(
      <EmptyState
        title="Custom Action"
        action={{ label: "Perform Action", onClick: mockCustomAction, variant: "secondary" }}
      />,
    );
    expect(screen.getByText("Custom Action")).toBeInTheDocument();
    const actionButton = screen.getByRole("button", { name: "Perform Action" });
    expect(actionButton).toBeInTheDocument();
    expect(actionButton).toHaveAttribute("data-variant", "secondary");
    fireEvent.click(actionButton);
    expect(mockCustomAction).toHaveBeenCalled();
  });

  it("renders with secondary action", () => {
    const mockPrimaryAction = vi.fn();
    const mockSecondaryAction = vi.fn();
    render(
      <EmptyState
        title="Two Actions"
        action={{ label: "Primary", onClick: mockPrimaryAction }}
        secondaryAction={{ label: "Secondary", onClick: mockSecondaryAction, variant: "ghost" }}
      />,
    );
    expect(screen.getByText("Two Actions")).toBeInTheDocument();
    const primaryButton = screen.getByRole("button", { name: "Primary" });
    const secondaryButton = screen.getByRole("button", { name: "Secondary" });
    expect(primaryButton).toBeInTheDocument();
    expect(secondaryButton).toBeInTheDocument();
    expect(secondaryButton).toHaveAttribute("data-variant", "ghost");

    fireEvent.click(primaryButton);
    expect(mockPrimaryAction).toHaveBeenCalled();
    expect(mockSecondaryAction).not.toHaveBeenCalled();

    fireEvent.click(secondaryButton);
    expect(mockSecondaryAction).toHaveBeenCalled();
    // Primary action should not have been called again
    expect(mockPrimaryAction).toHaveBeenCalledTimes(1);
  });

  it("renders only secondary action if primary is not provided", () => {
    const mockSecondaryAction = vi.fn();
    render(
      <EmptyState
        title="Only Secondary Action"
        secondaryAction={{ label: "Secondary", onClick: mockSecondaryAction }}
      />,
    );
    expect(screen.getByText("Only Secondary Action")).toBeInTheDocument();
    const secondaryButton = screen.getByRole("button", { name: "Secondary" });
    expect(secondaryButton).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Primary" })).not.toBeInTheDocument(); // Primary button should not exist
    fireEvent.click(secondaryButton);
    expect(mockSecondaryAction).toHaveBeenCalled();
  });

  it("renders error details when provided and type is 'error'", () => {
    render(<EmptyState title="Error" type="error" errorDetails="Something went wrong." />);
    expect(screen.getByText("Show error details")).toBeInTheDocument();
    // Click to expand details
    fireEvent.click(screen.getByText("Show error details"));
    expect(screen.getByText("Something went wrong.")).toBeInTheDocument();
  });

  it("does not render error details if type is not 'error'", () => {
    render(<EmptyState title="No Data" type="noData" errorDetails="Something went wrong." />);
    expect(screen.queryByText("Show error details")).not.toBeInTheDocument();
  });

  it("applies compact styling when isCompact is true", () => {
    const { container } = render(<EmptyState title="Compact State" isCompact />);
    // The outermost div of the component should be the first child of the render container
    const outermostElement = container.firstChild as HTMLElement; // Cast to HTMLElement for toHaveClass
    expect(outermostElement).toHaveClass("py-6"); // Check padding class
    const iconContainer = screen.getByTestId("icon-folder-x").parentElement;
    expect(iconContainer).toHaveClass("scale-75"); // Check icon scaling
    const titleElementCompact = screen.getByText("Compact State");
    expect(titleElementCompact).toHaveClass("text-base"); // Check title font size
    const descriptionElement = screen.getByText("There's no data to display at the moment.");
    expect(descriptionElement).toHaveClass("text-sm"); // Check description font size
  });

  it("applies custom className", () => {
    const { container } = render(<EmptyState title="Custom Class" className="my-custom-class" />);
    // The outermost div of the component should be the first child of the render container
    const outermostElement = container.firstChild as HTMLElement; // Cast to HTMLElement for toHaveClass
    expect(outermostElement).toHaveClass("my-custom-class");
  });
});
