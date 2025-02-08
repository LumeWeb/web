import { render, screen, cleanup } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { RouteErrorBoundaryFallback } from "./RouteErrorBoundaryFallback";

beforeEach(() => {
  cleanup();
});

describe("RouteErrorBoundaryFallback", () => {
  it("should render null for undefined/null error", () => {
    const { container } = render(
      <RouteErrorBoundaryFallback error={undefined} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("should render string errors", () => {
    render(<RouteErrorBoundaryFallback error="Test error message" />);
    expect(screen.getByText("Test error message")).toBeInTheDocument();
  });

  it("should render Error objects", () => {
    render(
      <RouteErrorBoundaryFallback error={new Error("Test error object")} />,
    );
    expect(screen.getByText("Test error object")).toBeInTheDocument();
  });

  it("should render router-like errors with status", () => {
    const routerError = {
      data: { message: "Page not found" },
      status: 404,
      statusText: "Not Found",
    };
    render(<RouteErrorBoundaryFallback error={routerError} />);

    expect(screen.getByText("Error 404")).toBeInTheDocument();
    expect(screen.getByText("Not Found")).toBeInTheDocument();
  });

  it("should detect resolution errors", () => {
    const error = new Error("Failed to load component from plugin");
    render(<RouteErrorBoundaryFallback error={error} />);

    expect(screen.getByText("Failed to load resource")).toBeInTheDocument();
    expect(screen.getByText(error.message)).toBeInTheDocument();
  });

  it("should show retry button when reset function provided", () => {
    const mockReset = vi.fn();
    render(
      <RouteErrorBoundaryFallback
        error="Test error"
        resetErrorBoundary={mockReset}
      />,
    );

    const button = screen.getByRole("button", { name: /retry/i });
    expect(button).toBeInTheDocument();
  });

  it("should not show retry button without reset function", () => {
    render(<RouteErrorBoundaryFallback error="Test error" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("should handle unknown error format", () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const error = { some: "weird format" };
    render(<RouteErrorBoundaryFallback error={error} />);

    expect(screen.getByText("An unknown error occurred")).toBeInTheDocument();
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "RouteErrorBoundaryFallback received an unhandled error format:",
      error
    );
    consoleErrorSpy.mockRestore();
  });
});
