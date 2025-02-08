import { cn } from "@lumeweb/portal-framework-ui-core";
import { Keyboard } from "lucide-react";
import React from "react";

import type { KeyboardShortcutConfig } from "./types";

import { ShortcutHelp } from "./ShortcutHelp";

interface KeyboardShortcutCheatSheetProps {
  className?: string;
  shortcuts: KeyboardShortcutConfig;
}

export function KeyboardShortcutCheatSheet({
  className,
  shortcuts,
}: KeyboardShortcutCheatSheetProps) {
  // Convert the shortcuts object to a format that can be displayed
  const shortcutList = Object.entries(shortcuts).map(([action, keys]) => ({
    action,
    description: getShortcutDescription(action),
    keys: Array.isArray(keys) ? keys.join(" / ") : String(keys),
  }));

  return (
    <div className={cn("mt-4 p-3 border rounded-md bg-muted/30", className)} data-testid="cheatsheet-container">
      <div className="flex items-center gap-2 mb-2">
        <Keyboard className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-medium">Keyboard Shortcuts</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Get shortcuts from react-keybind */}
        <ShortcutHelp group="table" />

        {/* Also display shortcuts passed as props */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Table Navigation</h4>
          <ul className="space-y-1 text-sm">
            {shortcutList
              .filter((s) =>
                [
                  "firstCell",
                  "firstCellInRow",
                  "lastCell",
                  "lastCellInRow",
                  "moveDown",
                  "moveLeft",
                  "moveRight",
                  "moveUp",
                ].includes(s.action),
              )
              .map((shortcut, index) => (
                <li className="flex justify-between" key={index}>
                  <span>{shortcut.description}</span>
                  <kbd className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                    {shortcut.keys}
                  </kbd>
                </li>
              ))}
          </ul>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium">Row Actions</h4>
          <ul className="space-y-1 text-sm">
            {shortcutList
              .filter((s) => ["expandRow", "selectRow"].includes(s.action))
              .map((shortcut, index) => (
                <li className="flex justify-between" key={index}>
                  <span>{shortcut.description}</span>
                  <kbd className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                    {shortcut.keys}
                  </kbd>
                </li>
              ))}
          </ul>

          <h4 className="text-sm font-medium mt-4">Cell Actions</h4>
          <ul className="space-y-1 text-sm">
            {shortcutList
              .filter((s) =>
                ["cancelEdit", "editCell", "saveChanges"].includes(s.action),
              )
              .map((shortcut, index) => (
                <li className="flex justify-between" key={index}>
                  <span>{shortcut.description}</span>
                  <kbd className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                    {shortcut.keys}
                  </kbd>
                </li>
              ))}
          </ul>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium">Pagination</h4>
          <ul className="space-y-1 text-sm">
            {shortcutList
              .filter((s) =>
                ["firstPage", "lastPage", "nextPage", "previousPage"].includes(
                  s.action,
                ),
              )
              .map((shortcut, index) => (
                <li className="flex justify-between" key={index}>
                  <span>{shortcut.description}</span>
                  <kbd className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                    {shortcut.keys}
                  </kbd>
                </li>
              ))}
          </ul>
        </div>
      </div>

      <div className="mt-3 text-xs text-muted-foreground">
        <p>
          Press{" "}
          <kbd className="px-1 py-0.5 bg-background rounded border text-xs font-mono">
            Tab
          </kbd>{" "}
          to navigate between interactive elements.
        </p>
      </div>
    </div>
  );
}

// Helper function to get human-readable descriptions for shortcut actions
function getShortcutDescription(action: string): string {
  const descriptions: Record<string, string> = {
    cancelEdit: "Cancel edit",
    editCell: "Edit cell",
    expandRow: "Expand/collapse row",
    firstCell: "First cell in table",
    firstCellInRow: "First cell in row",
    firstPage: "First page",
    lastCell: "Last cell in table",
    lastCellInRow: "Last cell in row",
    lastPage: "Last page",
    moveDown: "Move down",
    moveLeft: "Move left",
    moveRight: "First cell in row",
    moveUp: "Move up",
    nextPage: "Next page",
    previousPage: "Previous page",
    saveChanges: "Save changes",
    selectRow: "Select/deselect row",
  };

  return descriptions[action] || action;
}
