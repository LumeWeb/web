import { FilterOperator } from "src/components/data-table/toolbarItems/filters/types";
import type { BaseRecord } from "@refinedev/core";

/**
 * Creates filter objects from a value and item configuration
 * @param value - The filter value
 * @param item - The toolbar item with configuration
 * @param getDefaultOperator - Optional function to get default operator for field type
 * @returns Array of filter objects
 */
export function createFiltersFromValue(
  value: any,
  item: any,
  getDefaultOperator?: (fieldType: string) => string,
): any[] {
  let newFilters: any[] = [];

  const field =
    (item as any).config?.field || (item as any)?.field || (item as any)?.id;

  if (value !== undefined && value !== null && value !== "") {
    if (Array.isArray(value)) {
      // For array values, create a filter with "in" operator
      newFilters = value.map((v) => ({
        field,
        operator: FilterOperator.IN,
        value: v,
      }));
    } else {
      // Get the operator to use - either from config or default based on field type
      const operator =
        (item as any).config?.operator ||
        ((item as any).config?.type
          ? getDefaultOperator?.((item as any).config.type)
          : FilterOperator.EQ);

      // For single values, create a single filter
      newFilters = [
        {
          field,
          operator,
          value,
        },
      ];
    }
  }

  return newFilters;
}

/**
 * Creates an onChange handler for filter items
 * @param item - The toolbar item with configuration
 * @param setFilters - Function to set filters
 * @param getDefaultOperator - Optional function to get default operator for field type
 * @param debugInfo - Optional debug information for logging
 * @returns onChange handler function
 */
export function createFilterOnChangeHandler(
  item: any,
  setFilters: (filters: any[]) => void,
  getDefaultOperator?: (fieldType: string) => string,
  debugInfo?: {
    itemId?: string;
    childItemId?: string;
  },
) {
  return (value: any) => {
    // Create filter objects using shared utility
    const newFilters = createFiltersFromValue(value, item, getDefaultOperator);

    // Let Refine handle the filter merging logic
    setFilters(newFilters);
  };
}
