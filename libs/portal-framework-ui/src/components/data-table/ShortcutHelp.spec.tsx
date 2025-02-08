import { render, screen, cleanup } from "@testing-library/react";
import React from "react";
import { describe, beforeEach, afterEach, expect, it, vi } from "vitest";
import { useShortcut } from "react-keybind";

import { ShortcutHelp } from "./ShortcutHelp";

// Mock necessary components and hooks
vi.mock("@lumeweb/portal-framework-ui-core", () => ({
  cn: vi.fn((...classes) => classes.join(" ")), // Simple mock for class names
}));

// Mock the react-keybind hook
vi.mock("react-keybind", () => ({
  useShortcut: vi.fn(),
}));

const mockUseShortcut = useShortcut as vi.Mock;

describe("ShortcutHelp", () => {
  const mockShortcuts = [
    {
      keys: ["Ctrl", "S"],
      description: "Save changes (table)",
      title: "Save",
      group: "table",
    },
    {
      keys: ["Escape"],
      description: "Cancel edit",
      title: "Cancel",
      group: "cell",
    },
    {
      keys: ["Enter"],
      description: "Confirm action",
      title: "Confirm",
    },
  ];

  beforeEach(() => {
    // Reset mock before each test
    mockUseShortcut.mockReset();
    // Ensure a clean DOM before each test
    cleanup();
  });

  afterEach(() => {
    // Ensure a clean DOM after each test
    cleanup();
  });

  it("renders nothing if useShortcut context is not available", () => {
    mockUseShortcut.mockReturnValue(undefined);
    const { container } = render(<ShortcutHelp />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing if there are no shortcuts", () => {
    mockUseShortcut.mockReturnValue({ shortcuts: [] });
    const { container } = render(<ShortcutHelp />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders all shortcuts if no group is specified", () => {
    mockUseShortcut.mockReturnValue({ shortcuts: mockShortcuts });
    const { container } = render(<ShortcutHelp />); // Get container

    // Scope queries to the container
    expect(screen.getByText("Keyboard Shortcuts", { container })).toBeInTheDocument();
    expect(screen.getByText("Save changes (table)", { container })).toBeInTheDocument();
    expect(screen.getByText("Ctrl / S", { container })).toBeInTheDocument();
    expect(screen.getByText("Cancel edit", { container })).toBeInTheDocument();
    expect(screen.getByText("Escape", { container })).toBeInTheDocument();
    expect(screen.getByText("Confirm action", { container })).toBeInTheDocument();
    expect(screen.getByText("Enter", { container })).toBeInTheDocument();
  });

  it("renders only shortcuts matching the specified group", () => {
    mockUseShortcut.mockReturnValue({ shortcuts: mockShortcuts });
    const { container } = render(<ShortcutHelp group="table" />); // Get container

    // Scope queries to the container
    expect(screen.queryByText("Keyboard Shortcuts", { container })).not.toBeInTheDocument();
    expect(screen.getByText("Save changes (table)", { container })).toBeInTheDocument();
    expect(screen.getByText("Ctrl / S", { container })).toBeInTheDocument();
    expect(screen.queryByText("Cancel edit", { container })).not.toBeInTheDocument();
    expect(screen.queryByText("Confirm action", { container })).not.toBeInTheDocument();
  });

  it("uses title if description is not available", () => {
    const shortcutsWithoutDescription = [
      { keys: ["A"], title: "Action A" },
      { keys: ["B"], description: "Action B Desc" },
    ];
    mockUseShortcut.mockReturnValue({ shortcuts: shortcutsWithoutDescription });
    const { container } = render(<ShortcutHelp />); // Get container

    // Scope queries to the container
    expect(screen.getByText("Action A", { container })).toBeInTheDocument();
    expect(screen.getByText("Action B Desc", { container })).toBeInTheDocument();
  });

  it("applies custom className", () => {
    mockUseShortcut.mockReturnValue({ shortcuts: mockShortcuts });
    const { container } = render(<ShortcutHelp className="custom-class" />);
    // This assertion already targets the container's first child, which is correct
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("renders nothing if no shortcuts match the group", () => {
    mockUseShortcut.mockReturnValue({ shortcuts: mockShortcuts });
    const { container } = render(<ShortcutHelp group="nonexistent" />);
    expect(container).toBeEmptyDOMElement();
  });
});
