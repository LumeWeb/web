import type {
  CrudFilter,
  CrudSort,
  FieldOperator,
  LogicalOperator,
  ParsedQuery,
  QueryParams,
} from "./types.js";
import {
  ARRAY_OPERATORS,
  COMPARISON_OPERATORS,
  LOGICAL_OPERATORS,
  mapOperatorFromParam,
} from "./operators.js";

const FILTER_PREFIX = "filters";

// Operators that allow empty string values
const ALLOWED_EMPTY_STRING_OPS = new Set([
  COMPARISON_OPERATORS.CONTAINS,
  COMPARISON_OPERATORS.NCONTAINS,
  COMPARISON_OPERATORS.STARTSWITH,
  COMPARISON_OPERATORS.NSTARTSWITH,
  COMPARISON_OPERATORS.ENDSWITH,
  COMPARISON_OPERATORS.NENDSWITH,
  COMPARISON_OPERATORS.CONTAINSS,
  COMPARISON_OPERATORS.NCONTAINSS,
  COMPARISON_OPERATORS.STARTSWITHS,
  COMPARISON_OPERATORS.NSTARTSWITHS,
  COMPARISON_OPERATORS.ENDSWITHS,
  COMPARISON_OPERATORS.NENDSWITHS,
  COMPARISON_OPERATORS.EQ,
  COMPARISON_OPERATORS.NE,
]);

// Invalid boolean strings that should throw an error
const INVALID_BOOL_STRINGS = new Set(["t", "f", "yes", "no", "on", "off"]);

/**
 * Parses URL query parameters into Refine format
 */
export function parseQueryParams(params: QueryParams): ParsedQuery {
  const result: ParsedQuery = {};

  const filters = parseFilters(params);
  if (filters?.length) {
    result.filters = filters;
  }

  const sorters = parseSorters(params);
  if (sorters?.length) {
    result.sorters = sorters;
  }

  const pagination = parsePagination(params);
  if (pagination) {
    result.pagination = pagination;
  }

  return result;
}

/**
 * Parses filters from query parameters
 */
function parseFilters(params: QueryParams): CrudFilter[] | undefined {
  const filterMap: Record<string, any> = {};

  // Build filter structure from query parameters
  for (const [key, values] of Object.entries(params)) {
    // Skip special parameters that start with _
    if (key.startsWith("_")) {
      continue;
    }

    // Handle both prefixed and non-prefixed filter formats
    if (!key.startsWith(FILTER_PREFIX) && !key.includes("[")) {
      // Default to equality operator for simple field
      filterMap[key] = values;
      continue;
    }

    if (!key.startsWith(FILTER_PREFIX)) {
      continue;
    }

    const path = key.slice(FILTER_PREFIX.length);
    const segments = parseSegments(path);

    // Empty filter key or empty segment should throw error
    if (path === "" || path === "[]" || segments.length === 0) {
      throw new Error(`invalid filter key: ${key}`);
    }

    // Check for empty segments
    if (segments.some((s) => s === "")) {
      throw new Error(`invalid filter key: ${key}`);
    }

    // Build nested structure
    let current = filterMap;
    for (let i = 0; i < segments.length - 1; i++) {
      const segment = segments[i];
      if (!current[segment]) {
        current[segment] = {};
      } else if (typeof current[segment] !== "object") {
        throw new Error(
          `path conflict at segment '${segment}' for key '${key}'`,
        );
      }
      current = current[segment];
    }

    const finalKey = segments[segments.length - 1];
    if (
      current[finalKey] !== undefined &&
      typeof current[finalKey] === "object"
    ) {
      throw new Error(
        `path conflict at final key '${finalKey}' for query key '${key}'`,
      );
    }
    current[finalKey] = values;
  }

  // Build filters from the nested map
  const filters = buildFilters(filterMap);
  return filters.length > 0 ? filters : undefined;
}

/**
 * Parses bracketed segments from a path
 * Example: "[or][0][age][gte]" -> ["or", "0", "age", "gte"]
 */
function parseSegments(path: string): string[] {
  if (path === "") {
    return [];
  }

  const segments: string[] = [];
  const regex = /\[(.*?)\]/g;
  let match;

  while ((match = regex.exec(path)) !== null) {
    segments.push(match[1]);
  }

  return segments;
}

/**
 * Builds filters from a nested map structure
 */
