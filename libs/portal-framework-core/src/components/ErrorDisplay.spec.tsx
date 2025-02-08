import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { InitializationResult } from "../types/api";

import { ErrorDisplay } from "./ErrorDisplay";

describe("ErrorDisplay", () => {
  const mockError = new Error("Test error message");
  const mockInitializationError: InitializationResult = {
    builder: {} as any,
    errors: [
      {
        category: "plugin",
        error: new Error("Plugin load failed"),
        id: "plugin:core",
      },
      {
        category: "system",
        error: new Error("System error"),
        id: "system:network",
      },
    ],
    framework: {} as any,
    success: false,
  };

  it("should display simple error message", () => {
    render(<ErrorDisplay error={mockError} />);

    expect(screen.getAllByRole("alert")).toHaveLength(1);
    expect(
      screen.getByText(/Framework Initialization Failed/),
    ).toBeInTheDocument();
    expect(screen.getByText("Test error message")).toBeInTheDocument();
  });

  it("should display categorized errors", () => {
    render(<ErrorDisplay error={mockInitializationError} />);

    expect(screen.getByText("Plugin Error")).toBeInTheDocument();
    expect(screen.getByText("System Error")).toBeInTheDocument();
    expect(screen.getAllByRole("alert")).toHaveLength(3); // 1 for container + 2 error boxes
    expect(screen.getByText("plugin:core")).toBeInTheDocument();
    expect(screen.getByText("System error")).toBeInTheDocument();
  });

  it("should show retry button when callback provided", async () => {
    const mockRetry = vi.fn();
    render(<ErrorDisplay error={mockError} onRetry={mockRetry} />);

    const button = screen.getByRole("button", { name: /Retry/ });
    expect(button).toBeInTheDocument();

    await userEvent.click(button);
    expect(mockRetry).toHaveBeenCalledTimes(1);
  });

  it("should handle resolution-specific errors", () => {
    const resolutionError = new Error("Failed to load element for route home");
    render(<ErrorDisplay error={resolutionError} />);

    expect(
      screen.getByText(/Failed to load element for route home/),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Failed to load element for route home"),
    ).toBeInTheDocument();
  });
});
