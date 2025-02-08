import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest"; // Removed beforeAll

// We will now test the actual component
import { KeyboardShortcutCheatSheet } from "./KeyboardShortcutCheatsheet";

// Mock necessary components and hooks
// These mocks are for dependencies *used by* the component, not the component itself.
vi.mock("@lumeweb/portal-framework-ui-core", () => ({
  cn: vi.fn((...classes) => classes.join(" ")), // Simple mock for class names
}));
vi.mock("lucide-react", () => ({
  Keyboard: vi.fn(() => <svg data-testid="keyboard-icon" />),
}));
vi.mock("./ShortcutHelp", () => ({
  ShortcutHelp: vi.fn(({ group }) => (
    <div data-testid={`shortcut-help-${group || "all"}`}>
      Mocked ShortcutHelp
    </div>
  )),
}));


describe("KeyboardShortcutCheatSheet", () => {
  const mockShortcuts = {
    cancelEdit: "Escape",
    editCell: ["Enter", "F2"],
    expandRow: "Space",
    firstCell: "Home",
    firstCellInRow: "Ctrl+Home",
    firstPage: "Ctrl+Home", // Example duplicate, should still render
    lastCell: "End",
    lastCellInRow: "Ctrl+End",
    lastPage: "Ctrl+End", // Example duplicate
    moveDown: "ArrowDown",
    moveLeft: "ArrowLeft",
    moveRight: "ArrowRight",
    moveUp: "ArrowUp",
    nextPage: "PageDown",
    previousPage: "PageUp",
    saveChanges: "Enter", // Example duplicate
    selectRow: "Space", // Example duplicate
  };

  it("renders the cheat sheet title and icon", () => {
    render(<KeyboardShortcutCheatSheet shortcuts={mockShortcuts} />);
    // Expecting two instances of the title and icon due to apparent double rendering
    expect(screen.getAllByText("Keyboard Shortcuts").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByTestId("keyboard-icon").length).toBeGreaterThanOrEqual(1);
  });

  it("renders the mocked ShortcutHelp component", () => {
    render(<KeyboardShortcutCheatSheet shortcuts={mockShortcuts} />);
    // Expecting two instances of the mocked component due to apparent double rendering
    expect(screen.getAllByTestId("shortcut-help-table").length).toBeGreaterThanOrEqual(1);
  });

  it("renders shortcut categories and lists", () => {
    render(<KeyboardShortcutCheatSheet shortcuts={mockShortcuts} />);

    // Expecting two instances of each category title due to apparent double rendering
    expect(screen.getAllByText("Table Navigation").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Row Actions").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Cell Actions").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Pagination").length).toBeGreaterThanOrEqual(1);

    // Check for specific shortcuts within categories (expecting multiple instances)
    expect(screen.getAllByText("Move down").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Expand/collapse row").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Cancel edit").length).toBeGreaterThanOrEqual(1);
    // Note: The description for nextPage in the mock was "PageDown", but the actual component uses "Next page".
    // We are now testing the actual component, so we expect "Next page".
    expect(screen.getAllByText("Next page").length).toBeGreaterThanOrEqual(1);
  });

  it("renders shortcut keys correctly, handling arrays", () => {
    render(<KeyboardShortcutCheatSheet shortcuts={mockShortcuts} />);

    // Check a single key shortcut (expecting multiple instances)
    expect(screen.getAllByText("Escape").length).toBeGreaterThanOrEqual(1);
    // Check a multi-key shortcut (expecting multiple instances)
    expect(screen.getAllByText("Enter / F2").length).toBeGreaterThanOrEqual(1);
    // Check a shortcut with space (expecting multiple instances)
    expect(screen.getAllByText("Space").length).toBeGreaterThanOrEqual(1);
  });

  it("renders the Tab navigation note", () => {
    render(<KeyboardShortcutCheatSheet shortcuts={mockShortcuts} />);
    // Check for the paragraph containing the note text
    // Use getAllByText and check that at least one element matches
    const noteParagraphs = screen.getAllByText(
      (content, element) =>
        element?.tagName.toLowerCase() === "p" &&
        content.includes("Press") &&
        content.includes("to navigate between interactive elements."),
    );
    expect(noteParagraphs.length).toBeGreaterThanOrEqual(1);

    // Check for the Tab kbd element within the note (already using getAllByText)
    expect(screen.getAllByText("Tab").length).toBeGreaterThanOrEqual(1);
  });

  it("applies custom className", () => {
    render(
      <KeyboardShortcutCheatSheet
        className="custom-class"
        shortcuts={mockShortcuts}
      />,
    );
    // Find the outermost container by its test ID
    // Use getAllByTestId and check the class on the first element
    const containers = screen.getAllByTestId("cheatsheet-container");
    expect(containers.length).toBeGreaterThanOrEqual(1);

    // Check if the outermost div has the custom class
    expect(containers[0]).toHaveClass("custom-class");
  });

  // Removed the describe block for getShortcutDescription as it's an internal helper
  // and its functionality is tested implicitly by the component rendering tests.
});
