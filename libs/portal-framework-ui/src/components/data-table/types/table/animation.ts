/**
 * Configuration for table row and cell animations
 */
export interface AnimationConfig {
  /**
   * Duration of animations in milliseconds
   */
  duration: number

  /**
   * Color to use for highlighting animations
   */
  highlightColor: string

  /**
   * Whether to animate new rows
   */
  newRow: boolean

  /**
   * Whether to animate updated cells
   */
  updatedCell: boolean

  /**
   * Whether to animate updated rows
   */
  updatedRow: boolean
}
