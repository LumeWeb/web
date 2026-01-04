import type {
  CrudFilter,
  CrudSort,
  QueryParams,
  SerializeInput,
} from "./types.js";
import {
  isArrayOperator,
  LOGICAL_OPERATORS,
  mapOperator,
} from "./operators.js";

export type CrudFilters = CrudFilter[];

/**
 * Serializes Refine filters and sorters to URL query parameters
 */
export function serializeQueryParams(input: SerializeInput): QueryParams {
  const params: QueryParams = {};

  if (input.filters) {
    const filterParams = serializeFilters(input.filters);
    Object.assign(params, filterParams);
  }

  if (input.sorters) {
    const sortParams = serializeSorters(input.sorters);
    Object.assign(params, sortParams);
  }

  if (input.pagination) {
    const paginationParams = serializePagination(input.pagination);
    Object.assign(params, paginationParams);
  }

  return params;
}

/**
 * Serializes array operator with indexed parameters
 */
function serializeArrayOperator(
  field: string,
  operator: string,
  values: any[],
  basePath: string[],
  params: QueryParams,
): void {
  const arrayBasePath = [...basePath, field, operator];
  for (let i = 0; i < values.length; i++) {
    const finalPath = [...arrayBasePath, String(i)];
    const key = buildPath(finalPath);
    params[key] = encodeURIComponent(String(values[i]));
  }
}

/**
 * Serializes filters to query parameters
 */
function serializeFilters(filters: CrudFilters): QueryParams {
  const params: QueryParams = {};
  let hasGlobalSearch = false;

  for (const filter of filters) {
    if (filter.operator === LOGICAL_OPERATORS.OR) {
      serializeOrCondition(filter, params);
    } else if (filter.operator === LOGICAL_OPERATORS.AND) {
      serializeAndCondition(filter, params);
    } else if (filter.operator === LOGICAL_OPERATORS.NOT) {
      serializeNotCondition(filter, params);
    } else if ("field" in filter) {
      if (filter.field === "q") {
        if (hasGlobalSearch) {
          console.warn("Only one global search (q) filter allowed");
          continue;
        }
        hasGlobalSearch = true;
        const processed = processCondition(filter);
        if (processed) {
          params[processed.path.join("")] = processed.value;
        }
      } else {
        // Handle array operators with indexed parameters
        if (isArrayOperator(filter.operator) && Array.isArray(filter.value)) {
          serializeArrayOperator(
            filter.field,
            filter.operator,
            filter.value,
            ["filters"],
            params,
          );
        } else {
          const processed = processCondition(filter);
          if (processed) {
            const finalPath = ["filters", ...processed.path];
            const key = buildPath(finalPath);
            params[key] = processed.value;
          }
        }
      }
    }
  }

  return params;
}

/**
 * Serializes a logical condition (AND, OR, NOT)
 */
function serializeLogicalCondition(
  filter: CrudFilters[number],
  operator: string,
  params: QueryParams,
): void {
  if (filter.operator !== operator || !Array.isArray(filter.value)) {
    return;
  }

  const basePath = ["filters", operator];
  const startIndex = 0;

  for (let i = 0; i < filter.value.length; i++) {
    const condition = filter.value[i];
    const conditionPath = [...basePath, String(startIndex + i)];

    serializeCondition(condition, conditionPath, params);
  }
}

/**
 * Serializes a condition (field filter or nested logical)
 */
function serializeCondition(
  condition: any,
  basePath: string[],
  params: QueryParams,
): void {
  // Check for array operators FIRST (before checking for nested logical operators)
  if (
    "operator" in condition &&
    isArrayOperator(condition.operator) &&
    Array.isArray(condition.value)
  ) {
    serializeArrayOperator(
      condition.field,
      condition.operator,
      condition.value,
      basePath,
      params,
    );
  } else if ("operator" in condition && Array.isArray(condition.value)) {
    // Nested logical condition (AND, OR, NOT)
    serializeNestedCondition(condition, basePath, params);
  } else {
    const processed = processCondition(condition);
    if (processed) {
      const finalPath = [...basePath, ...processed.path];
      const key = buildPath(finalPath);
      params[key] = processed.value;
    }
  }
}

/**
 * Serializes an OR condition
 */
function serializeOrCondition(
  filter: CrudFilters[number],
  params: QueryParams,
): void {
  serializeLogicalCondition(filter, LOGICAL_OPERATORS.OR, params);
}

/**
 * Serializes an AND condition
 */
