// Types
export type { ParsedQuery, QueryParams, SerializeInput } from "./types.js";

// Main functions
export { parseQueryParams } from "./parser.js";
export { serializeQueryParams } from "./serializer.js";

// Operator constants and functions
export {
  LOGICAL_OPERATORS,
  COMPARISON_OPERATORS,
  OPERATORS,
  ARRAY_OPERATORS,
  type LogicalOperator,
  type ComparisonOperator,
  mapOperator,
  mapOperatorFromParam,
  isArrayOperator,
} from "./operators.js";

// Filter utilities
export {
  isLogicalFilter,
  isFieldFilter,
  createEqFilter,
  createNeFilter,
  createContainsFilter,
  createInFilter,
  createBetweenFilter,
  findFiltersByField,
  removeFiltersByField,
  updateFilterValue,
  addFilter,
  addFilters,
  setFiltersByField,
  mergeFilters,
  clearFilters,
} from "./filter.js";

// Sort utilities
export {
  createSort,
  createAscSort,
  createDescSort,
  toggleSort,
  hasSorter,
  findSorter,
  removeSorter,
  updateSorterOrder,
  reverseSorters,
  addSorter,
  addSorters,
  setSorter,
  toggleSorter,
  clearSorters,
  getSortFields,
} from "./sort.js";

// Pagination utilities
export {
  calculatePagination,
  calculatePageFromPagination,
  getTotalPages,
  hasNextPage,
  hasPrevPage,
  getNextPage,
  getPrevPage,
  setPagination,
  setPageInfo,
  nextPage,
  prevPage,
  clearPagination,
} from "./pagination.js";

// Constants
export const GLOBAL_SEARCH_FIELD = "q";
export const FILTER_PREFIX = "filters";
export const SORT_PARAM = "_sort";
export const ORDER_PARAM = "_order";
export const START_PARAM = "_start";
export const END_PARAM = "_end";
