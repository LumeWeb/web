import { ColumnDef } from "@tanstack/react-table";
import { BaseRecord } from "@refinedev/core";

/**
 * Filters columns for mobile display by adding responsive hiding classes
 * to specified columns while preserving order and functionality
 * 
 * @param columns - Array of column definitions
 * @param hideColumnsOnMobile - Array of column IDs to hide on mobile
 * @returns Filtered array of column definitions with responsive CSS classes
 */
function filterColumnsForMobile<TData extends BaseRecord>(
  columns: ColumnDef<TData>[],
  hideColumnsOnMobile: string[] = []
): ColumnDef<TData>[] {
  if (!hideColumnsOnMobile.length) {
    return columns;
  }

  return columns.map(column => {
    // Check if this column should be hidden on mobile
    if (hideColumnsOnMobile.includes(column.id as string)) {
      // Add responsive hiding classes while preserving existing ones
      const existingClassName = column.meta?.headerClassName || '';
      const existingCellClassName = column.meta?.cellClassName || '';
      
      return {
        ...column,
        meta: {
          ...column.meta,
          headerClassName: `${existingClassName} hidden sm:table-cell`.trim(),
          cellClassName: `${existingCellClassName} hidden sm:table-cell`.trim(),
        }
      };
    }
    
    // Return column unchanged if not in hide list
    return column;
  });
}

export { filterColumnsForMobile };
