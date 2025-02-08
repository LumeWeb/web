import type React from "react"
/**
 * Configuration for bulk actions
 */
export interface BulkAction<T> {
  /**
   * Optional CSS class to apply to the action button
   */
  className?: string

  /**
   * Optional icon to display with the action
   */
  icon?: React.ReactNode

  /**
   * Label for the action
   */
  label: string

  /**
   * Function to call when the action is clicked
   */
  onClick: (records: T[]) => void
}

/**
 * Configuration for row actions
 */
export interface RowAction<T> {
  /**
   * Optional CSS class to apply to the action button
   */
  className?: string

  /**
   * Optional icon to display with the action
   */
  icon?: React.ReactNode

  /**
   * Label for the action
   */
  label: string

  /**
   * Function to call when the action is clicked
   */
  onClick: (record: T) => void
}

/**
 * Configuration for row highlighting rules
 */
export interface RowHighlightRule<T> {
  /**
   * CSS class to apply when the condition is met
   */
  className: string

  /**
   * Condition function that determines if a row should be highlighted
   */
  condition: (row: T) => boolean

  /**
   * Priority of the rule (higher priority rules override lower priority ones)
   */
  priority: number
}
