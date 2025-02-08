import { cleanup, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { MemoryRouter, useRouteError } from "react-router";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

import { RouteErrorBoundary } from "./RouteErrorBoundary";
import { RouteErrorBoundaryFallback } from "./RouteErrorBoundaryFallback";

// Test component that throws when shouldThrow is true
function Bomb({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error("Simulated child error");
  }
  return <div>Bomb did not explode</div>;
}

// Mock the useRouteError hook
vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...(actual as object),
    useRouteError: vi.fn(),
  };
});

// Mock the fallback component to simplify testing
vi.mock("./RouteErrorBoundaryFallback", () => ({
  RouteErrorBoundaryFallback: vi.fn(({ error, resetErrorBoundary }) => (
    <div data-testid="mock-fallback">
      {error instanceof Error ? error.message : String(error)}
      {resetErrorBoundary && (
        <button onClick={resetErrorBoundary}>Retry</button>
      )}
    </div>
  )),
}));

describe("RouteErrorBoundary", () => {
  const mockUseRouteError = vi.fn();

  const consoleErrorSpy = vi
    .spyOn(console, "error")
    .mockImplementation(() => {});
  const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
    vi.mocked(useRouteError).mockImplementation(mockUseRouteError);
    consoleErrorSpy.mockClear();
    consoleWarnSpy.mockClear();
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  it("should render fallback with router error when useRouteError succeeds", () => {
    const routerError = new Error("Router error");
    mockUseRouteError.mockReturnValue(routerError);

    render(
      <MemoryRouter>
        <RouteErrorBoundary />
      </MemoryRouter>,
    );

    expect(RouteErrorBoundaryFallback).toHaveBeenCalledWith(
      expect.objectContaining({
        error: routerError,
        resetErrorBoundary: undefined,
      }),
      expect.anything(),
    );
    expect(screen.getByTestId("mock-fallback")).toHaveTextContent(
      "Router error",
    );
  });

  it("should render ErrorBoundary wrapper when children exist", () => {
    mockUseRouteError.mockImplementation(() => {
      throw new Error("Not in router context");
    });

    render(
      <RouteErrorBoundary>
        <div>Child content</div>
      </RouteErrorBoundary>,
    );

    // The ErrorBoundary wrapper should be rendered with children
    expect(screen.getByText("Child content")).toBeInTheDocument();
  });

  it("should render null when no router error and no children", () => {
    mockUseRouteError.mockReturnValue(null);

    const { container } = render(<RouteErrorBoundary />);
    expect(container).toBeEmptyDOMElement();
  });

  it("should pass reset function to fallback when child throws error", async () => {
    mockUseRouteError.mockImplementation(() => {
      throw new Error("Not in router context");
    });

    render(
      <RouteErrorBoundary>
        <Bomb shouldThrow={true} />
      </RouteErrorBoundary>,
    );

    // Wait for error boundary to catch and render fallback
    await waitFor(() => {
      expect(RouteErrorBoundaryFallback).toHaveBeenCalled();
    });

    // Verify reset function was passed
    const fallbackProps = vi.mocked(RouteErrorBoundaryFallback).mock
      .calls[0][0];
    expect(fallbackProps.resetErrorBoundary).toBeInstanceOf(Function);
    expect(fallbackProps.error).toEqual(new Error("Simulated child error"));
  });
});