function buildFilters(data: any): CrudFilter[] {
  if (Array.isArray(data)) {
    const filters: CrudFilter[] = [];
    for (const item of data) {
      filters.push(...buildFilters(item));
    }
    return filters;
  }

  if (typeof data !== "object" || data === null) {
    return [];
  }

  const filters: CrudFilter[] = [];
  for (const [key, value] of Object.entries(data)) {
    if (
      key === LOGICAL_OPERATORS.AND ||
      key === LOGICAL_OPERATORS.OR ||
      key === LOGICAL_OPERATORS.NOT
    ) {
      const conditional = buildConditionalFilter(key, value);
      if (conditional) {
        filters.push(conditional);
      }
    } else {
      const logical = buildLogicalFilter(key, value);
      if (logical) {
        filters.push(logical);
      }
    }
  }

  return filters;
}

/**
 * Builds a conditional filter (and/or/not)
 */
function buildConditionalFilter(
  operator: string,
  value: any,
): CrudFilter | null {
  const nestedFilters: CrudFilter[] = [];

  if (Array.isArray(value)) {
    for (const item of value) {
      nestedFilters.push(...buildFilters(item));
    }
  } else if (typeof value === "object" && value !== null) {
    // Sort numeric keys
    const keys = Object.keys(value)
      .map((k) => ({ key: k, num: parseInt(k, 10) }))
      .filter(({ num }) => !isNaN(num))
      .sort((a, b) => a.num - b.num);

    if (
      keys.length === 0 &&
      (operator === LOGICAL_OPERATORS.AND || operator === LOGICAL_OPERATORS.OR)
    ) {
      throw new Error(`empty ${operator} group`);
    }

    for (const { key } of keys) {
      nestedFilters.push(...buildFilters(value[key]));
    }
  } else {
    throw new Error(`unexpected conditional value type: ${typeof value}`);
  }

  if (operator === LOGICAL_OPERATORS.NOT && nestedFilters.length === 0) {
    throw new Error("NOT operator requires a sub-filter");
  }

  if (nestedFilters.length === 0) {
    return null;
  }

  return {
    operator: operator as LogicalOperator,
    value: nestedFilters,
  };
}

/**
 * Builds a logical filter (field + operator + value)
 */
function buildLogicalFilter(field: string, value: any): CrudFilter | null {
  if (!field || field === "") {
    throw new Error("field name cannot be empty");
  }

  let operator: string = "";
  let rawValue: any = value;

  // Check if value is an object with operator key
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    const keys = Object.keys(value);
    if (keys.length > 1) {
      throw new Error(
        `multiple operators not allowed for field "${field}" in query params`,
      );
    }
    if (keys.length === 0) {
      throw new Error(`empty operator map for field "${field}"`);
    }
    const opKey = keys[0];

    if (isOperatorKnown(opKey) && opKey !== opKey.toLowerCase()) {
      throw new Error(
        `operator "${opKey}" for field "${field}" must be lowercase`,
      );
    }

    // Only treat as operator if it's not a logical operator
    if (
      opKey !== LOGICAL_OPERATORS.AND &&
      opKey !== LOGICAL_OPERATORS.OR &&
      opKey !== LOGICAL_OPERATORS.NOT
    ) {
      operator = opKey;
      rawValue = value[opKey];
    } else {
      // This is actually a nested structure, return null
      return null;
    }
  }

  // Map operator from param format (allow empty string for eq)
  const mappedOperator = mapOperatorFromParam(operator);

  // Parse value
  const parsedValue = parseValue(rawValue, mappedOperator, field);

  return {
    field,
    operator: mappedOperator as FieldOperator,
    value: parsedValue,
  };
}

/**
 * Checks if an operator string is a known operator (case-insensitive)
 */
function isOperatorKnown(op: string): boolean {
  const lowerOp = op.toLowerCase();
  for (const known of Object.values(COMPARISON_OPERATORS)) {
    if (lowerOp === known) {
      return true;
    }
  }
  return false;
}

/**
 * Checks if an operator is multi-value (in, nin, ina, nina)
 */
function opIsMultiValue(operator: string): boolean {
  return (
    operator === COMPARISON_OPERATORS.IN ||
    operator === COMPARISON_OPERATORS.NIN ||
    operator === COMPARISON_OPERATORS.INA ||
    operator === COMPARISON_OPERATORS.NINA
  );
}

