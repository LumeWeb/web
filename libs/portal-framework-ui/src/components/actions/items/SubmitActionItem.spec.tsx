// Import the mocked Spinner component after its mock is defined
import { Spinner } from "@lumeweb/portal-framework-ui-core";
import { cleanup, render, screen } from "@testing-library/react"; // Import cleanup
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"; // Import afterEach and beforeEach

// Import the mocked registry function just before the suite that uses it
import { registerActionItemComponent } from "../registry";
import { ActionItemType } from "../types";
// Now import the component and its registration function AFTER the mocks
import { registerSubmitActionItem, SubmitActionItem } from "./SubmitActionItem";
// We will mock the registry module, so we don't import the actual registerActionItemComponent here yet

// Mock the Button and Spinner components from the core library *before* importing SubmitActionItem
vi.mock("@lumeweb/portal-framework-ui-core", () => ({
  Button: vi.fn(({ children, ...props }) => (
    <button {...props}>{children}</button>
  )),
  cn: vi.fn((...classes) => classes.filter(Boolean).join(" ")), // Also mock cn
  Spinner: vi.fn(({ className, size }) => (
    <span className={className} data-testid="spinner">
      Loading ({size})
    </span>
  )),
}));

// Mock the registry module *before* importing registerSubmitActionItem
// Define the mock function *inside* the factory
vi.mock("../registry", () => ({
  registerActionItemComponent: vi.fn(), // Define mock here
  resetRegistryForTesting: vi.fn(), // Mock this too if it were used here
}));

describe("SubmitActionItem", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders with default label when no label or children are provided", () => {
    render(<SubmitActionItem config={{ type: ActionItemType.SUBMIT }} />);
    expect(screen.getByRole("button")).toHaveTextContent("Submit");
  });

  it("renders with provided label", () => {
    render(
      <SubmitActionItem
        config={{ label: "Save Changes", type: ActionItemType.SUBMIT }}
      />,
    );
    expect(screen.getByRole("button")).toHaveTextContent("Save Changes");
  });

  it("renders with provided children", () => {
    render(
      <SubmitActionItem
        config={{ children: <span>Send</span>, type: ActionItemType.SUBMIT }}
      />,
    );
    expect(screen.getByRole("button")).toContainHTML("<span>Send</span>");
  });

  it("prefers label over children", () => {
    render(
      <SubmitActionItem
        config={{
          children: <span>Ignored Children</span>,
          label: "Preferred Label",
          type: ActionItemType.SUBMIT,
        }}
      />,
    );
    expect(screen.getByRole("button")).toHaveTextContent("Preferred Label");
    expect(screen.getByRole("button")).not.toContainHTML(
      "<span>Ignored Children</span>",
    );
  });

  it("is disabled when config.disabled is true", () => {
    render(
      <SubmitActionItem
        config={{ disabled: true, type: ActionItemType.SUBMIT }}
      />,
    );
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("is disabled when isSubmitting is true", () => {
    render(
      <SubmitActionItem
        config={{ type: ActionItemType.SUBMIT }}
        isSubmitting={true}
      />,
    );
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("is disabled when both config.disabled and isSubmitting are true", () => {
    render(
      <SubmitActionItem
        config={{ disabled: true, type: ActionItemType.SUBMIT }}
        isSubmitting={true}
      />,
    );
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("is not disabled when neither config.disabled nor isSubmitting are true", () => {
    render(
      <SubmitActionItem
        config={{ disabled: false, type: ActionItemType.SUBMIT }}
        isSubmitting={false}
      />,
    );
    expect(screen.getByRole("button")).not.toBeDisabled();
  });

  it("shows spinner and disables button when isSubmitting is true", () => {
    render(
      <SubmitActionItem
        config={{ type: ActionItemType.SUBMIT }}
        isSubmitting={true}
      />,
    );
    expect(screen.getByRole("button")).toBeDisabled();
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
    expect(screen.getByTestId("spinner")).toHaveClass("mr-2");
    // Check if the mock Spinner was called with the correct size prop
    expect(vi.mocked(Spinner)).toHaveBeenCalledWith(
      expect.objectContaining({ size: "small" }),
      {},
    );
  });

  it("does not show spinner when isSubmitting is false", () => {
    render(
      <SubmitActionItem
        config={{ type: ActionItemType.SUBMIT }}
        isSubmitting={false}
      />,
    );
    expect(screen.queryByTestId("spinner")).not.toBeInTheDocument();
  });

  it("applies className from config", () => {
    render(
      <SubmitActionItem
        config={{ className: "extra-class", type: ActionItemType.SUBMIT }}
      />,
    );
    expect(screen.getByRole("button")).toHaveClass("extra-class");
  });

  it("renders with type='submit'", () => {
    render(<SubmitActionItem config={{ type: ActionItemType.SUBMIT }} />);
    expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
  });
});

describe("registerSubmitActionItem", () => {
  // Clear the mock calls on the registry mock before this test suite
  beforeEach(() => {
    // Use the imported mock function directly
    registerActionItemComponent.mockClear();
  });

  it("should register the SubmitActionItem component", () => {
    registerSubmitActionItem();

    // Assert that the mocked registerActionItemComponent was called
    expect(registerActionItemComponent).toHaveBeenCalledTimes(1);
    expect(registerActionItemComponent).toHaveBeenCalledWith(
      ActionItemType.SUBMIT,
      SubmitActionItem,
    );
  });
});