function serializeAndCondition(
  filter: CrudFilters[number],
  params: QueryParams,
): void {
  serializeLogicalCondition(filter, LOGICAL_OPERATORS.AND, params);
}

/**
 * Serializes a NOT condition
 */
function serializeNotCondition(
  filter: CrudFilters[number],
  params: QueryParams,
): void {
  serializeLogicalCondition(filter, LOGICAL_OPERATORS.NOT, params);
}

/**
 * Serializes a nested condition (AND, OR, NOT) within another condition
 */
function serializeNestedCondition(
  filter: CrudFilters[number],
  basePath: string[],
  params: QueryParams,
): void {
  if (!("operator" in filter) || !Array.isArray(filter.value)) {
    return;
  }

  const op = filter.operator;
  if (
    op !== LOGICAL_OPERATORS.AND &&
    op !== LOGICAL_OPERATORS.OR &&
    op !== LOGICAL_OPERATORS.NOT
  ) {
    return;
  }

  const conditionPath = [...basePath, op];

  for (let i = 0; i < filter.value.length; i++) {
    const condition = filter.value[i];
    const subConditionPath = [...conditionPath, String(i)];

    // Check for array operators FIRST (before checking for nested logical operators)
    if (
      "field" in condition &&
      "operator" in condition &&
      isArrayOperator(condition.operator) &&
      Array.isArray(condition.value)
    ) {
      // Array operator with indexed parameters
      const basePath2 = [
        ...subConditionPath,
        condition.field,
        condition.operator,
      ];
      for (let j = 0; j < condition.value.length; j++) {
        const finalPath = [...basePath2, String(j)];
        const key = buildPath(finalPath);
        params[key] = encodeURIComponent(String(condition.value[j]));
      }
    } else if ("operator" in condition && Array.isArray(condition.value)) {
      serializeNestedCondition(condition, subConditionPath, params);
    } else if ("field" in condition) {
      const processed = processCondition(condition);
      if (processed) {
        const finalPath = [...subConditionPath, ...processed.path];
        const key = buildPath(finalPath);
        params[key] = processed.value;
      }
    }
  }
}

/**
 * Processes a single filter condition
 */
function processCondition(
  condition: any,
): { path: string[]; value: string } | null {
  // Skip nested AND/OR/NOT conditions - they should be handled by their respective serialization functions
  if ("operator" in condition && Array.isArray(condition.value)) {
    const op = condition.operator;
    if (
      op === LOGICAL_OPERATORS.AND ||
      op === LOGICAL_OPERATORS.OR ||
      op === LOGICAL_OPERATORS.NOT
    ) {
      return null;
    }
  }

  if (condition.field === "q") {
    return { path: ["q"], value: encodeURIComponent(String(condition.value)) };
  }

  if (!condition.field) {
    return null;
  }

  let value: any = condition.value;
  const path = [condition.field];

  try {
    const operator = mapOperator(condition.operator);
    if (operator) {
      path.push(operator);
    }
  } catch (e) {
    // Allow custom/unknown operators to pass through for extensibility
    if (condition.operator) {
      path.push(String(condition.operator));
    }
  }

  // Handle null/nnull operators
  if (condition.operator === "null" || condition.operator === "nnull") {
    value = "";
  } else {
    value = encodeURIComponent(String(value));
  }

  return { path, value };
}

/**
 * Builds a bracketed path from segments
 */
function buildPath(segments: string[]): string {
  return segments.reduce((acc, segment) => {
    return acc ? `${acc}[${segment}]` : segment;
  }, "");
}

/**
 * Serializes sorters to query parameters
 */
function serializeSorters(sorters: CrudSort[]): QueryParams {
  if (!sorters?.length) {
    return {};
  }

  const validSorters = sorters.filter(
    (s) =>
      s.field &&
      (s.order === undefined ||
        ["asc", "desc"].includes(s.order.toLowerCase())),
  );

  if (!validSorters.length) {
    return {};
  }

  return {
    _sort: validSorters.map((s) => encodeURIComponent(s.field)).join(","),
    _order: validSorters
      .map((s) => encodeURIComponent(s.order?.toLowerCase() || "asc"))
      .join(","),
  };
}

/**
 * Serializes pagination to query parameters
 */
function serializePagination(
  pagination: SerializeInput["pagination"],
): QueryParams {
  if (!pagination) {
    return {};
  }

  const params: QueryParams = {};

  if (pagination.start !== undefined) {
    params._start = String(pagination.start);
  }

  if (pagination.end !== undefined) {
    params._end = String(pagination.end);
  }

  return params;
}
