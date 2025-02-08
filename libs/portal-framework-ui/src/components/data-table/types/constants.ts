import type { AnimationConfig, KeyboardShortcutConfig } from "./table";

// Default keyboard shortcuts
export const DEFAULT_KEYBOARD_SHORTCUTS: KeyboardShortcutConfig = {
  cancelEdit: "Escape",
  // Cell actions
  editCell: ["Enter", "F2"],
  expandRow: "Enter",
  firstCell: "Ctrl+Home",
  firstCellInRow: "Home",
  firstPage: ["Alt+Home", "Ctrl+Home"],
  lastCell: "Ctrl+End",
  lastCellInRow: "End",

  lastPage: ["Alt+End", "Ctrl+End"],
  moveDown: "ArrowDown",

  moveLeft: "ArrowLeft",
  moveRight: "ArrowRight",
  // Cell navigation
  moveUp: "ArrowUp",

  nextPage: ["Alt+Right", "Alt+J", "Ctrl+Page Down"],
  // Pagination
  previousPage: ["Alt+Left", "Alt+K", "Ctrl+Page Up"],
  saveChanges: "Enter",
  // Row actions
  selectRow: "Space",
};

// Default animation config
export const DEFAULT_ANIMATION_CONFIG: AnimationConfig = {
  duration: 1000,
  highlightColor: "rgba(59, 130, 246, 0.2)", // Light blue highlight
  newRow: true,
  updatedCell: true,
  updatedRow: true,
};
