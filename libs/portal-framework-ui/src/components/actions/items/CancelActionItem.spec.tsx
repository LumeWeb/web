// Import the mocked Button component after its mock is defined
import { Button } from "@lumeweb/portal-framework-ui-core";
import { cleanup, fireEvent, render, screen } from "@testing-library/react"; // Import cleanup
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"; // Import afterEach and beforeEach

// Import the mocked registry function just before the suite that uses it
import { registerActionItemComponent } from "../registry";
import { ActionItemType } from "../types";
// We will mock react-router's Link, so we don't import the actual RouterLink here yet
// Now import the component and its registration function AFTER the mocks
import { CancelActionItem, registerCancelActionItem } from "./CancelActionItem";
// We will mock the registry module, so we don't import the actual registerActionItemComponent here yet

// Mock the Button component from the core library *before* importing CancelActionItem
vi.mock("@lumeweb/portal-framework-ui-core", () => ({
  Button: vi.fn(({ children, ...props }) => (
    <button {...props}>{children}</button>
  )),
  cn: vi.fn((...classes) => classes.filter(Boolean).join(" ")), // Also mock cn
  Spinner: vi.fn(
    (
      { className, size }, // Also mock Spinner as it might be used in other item tests
    ) => (
      <span className={className} data-testid="spinner">
        Loading ({size})
      </span>
    ),
  ),
}));

// Mock the registry module *before* importing registerCancelActionItem
// Define the mock function *inside* the factory
vi.mock("../registry", () => ({
  registerActionItemComponent: vi.fn(), // Define mock here
  // Keep other exports if needed by other tests in this file, though none currently are
  resetRegistryForTesting: vi.fn(), // Mock this too if it were used here
}));

describe("CancelActionItem", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders with default label when no label or children are provided", () => {
    render(<CancelActionItem config={{ type: ActionItemType.CANCEL }} />);
    expect(screen.getByRole("button")).toHaveTextContent("Cancel");
  });

  it("renders with provided label", () => {
    render(
      <CancelActionItem
        config={{ label: "Close Dialog", type: ActionItemType.CANCEL }}
      />,
    );
    expect(screen.getByRole("button")).toHaveTextContent("Close Dialog");
  });

  it("renders with provided children", () => {
    render(
      <CancelActionItem
        config={{ children: <span>Exit</span>, type: ActionItemType.CANCEL }}
      />,
    );
    expect(screen.getByRole("button")).toContainHTML("<span>Exit</span>");
  });

  it("prefers label over children", () => {
    render(
      <CancelActionItem
        config={{
          children: <span>Ignored Children</span>,
          label: "Preferred Label",
          type: ActionItemType.CANCEL,
        }}
      />,
    );
    expect(screen.getByRole("button")).toHaveTextContent("Preferred Label");
    expect(screen.getByRole("button")).not.toContainHTML(
      "<span>Ignored Children</span>",
    );
  });

  it("calls closeDialog when clicked and no onClick is provided", () => {
    const mockCloseDialog = vi.fn();
    render(
      <CancelActionItem
        closeDialog={mockCloseDialog}
        config={{ type: ActionItemType.CANCEL }}
      />,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(mockCloseDialog).toHaveBeenCalledTimes(1);
  });

  it("calls onClick when clicked and onClick is provided", () => {
    const mockOnClick = vi.fn();
    const mockCloseDialog = vi.fn();
    render(
      <CancelActionItem
        closeDialog={mockCloseDialog}
        config={{ onClick: mockOnClick, type: ActionItemType.CANCEL }}
      />,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(mockOnClick).toHaveBeenCalledTimes(1);
    expect(mockCloseDialog).not.toHaveBeenCalled(); // onClick takes precedence
  });

  it("is disabled when config.disabled is true", () => {
    render(
      <CancelActionItem
        config={{ disabled: true, type: ActionItemType.CANCEL }}
      />,
    );
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("is disabled when isSubmitting is true", () => {
    render(
      <CancelActionItem
        config={{ type: ActionItemType.CANCEL }}
        isSubmitting={true}
      />,
    );
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("is disabled when both config.disabled and isSubmitting are true", () => {
    render(
      <CancelActionItem
        config={{ disabled: true, type: ActionItemType.CANCEL }}
        isSubmitting={true}
      />,
    );
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("is not disabled when neither config.disabled nor isSubmitting are true", () => {
    render(
      <CancelActionItem
        config={{ disabled: false, type: ActionItemType.CANCEL }}
        isSubmitting={false}
      />,
    );
    expect(screen.getByRole("button")).not.toBeDisabled();
  });

  it("applies className from config", () => {
    render(
      <CancelActionItem
        config={{ className: "extra-class", type: ActionItemType.CANCEL }}
      />,
    );
    expect(screen.getByRole("button")).toHaveClass("extra-class");
  });

  it("renders with type='button' and variant='outline'", () => {
    render(<CancelActionItem config={{ type: ActionItemType.CANCEL }} />);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("type", "button");
    // Check if the mock Button was called with the correct variant prop
    expect(vi.mocked(Button)).toHaveBeenCalledWith(
      expect.objectContaining({ variant: "outline" }),
      {},
    );
  });
});

describe("registerCancelActionItem", () => {
  // Clear the mock calls on the registry mock before this test suite
  beforeEach(() => {
    // Use the imported mock function directly
    vi.mocked(registerActionItemComponent).mockClear();
  });

  it("should register the CancelActionItem component", () => {
    registerCancelActionItem();

    // Assert that the mocked registerActionItemComponent was called
    expect(registerActionItemComponent).toHaveBeenCalledTimes(1);
    expect(registerActionItemComponent).toHaveBeenCalledWith(
      ActionItemType.CANCEL,
      CancelActionItem,
    );
  });
});