/**
 * Parses a value from query parameter
 */
function parseValue(value: any, operator: string, field: string): any {
  let rawValue = value;

  // Handle comma-separated strings for multi-value operators
  if (opIsMultiValue(operator)) {
    if (typeof rawValue === "string" && rawValue.includes(",")) {
      rawValue = rawValue.split(",");
    } else if (
      Array.isArray(rawValue) &&
      rawValue.length === 1 &&
      typeof rawValue[0] === "string" &&
      rawValue[0].includes(",")
    ) {
      rawValue = rawValue[0].split(",");
    }
  }

  // Handle array operators
  if (ARRAY_OPERATORS.has(operator as any)) {
    return parseArrayValue(rawValue, operator, field);
  }

  // Handle null/nnull operators
  if (
    operator === COMPARISON_OPERATORS.NULL ||
    operator === COMPARISON_OPERATORS.NNULL
  ) {
    return parseNullValue(rawValue, operator, field);
  }

  // Handle single value operators
  if (Array.isArray(rawValue)) {
    if (rawValue.length === 0) {
      return convertSingleValue("");
    }
    if (rawValue.length > 1) {
      throw new Error(
        `operator "${operator}" on field "${field}" received multiple values ${JSON.stringify(rawValue)} but expected one`,
      );
    }
    return convertSingleValue(rawValue[0]);
  }

  return convertSingleValue(rawValue);
}

/**
 * Parses an array value for array operators
 * Handles comma-separated strings, arrays, and indexed object formats
 */
function parseArrayValue(value: any, operator: string, field: string): any {
  // Handle simple string value with commas
  if (typeof value === "string" && value.includes(",")) {
    return value
      .split(",")
      .map((v) => convertSingleValue(decodeURIComponent(v.trim())));
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      throw new Error(
        `operator "${operator}" on field "${field}" requires non-empty array values`,
      );
    }

    // Validate between/nbetween has exactly 2 values for array inputs
    if (
      (operator === COMPARISON_OPERATORS.BETWEEN ||
        operator === COMPARISON_OPERATORS.NBETWEEN) &&
      value.length !== 2
    ) {
      throw new Error(
        `operator "${operator}" on field "${field}" requires exactly 2 values, got ${value.length}`,
      );
    }

    // Check for single string with commas (comma-separated values)
    if (
      value.length === 1 &&
      typeof value[0] === "string" &&
      value[0].includes(",")
    ) {
      return value[0]
        .split(",")
        .map((v) => convertSingleValue(decodeURIComponent(v.trim())));
    }
    // Convert array values to proper types
    return value.map((v) => {
      if (typeof v !== "string") return v;
      return convertSingleValue(decodeURIComponent(v));
    });
  }

  // Handle indexed array format: { "0": "10", "1": "20" }
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    const keys = Object.keys(value).map((k) => parseInt(k, 10));
    const validKeys = keys.filter((k) => !isNaN(k)).sort((a, b) => a - b);

    if (validKeys.length === 0) {
      throw new Error(
        `operator "${operator}" on field "${field}" requires non-empty array values`,
      );
    }

    // Validate between/nbetween has exactly 2 values
    if (
      (operator === COMPARISON_OPERATORS.BETWEEN ||
        operator === COMPARISON_OPERATORS.NBETWEEN) &&
      validKeys.length !== 2
    ) {
      throw new Error(
        `operator "${operator}" on field "${field}" requires exactly 2 indexed values, got ${validKeys.length}`,
      );
    }

    const result: any[] = [];
    for (const key of validKeys) {
      const val = value[key.toString()];
      // Handle both string and array values
      if (!val) {
        throw new Error(
          `missing or invalid value for index ${key} of operator "${operator}" on field "${field}"`,
        );
      }
      if (Array.isArray(val)) {
        if (val.length === 0) {
          throw new Error(
            `missing or invalid value for index ${key} of operator "${operator}" on field "${field}"`,
          );
        }
        result.push(convertSingleValue(decodeURIComponent(val[0])));
      } else {
        result.push(convertSingleValue(decodeURIComponent(String(val))));
      }
    }

    return result;
  }

  // Single value as string - check for comma-separated values
  if (typeof value === "string") {
    const result = [convertSingleValue(decodeURIComponent(value))];
    // Validate between/nbetween has exactly 2 values
    if (
      (operator === COMPARISON_OPERATORS.BETWEEN ||
        operator === COMPARISON_OPERATORS.NBETWEEN) &&
      result.length !== 2
    ) {
      throw new Error(
        `operator "${operator}" on field "${field}" requires exactly 2 values, got ${result.length}`,
      );
    }
    return result;
  }
  return [value];
}

