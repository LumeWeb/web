import { cn } from "@lumeweb/portal-framework-ui-core";
import React from "react";
import { useShortcut } from "react-keybind";

interface ShortcutHelpProps {
  className?: string;
  group?: string;
}

/**
 * ShortcutHelp - Renders a list of keyboard shortcuts registered with react-keybind
 *
 * This component is used:
 * 1. Directly in the DataTable when showing inline shortcut help
 * 2. Inside KeyboardShortcutCheatSheet to render shortcuts in a formatted panel
 *
 * @param group Optional filter to show only shortcuts for a specific group
 * @param className Optional CSS classes
 */
export function ShortcutHelp({ className, group }: ShortcutHelpProps) {
  const shortcutContext = useShortcut();

  if (!shortcutContext) {
    return null;
  }

  const { shortcuts } = shortcutContext;

  // Filter shortcuts by group if specified
  // We'll check if the group is mentioned in the description
  const filteredShortcuts = group
    ? shortcuts.filter((shortcut) => shortcut.description?.includes(group))
    : shortcuts;

  if (filteredShortcuts.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-2", className)}>
      {!group && (
        <h3 className="text-sm font-medium mb-2">Keyboard Shortcuts</h3>
      )}
      <ul className="space-y-1 text-sm">
        {filteredShortcuts.map((shortcut, index) => (
          <li className="flex justify-between" key={index}>
            <span>{shortcut.description || shortcut.title}</span>
            <kbd className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
              {shortcut.keys.join(" / ")}
            </kbd>
          </li>
        ))}
      </ul>
    </div>
  );
}
