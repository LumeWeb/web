import type { ConditionalFilter, CrudFilter, LogicalFilter } from "./types.js";

export type CrudFilters = CrudFilter[];

/**
 * Checks if a filter is a conditional filter (and/or/not)
 */
export function isLogicalFilter(
  filter: CrudFilter,
): filter is ConditionalFilter {
  return (
    filter.operator === "and" ||
    filter.operator === "or" ||
    filter.operator === "not"
  );
}

/**
 * Checks if a filter is a field filter (has a field property)
 */
export function isFieldFilter(filter: CrudFilter): filter is LogicalFilter {
  return "field" in filter;
}

/**
 * Checks if a filter has a specific operator
 */
export function hasOperator(
  filter: CrudFilter,
  operator: CrudFilter["operator"],
): boolean {
  return filter.operator === operator;
}

/**
 * Finds all filters for a specific field
 */
export function findFiltersByField(
  filters: CrudFilters,
  field: string,
): CrudFilter[] {
  return filters.filter((f) => "field" in f && f.field === field);
}

/**
 * Removes filters for a specific field
 */
export function removeFiltersByField(
  filters: CrudFilters,
  field: string,
): CrudFilters {
  const newFilters: CrudFilter[] = [];

  for (const filter of filters) {
    if (isFieldFilter(filter)) {
      if (filter.field !== field) {
        newFilters.push(filter);
      }
    } else if (isLogicalFilter(filter)) {
      const nestedFilters = removeFiltersByField(filter.value, field);
      // Only keep the logical filter if it still contains nested filters
      if (nestedFilters.length > 0) {
        newFilters.push({
          ...filter,
          value: nestedFilters,
        });
      }
    }
  }

  return newFilters;
}

/**
 * Updates a filter value for a specific field and operator
 */
export function updateFilterValue(
  filters: CrudFilters,
  field: string,
  operator: CrudFilter["operator"],
  value: any,
): CrudFilters {
  return filters.map((f) => {
    if ("field" in f && f.field === field && f.operator === operator) {
      return { ...f, value };
    }
    return f;
  });
}

/**
 * Creates a simple equality filter
 */
export function createEqFilter(field: string, value: any): CrudFilter {
  return { field, operator: "eq", value };
}

/**
 * Creates a not equals filter
 */
export function createNeFilter(field: string, value: any): CrudFilter {
  return { field, operator: "ne", value };
}

/**
 * Creates a contains filter
 */
export function createContainsFilter(field: string, value: string): CrudFilter {
  return { field, operator: "contains", value };
}

/**
 * Creates an IN filter
 */
export function createInFilter(field: string, values: any[]): CrudFilter {
  return { field, operator: "in", value: values };
}

/**
 * Creates a range filter (between)
 */
export function createBetweenFilter(
  field: string,
  start: any,
  end: any,
): CrudFilter {
  return { field, operator: "between", value: [start, end] };
}

/**
 * Adds a filter to the filters array (immutable)
 */
export function addFilter(
  filters: CrudFilters,
  filter: CrudFilter,
): CrudFilters {
  return [...filters, filter];
}

/**
 * Adds multiple filters to the filters array (immutable)
 */
export function addFilters(
  filters: CrudFilters,
  newFilters: CrudFilters,
): CrudFilters {
  return [...filters, ...newFilters];
}

/**
 * Replaces all filters for a specific field (immutable)
 */
export function setFiltersByField(
  filters: CrudFilters,
  field: string,
  newFilters: CrudFilter[],
): CrudFilters {
  const withoutField = removeFiltersByField(filters, field);
  return [...withoutField, ...newFilters];
}

/**
 * Merges filters into existing filters (immutable)
 */
export function mergeFilters(
  filters: CrudFilters,
  additionalFilters: CrudFilters,
): CrudFilters {
  return [...filters, ...additionalFilters];
}

/**
 * Clears all filters (immutable)
 */
export function clearFilters(filters: CrudFilters): CrudFilters {
  return [];
}