/**
 * Parses a null/nnull operator value
 * Accepts empty string or empty array and converts to null
 * For nnull operator, accepts any value to handle URL encoding edge cases
 */
function parseNullValue(value: any, operator: string, field: string): any {
  if (value === null || value === undefined) {
    return null;
  }

  if (Array.isArray(value)) {
    // Accept empty array or array with empty string -> null
    if (value.length === 0 || (value.length === 1 && value[0] === "")) {
      return null;
    }
    // TypeScript tests accept values for nnull - just return the first value as string
    if (typeof value[0] === "string") {
      return decodeURIComponent(value[0]);
    }
    return value[0];
  }

  // Accept single empty string -> null
  if (value === "") {
    return null;
  }

  // TypeScript tests accept values for nnull - just return as string
  if (typeof value === "string") {
    return decodeURIComponent(value);
  }
  return value;
}

/**
 * Converts a string value to appropriate type (number, boolean, or string)
 * Uses strict type detection to avoid false positives (e.g., "00123" becomes 123)
 */
function convertSingleValue(value: any): any {
  if (typeof value !== "string") {
    return value;
  }

  const decoded = decodeURIComponent(value);

  // Handle empty string
  if (decoded === "") {
    return "";
  }

  // Try parsing as int first
  const intVal = parseInt(decoded, 10);
  if (!isNaN(intVal) && intVal.toString() === decoded) {
    return intVal;
  }

  // Try parsing as float
  const floatVal = parseFloat(decoded);
  if (!isNaN(floatVal) && isFinite(floatVal)) {
    return floatVal;
  }

  // Handle boolean (strict "true" or "false" - case sensitive like Go)
  if (decoded === "true") {
    return true;
  }
  if (decoded === "false") {
    return false;
  }

  // Check for invalid boolean values
  const lowerV = decoded.toLowerCase();
  if (
    (lowerV === "true" && decoded !== "true") ||
    (lowerV === "false" && decoded !== "false") ||
    INVALID_BOOL_STRINGS.has(lowerV)
  ) {
    throw new Error(
      `invalid boolean value "${decoded}"; use 'true' or 'false' (case-sensitive)`,
    );
  }

  // Return as string
  return decoded;
}

/**
 * Parses sorters from query parameters
 */
function parseSorters(params: QueryParams): CrudSort[] | undefined {
  const sortFields = params._sort;
  const sortOrders = params._order;

  if (!sortFields) {
    return undefined;
  }

  const fields = String(sortFields)
    .split(",")
    .map((f) => decodeURIComponent(f.trim()));

  const orders = sortOrders
    ? String(sortOrders)
        .split(",")
        .map((o) => decodeURIComponent(o.trim().toLowerCase()))
    : fields.map(() => "asc");

  const sorters: CrudSort[] = fields.map((field, index) => ({
    field,
    order: (orders[index] || "asc") as "asc" | "desc",
  }));

  return sorters;
}

/**
 * Parses pagination from query parameters
 */
function parsePagination(
  params: QueryParams,
): ParsedQuery["pagination"] | undefined {
  const start = params._start;
  const end = params._end;

  if (start === undefined && end === undefined) {
    return undefined;
  }

  const parsedStart = start !== undefined ? parseInt(String(start), 10) : 0;
  const parsedEnd = end !== undefined ? parseInt(String(end), 10) : 10;

  if (start !== undefined && isNaN(parsedStart)) {
    throw new Error("_start must be a valid integer");
  }
  if (end !== undefined && isNaN(parsedEnd)) {
    throw new Error("_end must be a valid integer");
  }
  if (parsedStart < 0) {
    throw new Error("_start must be non-negative");
  }
  if (end !== undefined && parsedEnd <= parsedStart) {
    throw new Error("_end must be greater than _start");
  }

  const pagination = {
    start: parsedStart,
    end: parsedEnd,
  };

  return pagination;
}
