import type {
  ConditionalFilter as RefineConditionalFilter,
  CrudOperators,
  CrudSort,
  LogicalFilter as RefineLogicalFilter,
} from "@refinedev/core";

/**
 * Extended operators that include "not" for logical operations.
 * Refine's CrudOperators doesn't include "not", but our Go implementation does,
 * so we extend the type to support it.
 */
export type ExtendedCrudOperators = CrudOperators | "not";

/**
 * Field operators only (excludes logical operators: and, or, not).
 * Used for field-level comparisons like eq, ne, lt, gt, contains, etc.
 */
export type FieldOperator = Exclude<
  ExtendedCrudOperators,
  "and" | "or" | "not"
>;

/**
 * Logical operators for combining filters (and, or, not).
 * Named type for DRY usage across the codebase.
 */
export type LogicalOperator = "and" | "or" | "not";

/**
 * Extended field-level filter that uses our FieldOperator type.
 * Extends Refine's LogicalFilter by overriding the operator type.
 */
export type LogicalFilter = Omit<RefineLogicalFilter, "operator"> & {
  operator: FieldOperator;
};

/**
 * Extended conditional filter that supports "not" operator.
 * Extends Refine's ConditionalFilter by expanding the operator and value types.
 */
export type ConditionalFilter = Omit<
  RefineConditionalFilter,
  "operator" | "value"
> & {
  operator: LogicalOperator;
  value: (LogicalFilter | ConditionalFilter)[];
};

/**
 * Union type for all filter types.
 * Ensures compatibility with both Refine and the Go queryutil implementation.
 */
export type CrudFilter = LogicalFilter | ConditionalFilter;

/**
 * Field filter with properly typed operator as FieldOperator
 */
export type FieldFilter = {
  field: string;
  operator: FieldOperator;
  value: any;
};

/**
 * Re-export CrudSort from Refine for convenience
 */
export type { CrudSort };

/**
 * Query parameters structure for serialization
 */
export interface QueryParams {
  [key: string]: string | string[];
}

/**
 * Parsed query result containing filters, sorters, and pagination
 */
export interface ParsedQuery {
  filters?: CrudFilter[];
  sorters?: CrudSort[];
  pagination?: Pagination;
}

/**
 * Pagination parameters
 */
export interface Pagination {
  start: number;
  end: number;
  page?: number;
  pageSize?: number;
}

/**
 * Input for serialization
 */
export interface SerializeInput {
  filters?: CrudFilter[];
  sorters?: CrudSort[];
  pagination?: Pagination;
}

/**
 * Filter operator mapping
 */
export type FilterOperator = CrudFilter["operator"];

/**
 * Sort direction
 */
export type SortDirection = "asc" | "desc";

/**
 * Sort configuration
 */
export interface SortConfig {
  field: string;
  order: SortDirection;
}
