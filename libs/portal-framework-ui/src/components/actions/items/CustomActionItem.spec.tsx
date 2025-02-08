import { cleanup, fireEvent, render, screen } from "@testing-library/react"; // Import cleanup
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"; // Import afterEach and beforeEach

// Import the mocked Button component after its mock is defined
// Import the mocked registry function just before the suite that uses it
import { registerActionItemComponent } from "../registry";
import { ActionItemType } from "../types";
// Now import the component and its registration function AFTER the mocks
import { CustomActionItem, registerCustomActionItem } from "./CustomActionItem";
// We will mock the registry module, so we don't import the actual registerActionItemComponent here yet

// Mock the Button component from the core library *before* importing CustomActionItem
vi.mock("@lumeweb/portal-framework-ui-core", () => ({
  Button: vi.fn(({ children, ...props }) => (
    <button {...props}>{children}</button>
  )),
  cn: vi.fn((...classes) => classes.filter(Boolean).join(" ")), // Also mock cn
  Spinner: vi.fn(
    (
      { className, size }, // Also mock Spinner
    ) => (
      <span className={className} data-testid="spinner">
        Loading ({size})
      </span>
    ),
  ),
}));

// Mock the registry module *before* importing registerCustomActionItem
// Define the mock function *inside* the factory
vi.mock("../registry", () => ({
  registerActionItemComponent: vi.fn(), // Define mock here
  resetRegistryForTesting: vi.fn(), // Mock this too if it were used here
}));

describe("CustomActionItem", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders with provided label", () => {
    const mockOnClick = vi.fn();
    render(
      <CustomActionItem
        config={{
          label: "Do Something",
          onClick: mockOnClick,
          type: ActionItemType.CUSTOM,
        }}
      />,
    );
    expect(screen.getByRole("button")).toHaveTextContent("Do Something");
  });

  it("renders with provided children", () => {
    const mockOnClick = vi.fn();
    render(
      <CustomActionItem
        config={{
          children: <span>Click Me</span>,
          onClick: mockOnClick,
          type: ActionItemType.CUSTOM,
        }}
      />,
    );
    expect(screen.getByRole("button")).toContainHTML("<span>Click Me</span>");
  });

  it("prefers label over children", () => {
    const mockOnClick = vi.fn();
    render(
      <CustomActionItem
        config={{
          children: <span>Ignored Children</span>,
          label: "Preferred Label",
          onClick: mockOnClick,
          type: ActionItemType.CUSTOM,
        }}
      />,
    );
    expect(screen.getByRole("button")).toHaveTextContent("Preferred Label");
    expect(screen.getByRole("button")).not.toContainHTML(
      "<span>Ignored Children</span>",
    );
  });

  it("calls onClick when clicked", () => {
    const mockOnClick = vi.fn();
    render(
      <CustomActionItem
        config={{
          label: "Click",
          onClick: mockOnClick,
          type: ActionItemType.CUSTOM,
        }}
      />,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it("is disabled when config.disabled is true", () => {
    const mockOnClick = vi.fn();
    render(
      <CustomActionItem
        config={{
          disabled: true,
          onClick: mockOnClick,
          type: ActionItemType.CUSTOM,
        }}
      />,
    );
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("is disabled when isSubmitting is true", () => {
    const mockOnClick = vi.fn();
    render(
      <CustomActionItem
        config={{ onClick: mockOnClick, type: ActionItemType.CUSTOM }}
        isSubmitting={true}
      />,
    );
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("is disabled when both config.disabled and isSubmitting are true", () => {
    const mockOnClick = vi.fn();
    render(
      <CustomActionItem
        config={{
          disabled: true,
          onClick: mockOnClick,
          type: ActionItemType.CUSTOM,
        }}
        isSubmitting={true}
      />,
    );
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("is not disabled when neither config.disabled nor isSubmitting are true", () => {
    const mockOnClick = vi.fn();
    render(
      <CustomActionItem
        config={{
          disabled: false,
          onClick: mockOnClick,
          type: ActionItemType.CUSTOM,
        }}
        isSubmitting={false}
      />,
    );
    expect(screen.getByRole("button")).not.toBeDisabled();
  });

  it("applies className from config", () => {
    const mockOnClick = vi.fn();
    render(
      <CustomActionItem
        config={{
          className: "extra-class",
          onClick: mockOnClick,
          type: ActionItemType.CUSTOM,
        }}
      />,
    );
    expect(screen.getByRole("button")).toHaveClass("extra-class");
  });

  it("renders with type='button'", () => {
    const mockOnClick = vi.fn();
    render(
      <CustomActionItem
        config={{ onClick: mockOnClick, type: ActionItemType.CUSTOM }}
      />,
    );
    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
  });

  it("logs an error and returns null if onClick is missing", () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const { container } = render(
      <CustomActionItem config={{ type: ActionItemType.CUSTOM } as any} />, // Cast to any to simulate missing onClick
    );

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "CustomActionItem requires an onClick handler in its config.",
      expect.any(Object), // The config object
    );
    expect(container).toBeEmptyDOMElement();

    consoleErrorSpy.mockRestore();
  });
});

describe("registerCustomActionItem", () => {
  // Clear the mock calls on the registry mock before this test suite
  beforeEach(() => {
    // Use the imported mock function directly
    vi.mocked(registerActionItemComponent).mockClear();
  });

  it("should register the CustomActionItem component", () => {
    registerCustomActionItem();

    // Assert that the mocked registerActionItemComponent was called
    expect(registerActionItemComponent).toHaveBeenCalledTimes(1);
    expect(registerActionItemComponent).toHaveBeenCalledWith(
      ActionItemType.CUSTOM,
      CustomActionItem,
    );
  });
});
