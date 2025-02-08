import { render, screen, cleanup } from "@testing-library/react"; // Import cleanup
import React from "react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest"; // Import afterEach

import { ActionListRenderer } from "./ActionListRenderer";
import { ActionItemType, ActionItemConfig } from "./types"; // Import ActionItemConfig
import {
  registerActionItemComponent,
  resetRegistryForTesting, // Import the new reset function
} from "./registry";

// Mock the individual action item components (keep definitions outside describe)
const MockCancelActionItem = vi.fn(({ config, closeDialog, isSubmitting }) => (
  <button
    data-testid="cancel-action"
    disabled={isSubmitting || config.disabled}
    onClick={() => {
      if (config.onClick) config.onClick();
      else if (closeDialog) closeDialog();
    }}
  >
    {config.label || config.children || "Mock Cancel"}
  </button>
));
const MockCustomActionItem = vi.fn(({ config, isSubmitting }) => (
  <button
    data-testid="custom-action"
    disabled={isSubmitting || config.disabled}
    onClick={config.onClick}
  >
    {config.label || config.children || "Mock Custom"}
  </button>
));
const MockLinkActionItem = vi.fn(({ config }) => (
  <a data-testid="link-action" href={config.to} target={config.target}>
    {config.label || config.children || "Mock Link"}
  </a>
));
const MockSubmitActionItem = vi.fn(({ config, isSubmitting }) => (
  <button data-testid="submit-action" disabled={isSubmitting || config.disabled} type="submit">
    {isSubmitting && <span data-testid="spinner">Loading...</span>}
    {config.label || config.children || "Mock Submit"}
  </button>
));

describe("ActionListRenderer", () => {
  beforeEach(() => {
    resetRegistryForTesting();
    registerActionItemComponent(ActionItemType.CANCEL, MockCancelActionItem);
    registerActionItemComponent(ActionItemType.CUSTOM, MockCustomActionItem);
    registerActionItemComponent(ActionItemType.LINK, MockLinkActionItem);
    registerActionItemComponent(ActionItemType.SUBMIT, MockSubmitActionItem);
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders null if no actions are provided", () => {
    const { container } = render(<ActionListRenderer actions={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders null if actions is undefined", () => {
    const { container } = render(<ActionListRenderer actions={undefined as any} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders action items based on the provided config", () => {
    const actions: ActionItemConfig[] = [
      { type: ActionItemType.CANCEL, label: "Close" },
      { type: ActionItemType.SUBMIT, label: "Save" },
    ];
    render(<ActionListRenderer actions={actions} />);

    expect(screen.getByTestId("cancel-action")).toHaveTextContent("Close");
    expect(screen.getByTestId("submit-action")).toHaveTextContent("Save");
  });

  it("passes closeDialog and isSubmitting props to action items", () => {
    const mockCloseDialog = vi.fn();
    const actions: ActionItemConfig[] = [{ type: ActionItemType.CANCEL, label: "Close" }];
    render(
      <ActionListRenderer
        actions={actions}
        closeDialog={mockCloseDialog}
        isSubmitting={true}
      />,
    );

    expect(MockCancelActionItem).toHaveBeenCalledWith(
      expect.objectContaining({
        closeDialog: mockCloseDialog,
        isSubmitting: true,
      }),
      {}, // React context object (often empty in simple renders)
    );
  });

  it("applies horizontal layout by default", () => {
    const actions: ActionItemConfig[] = [
      { type: ActionItemType.CANCEL, label: "Close" },
      { type: ActionItemType.SUBMIT, label: "Save" },
    ];
    const { container } = render(<ActionListRenderer actions={actions} />);
    const div = container.firstChild;
    expect(div).toHaveClass("flex-row");
    expect(div).toHaveClass("justify-end");
    expect(div).toHaveClass("space-x-3");
  });

  it("applies vertical layout when specified", () => {
    const actions: ActionItemConfig[] = [
      { type: ActionItemType.CANCEL, label: "Close" },
      { type: ActionItemType.SUBMIT, label: "Save" },
    ];
    const { container } = render(
      <ActionListRenderer actions={actions} layout="vertical" />,
    );
    const div = container.firstChild;
    expect(div).toHaveClass("flex-col");
    expect(div).toHaveClass("space-y-3");
  });

  it("applies custom className", () => {
    const actions: ActionItemConfig[] = [{ type: ActionItemType.CANCEL, label: "Close" }];
    const { container } = render(
      <ActionListRenderer actions={actions} className="custom-class" />,
    );
    const div = container.firstChild;
    expect(div).toHaveClass("custom-class");
  });

  it("handles action items with keys", () => {
    const actions: ActionItemConfig[] = [
      { type: ActionItemType.CANCEL, label: "Close", key: "cancel-key" },
      { type: ActionItemType.SUBMIT, label: "Save", key: "submit-key" },
    ];
    render(<ActionListRenderer actions={actions} />);
    // Check if keys are applied to the rendered components (difficult directly with RTL,
    // but we can check if the mock was called with the correct config including key if needed,
    // or rely on React's internal key handling which is assumed to work).
    // A simpler check is just that the items are rendered.
    expect(screen.getByTestId("cancel-action")).toBeInTheDocument();
    expect(screen.getByTestId("submit-action")).toBeInTheDocument();
  });

  it("warns and skips rendering for unregistered action types", () => {
    const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const actions: ActionItemConfig[] = [
      // Cast the object literal to ActionItemConfig using 'as'
      { type: "unknown-type" as ActionItemType, label: "Unknown" } as ActionItemConfig,
    ];
    render(<ActionListRenderer actions={actions} />);

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      "No component registered for action type: unknown-type",
    );
    expect(screen.queryByText("Unknown")).not.toBeInTheDocument();

    consoleWarnSpy.mockRestore();
  });

  it("renders custom components when type is CUSTOM_COMPONENT", () => {
    const CustomComp = ({ text }: { text: string }) => <div data-testid="custom-comp">{text}</div>;
    const actions: ActionItemConfig[] = [
      {
        type: ActionItemType.CUSTOM_COMPONENT,
        component: CustomComp,
        props: { text: "Hello World" }
      }
    ];
    render(<ActionListRenderer actions={actions} />);

    expect(screen.getByTestId("custom-comp")).toBeInTheDocument();
    expect(screen.getByTestId("custom-comp")).toHaveTextContent("Hello World");
  });
});
