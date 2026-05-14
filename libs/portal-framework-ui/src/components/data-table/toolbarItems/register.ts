// Import and register all toolbar items
import { registerFilter } from "@/components/data-table/ToolbarRegistry";
import { BaseRecord } from "@refinedev/core";
import type { FilterConfig } from "@/components/data-table/toolbarItems/filters/types";
import type { ToolbarFilterItem } from "@/components/data-table/DataTable.types";
import { ToolbarItemType } from "@/components/data-table/DataTable.types";
import { FilterOperator, FilterType, LogicalFilterOperator } from "./filters";

// Import filter components
import {
  BooleanFilter,
  DateFilter,
  MultiSelectFilter,
  NumberFilter,
  RangeFilter,
  SearchFilter,
  SelectFilter,
  TextFilter,
} from "./filters/components";

// Import registration functions from items
import { registerRefreshToolbarItem } from "./items/refresh";
import { registerSearchToolbarItem } from "./items/search";

/**
 * Get default operator based on filter type
 * @param filterType - The type of filter
 * @returns The default CRUD operator for that filter type
 */
function getDefaultOperator(filterType: FilterType): LogicalFilterOperator {
  switch (filterType) {
    case FilterType.TEXT:
      return FilterOperator.CONTAINS;
    case FilterType.SELECT:
      return FilterOperator.EQ;
    case FilterType.DATE:
      return FilterOperator.EQ;
    case FilterType.NUMBER:
      return FilterOperator.EQ;
    case FilterType.BOOLEAN:
      return FilterOperator.EQ;
    case FilterType.MULTI_SELECT:
      return FilterOperator.IN;
    case FilterType.RANGE:
      return FilterOperator.BETWEEN;
    case FilterType.SEARCH:
      return FilterOperator.CONTAINS;
    default:
      return FilterOperator.EQ;
  }
}

/**
 * Create a standard filter item with proper configuration
 * @param id - Unique identifier for the filter
 * @param component - The React component for the filter
 * @param operator - The CRUD operator for the filter
 * @param additionalConfig - Optional additional configuration to override defaults
 * @returns A properly configured ToolbarFilterItem
 */
function createStandardFilter<TData extends BaseRecord = any>(
  id: string,
  component: React.ComponentType<any>,
  operator: LogicalFilterOperator,
  additionalConfig: Partial<FilterConfig<TData>> = {},
): ToolbarFilterItem<TData> {
  const defaultLabel = computeDefaultLabel(id);
  const label = additionalConfig.label || defaultLabel;

  return {
    id,
    label,
    type: ToolbarItemType.FILTER,
    component,
    initialValue: additionalConfig.initialValue,
    config: {
      ...additionalConfig,
      id,
      label,
      type: additionalConfig.type || (id as FilterType),
      field: additionalConfig.field || ("" as keyof TData),
      operator,
    },
  } as ToolbarFilterItem<TData>;
}

/**
 * Compute a default label from an ID by converting camelCase/snake_case to readable format
 * @param id - The identifier to convert
 * @returns A readable label string
 */
function computeDefaultLabel(id: string): string {
  // Handle snake_case
  if (id.includes("_")) {
    return (
      id
        .split("_")
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
        )
        .join(" ") + " Filter"
    );
  }

  // Handle camelCase
  const camelCaseWords = id.replace(/([A-Z])/g, " $1").trim();
  return (
    camelCaseWords.charAt(0).toUpperCase() + camelCaseWords.slice(1) + " Filter"
  );
}

function registerFilterItems() {
  // Register default filters using helper functions
  registerFilter(
    FilterType.TEXT,
    createStandardFilter("text", TextFilter, FilterOperator.CONTAINS, {
      type: FilterType.TEXT,
      field: "" as any,
    }),
  );
  registerFilter(
    FilterType.SELECT,
    createStandardFilter("select", SelectFilter, FilterOperator.EQ, {
      type: FilterType.SELECT,
      field: "" as any,
    }),
  );
  registerFilter(
    FilterType.DATE,
    createStandardFilter("date", DateFilter, FilterOperator.EQ, {
      type: FilterType.DATE,
      field: "" as any,
    }),
  );
  registerFilter(
    FilterType.NUMBER,
    createStandardFilter("number", NumberFilter, FilterOperator.EQ, {
      type: FilterType.NUMBER,
      field: "" as any,
    }),
  );
  registerFilter(
    FilterType.BOOLEAN,
    createStandardFilter("boolean", BooleanFilter, FilterOperator.EQ, {
      type: FilterType.BOOLEAN,
      field: "" as any,
    }),
  );
  registerFilter(
    FilterType.MULTI_SELECT,
    createStandardFilter("multi-select", MultiSelectFilter, FilterOperator.IN, {
      type: FilterType.MULTI_SELECT,
      field: "" as any,
    }),
  );
  registerFilter(
    FilterType.RANGE,
    createStandardFilter("range", RangeFilter, FilterOperator.BETWEEN, {
      type: FilterType.RANGE,
      field: "" as any,
    }),
  );
  registerFilter(
    FilterType.SEARCH,
    createStandardFilter("search", SearchFilter, FilterOperator.CONTAINS, {
      type: FilterType.SEARCH,
      field: "" as any,
    }),
  );
}

function registerActionItems() {
  // Register default action items
  registerRefreshToolbarItem();
  registerSearchToolbarItem();
}

function registerToolbarItems() {
  registerActionItems();
  registerFilterItems();
}

// Execute registration
registerToolbarItems();

export { registerToolbarItems, createStandardFilter, getDefaultOperator };
