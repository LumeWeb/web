/**
 * Query utilities for operations API
 * 
 * Provides types and functions for building query parameters with filters,
 * sorters, and pagination using the @lumeweb/query-builder library.
 */

// Import types and functions from query-builder
import type {
  ParsedQuery,
  QueryParams,
  SerializeInput,
} from "@lumeweb/query-builder";
import {
  serializeQueryParams,
  calculatePagination,
  createEqFilter,
  createNeFilter,
  createContainsFilter,
  createInFilter,
  createBetweenFilter,
  createSort,
  createAscSort,
  createDescSort,
  addFilter,
  addFilters,
  addSorter,
  addSorters,
  setFiltersByField,
  setSorter,
  clearFilters,
  clearSorters,
  LOGICAL_OPERATORS,
  COMPARISON_OPERATORS,
  OPERATORS,
  ARRAY_OPERATORS,
} from "@lumeweb/query-builder";

// Re-export types
export type { ParsedQuery, QueryParams, SerializeInput };

// Re-export functions
export {
  serializeQueryParams,
  calculatePagination,
  createEqFilter,
  createNeFilter,
  createContainsFilter,
  createInFilter,
  createBetweenFilter,
  createSort,
  createAscSort,
  createDescSort,
  addFilter,
  addFilters,
  addSorter,
  addSorters,
  setFiltersByField,
  setSorter,
  clearFilters,
  clearSorters,
  LOGICAL_OPERATORS,
  COMPARISON_OPERATORS,
  OPERATORS,
  ARRAY_OPERATORS,
};

/**
 * Operations query parameters for the operations API
 * 
 * Uses query-builder helpers to construct the API query parameters:
 * - filters: Array of filter objects → serialized to filters[field][operator]=value
 * - sorters: Array of sort objects → serialized to _sort=field&_order=direction
 * - pagination: Object with start/end → serialized to _start=0&_end=20
 * - search: Search term → passed directly as search=value
 * 
 * @example
 * ```ts
 * const params: OperationsQueryParams = {
 *   filters: [
 *     { field: "status", operator: "eq", value: "completed" },
 *     { field: "operation", operator: "in", value: ["upload", "download"] }
 *   ],
 *   sorters: [{ field: "id", order: "desc" }],
 *   pagination: { start: 0, end: 20, page: 1, pageSize: 20 },
 *   search: "myfile"
 * };
 * ```
 */
export interface OperationsQueryParams extends SerializeInput {
  /** Search term for filename or other relevant operation data */
  search?: string;
}

/**
 * Unified operations query parameters
 */
export type OperationsListParams = OperationsQueryParams;

/**
 * Builds URL query parameters for operations API
 * 
 * Serializes query-builder parameters to the API's expected format:
 * - filters → filters[field][operator]=value
 * - sorters → _sort=field&_order=direction
 * - pagination → _start=0&_end=20
 * - search → search=value
 * 
 * @param params - Query parameters using query-builder helpers
 * @returns URLSearchParams object ready to use with fetch
 * 
 * @example
 * ```ts
 * const searchParams = buildOperationsQueryParams({
 *   filters: [
 *     { field: "status", operator: "eq", value: "completed" },
 *     { field: "operation", operator: "in", value: ["upload", "download"] }
 *   ],
 *   sorters: [{ field: "id", order: "desc" }],
 *   pagination: { start: 0, end: 20, page: 1, pageSize: 20 },
 *   search: "myfile"
 * });
 * 
 * // Result URL: ?filters[status][eq]=completed&filters[operation][in][0]=upload&filters[operation][in][1]=download&_sort=id&_order=desc&_start=0&_end=20&search=myfile
 * ```
 */
export function buildOperationsQueryParams(params: OperationsQueryParams): URLSearchParams {
  const queryParams = serializeQueryParams({
    filters: params.filters,
    sorters: params.sorters,
    pagination: params.pagination,
  });

  const searchParams = new URLSearchParams();

  // Add serialized query parameters
  for (const [key, value] of Object.entries(queryParams)) {
    if (Array.isArray(value)) {
      for (const v of value) {
        searchParams.append(key, v);
      }
    } else {
      searchParams.set(key, value);
    }
  }

  // Add search parameter if provided
  if (params.search) {
    searchParams.set("search", params.search);
  }

  return searchParams;
}
