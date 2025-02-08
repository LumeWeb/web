import type {
  CrudFilters,
  CrudOperators,
  LogicalFilter,
} from "@refinedev/core";

// Re-export the types from Refine for consistency
export type { CrudFilters, LogicalFilter };

export type FieldType =
  | "boolean"
  | "date"
  | "number"
  | "select"
  | "string"
  | "unknown";

/**
 * Complete definition for a filterable field. Use this when you need
 * explicit control over filter behavior.
 *
 * @example
 * {
 *   field: "status",
 *   label: "Order Status",
 *   type: "select",
 *   operators: ["eq", "ne"],
 *   options: [
 *     { label: "Pending", value: "pending" },
 *     { label: "Completed", value: "completed" }
 *   ],
 *   priority: "high"
 * }
 */
export interface FilterField {
  /** Database field name or object path */
  field: string;
  /** Whether this field appears in filter controls */
  isFilterable?: boolean;
  /** Whether this field supports full-text search */
  isSearchable?: boolean;
  /** Display label for UI rendering */
  label: string;
  /** Allowed filter operators (defaults based on type) */
  operators?: LogicalOperator[];
  /** Predefined options for select/enum fields */
  options?: FilterOption[];
  /** Visual priority in simplified filter UIs */
  priority?: "high" | "low" | "medium";
  /** Data type determines available operators and input components */
  type: FieldType;
}

// Create a dedicated type for filter options
export interface FilterOption {
  label: string;
  value: boolean | number | string;
}

export interface FilterValue {
  field: string;
  operator: LogicalOperator;
  value: any;
  value2?: any; // For "between" operator
}

/**
 * Filter comparison operators for building conditions.
 * Excludes logical combiners ("or"/"and") which are handled separately.
 *
 * @remarks
 * Common operators per type:
 * - Text: contains, eq, ne, startswith, endswith
 * - Numbers: eq, ne, gt, lt, gte, lte, between
 * - Dates: eq, ne, gt, lt, gte, lte, between
 * - Select: eq, ne
 */
export type LogicalOperator = Exclude<CrudOperators, "and" | "or">;

// Create a dedicated type for operator options
export interface OperatorOption {
  label: string;
  value: LogicalOperator;
}

// Helper function to ensure operators are LogicalOperator[]
export function ensureLogicalOperators(
  operators: any[] | undefined,
): LogicalOperator[] {
  if (!operators) return [];

  // Filter out "or" and "and" operators
  return operators.filter(
    (op) => op !== "or" && op !== "and",
  ) as LogicalOperator[];
}
