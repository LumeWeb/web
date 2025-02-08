import { render, screen, cleanup } from "@testing-library/react"; // Import cleanup
import React from "react";
import { describe, expect, it, vi, afterEach, beforeEach } from "vitest"; // Import afterEach and beforeEach

import { SubmitActionItem, registerSubmitActionItem } from "./SubmitActionItem";
import { ActionItemType } from "../types";
// We will mock the registry module, so we don't import the actual registerActionItemComponent here yet

// Mock the Button and Spinner components from the core library *before* importing SubmitActionItem
vi.mock("@lumeweb/portal-framework-ui-core", () => ({
  Button: vi.fn(({ children, ...props }) => (
    <button {...props}>{children}</button>
  )),
  Spinner: vi.fn(({ className, size }) => (
    <span data-testid="spinner" className={className}>
      Loading ({size})
    </span>
  )),
  cn: vi.fn((...classes) => classes.filter(Boolean).join(" ")), // Also mock cn
}));

// Mock the registry module *before* importing registerSubmitActionItem
// Define the mock function *inside* the factory
vi.mock("../registry", () => ({
  registerActionItemComponent: vi.fn(), // Define mock here
  resetRegistryForTesting: vi.fn(), // Mock this too if it were used here
}));

// Now import the component and its registration function AFTER the mocks
import { SubmitActionItem, registerSubmitActionItem } from "./SubmitActionItem";
// Import the mocked Spinner component after its mock is defined
import { Spinner } from "@lumeweb/portal-framework-ui-core";


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
        config={{ type: ActionItemType.SUBMIT, label: "Save Changes" }}
      />,
    );
    expect(screen.getByRole("button")).toHaveTextContent("Save Changes");
  });

  it("renders with provided children", () => {
    render(
      <SubmitActionItem
        config={{ type: ActionItemType.SUBMIT, children: <span>Send</span> }}
      />,
    );
    expect(screen.getByRole("button")).toContainHTML("<span>Send</span>");
  });

  it("prefers label over children", () => {
    render(
      <SubmitActionItem
        config={{
          type: ActionItemType.SUBMIT,
          label: "Preferred Label",
          children: <span>Ignored Children</span>,
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
      <SubmitActionItem config={{ type: ActionItemType.SUBMIT, disabled: true }} />,
    );
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("is disabled when isSubmitting is true", () => {
    render(<SubmitActionItem config={{ type: ActionItemType.SUBMIT }} isSubmitting={true} />);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("is disabled when both config.disabled and isSubmitting are true", () => {
    render(
      <SubmitActionItem
        config={{ type: ActionItemType.SUBMIT, disabled: true }}
        isSubmitting={true}
      />,
    );
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("is not disabled when neither config.disabled nor isSubmitting are true", () => {
    render(
      <SubmitActionItem
        config={{ type: ActionItemType.SUBMIT, disabled: false }}
        isSubmitting={false}
      />,
    );
    expect(screen.getByRole("button")).not.toBeDisabled();
  });

  it("shows spinner and disables button when isSubmitting is true", () => {
    render(<SubmitActionItem config={{ type: ActionItemType.SUBMIT }} isSubmitting={true} />);
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
    render(<SubmitActionItem config={{ type: ActionItemType.SUBMIT }} isSubmitting={false} />);
    expect(screen.queryByTestId("spinner")).not.toBeInTheDocument();
  });

  it("applies className from config", () => {
    render(
      <SubmitActionItem
        config={{ type: ActionItemType.SUBMIT, className: "extra-class" }}
      />,
    );
    expect(screen.getByRole("button")).toHaveClass("extra-class");
  });

  it("renders with type='submit'", () => {
    render(<SubmitActionItem config={{ type: ActionItemType.SUBMIT }} />);
    expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
  });
});

// Import the mocked registry function just before the suite that uses it
import { registerActionItemComponent } from "../registry";

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
