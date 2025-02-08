/**
 * Configuration for export options
 */
export interface ExportOptions {
  /**
   * Base filename for exported files
   */
  fileName?: string

  /**
   * Available export formats
   */
  formats?: ("csv" | "excel" | "pdf")[]

  /**
   * Optional function to transform data before export
   */
  mapData?: (item: any) => any
}
