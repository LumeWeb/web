/**
 * Configuration for keyboard shortcuts in the data table
 */
export interface KeyboardShortcutConfig {
  /**
   * Shortcut to cancel editing a cell
   */
  cancelEdit: string | string[];

  // Cell actions
  /**
   * Shortcut to enter edit mode for the current cell
   */
  editCell: string | string[];

  /**
   * Shortcut to expand/collapse the current row
   */
  expandRow: string | string[];

  /**
   * Shortcut to move to the first cell in the table
   */
  firstCell: string | string[];

  /**
   * Shortcut to move to the first cell in the current row
   */
  firstCellInRow: string | string[];

  /**
   * Shortcut to go to the first page
   */
  firstPage: string | string[];

  /**
   * Shortcut to move to the last cell in the table
   */
  lastCell: string | string[];

  /**
   * Shortcut to move to the last cell in the current row
   */
  lastCellInRow: string | string[];

  /**
   * Shortcut to go to the last page
   */
  lastPage: string | string[];

  /**
   * Shortcut to move down one cell
   */
  moveDown: string | string[];

  /**
   * Shortcut to move left one cell
   */
  moveLeft: string | string[];

  /**
   * Shortcut to move right one cell
   */
  moveRight: string | string[];

  // Cell navigation
  /**
   * Shortcut to move up one cell
   */
  moveUp: string | string[];

  /**
   * Shortcut to go to the next page
   */
  nextPage: string | string[];

  // Pagination
  /**
   * Shortcut to go to the previous page
   */
  previousPage: string | string[];

  /**
   * Shortcut to save changes when editing a cell
   */
  saveChanges: string | string[];

  // Row actions
  /**
   * Shortcut to select/deselect the current row
   */
  selectRow: string | string[];
}
