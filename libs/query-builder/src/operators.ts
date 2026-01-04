import type { ExtendedCrudOperators } from "./types.js";

/**
 * Logical operators for conditional filters (including "not" to match Go implementation)
 */
export const LOGICAL_OPERATORS = {
  AND: "and",
  OR: "or",
  NOT: "not",
} as const;

export type LogicalOperator =
  (typeof LOGICAL_OPERATORS)[keyof typeof LOGICAL_OPERATORS];

/**
 * Comparison operators for field filters
 */
export const COMPARISON_OPERATORS = {
  EQ: "eq",
  NE: "ne",
  LT: "lt",
  GT: "gt",
  LTE: "lte",
  GTE: "gte",
  IN: "in",
  NIN: "nin",
  CONTAINS: "contains",
  NCONTAINS: "ncontains",
  CONTAINSS: "containss",
  NCONTAINSS: "ncontainss",
  BETWEEN: "between",
  NBETWEEN: "nbetween",
  NULL: "null",
  NNULL: "nnull",
  STARTSWITH: "startswith",
  NSTARTSWITH: "nstartswith",
  STARTSWITHS: "startswiths",
  NSTARTSWITHS: "nstartswiths",
  ENDSWITH: "endswith",
  NENDSWITH: "nendswith",
  ENDSWITHS: "endswiths",
  NENDSWITHS: "nendswiths",
  INA: "ina",
  NINA: "nina",
} as const;

export type ComparisonOperator =
  (typeof COMPARISON_OPERATORS)[keyof typeof COMPARISON_OPERATORS];

/**
 * All operators
 */
export const OPERATORS = {
  ...LOGICAL_OPERATORS,
  ...COMPARISON_OPERATORS,
} as const;

/**
 * Maps Refine operators to query parameter format
 * Empty string means the operator is omitted in the query params (default to eq)
 */
export function mapOperator(operator: ExtendedCrudOperators): string {
  const mapping: Partial<Record<ExtendedCrudOperators, string>> = {
    and: LOGICAL_OPERATORS.AND,
    or: LOGICAL_OPERATORS.OR,
    not: LOGICAL_OPERATORS.NOT,
    eq: "",
    ne: COMPARISON_OPERATORS.NE,
    lt: COMPARISON_OPERATORS.LT,
    gt: COMPARISON_OPERATORS.GT,
    lte: COMPARISON_OPERATORS.LTE,
    gte: COMPARISON_OPERATORS.GTE,
    in: COMPARISON_OPERATORS.IN,
    nin: COMPARISON_OPERATORS.NIN,
    contains: COMPARISON_OPERATORS.CONTAINS,
    ncontains: COMPARISON_OPERATORS.NCONTAINS,
    containss: COMPARISON_OPERATORS.CONTAINSS,
    ncontainss: COMPARISON_OPERATORS.NCONTAINSS,
    between: COMPARISON_OPERATORS.BETWEEN,
    nbetween: COMPARISON_OPERATORS.NBETWEEN,
    null: COMPARISON_OPERATORS.NULL,
    nnull: COMPARISON_OPERATORS.NNULL,
    startswith: COMPARISON_OPERATORS.STARTSWITH,
    nstartswith: COMPARISON_OPERATORS.NSTARTSWITH,
    startswiths: COMPARISON_OPERATORS.STARTSWITHS,
    nstartswiths: COMPARISON_OPERATORS.NSTARTSWITHS,
    endswith: COMPARISON_OPERATORS.ENDSWITH,
    nendswith: COMPARISON_OPERATORS.NENDSWITH,
    endswiths: COMPARISON_OPERATORS.ENDSWITHS,
    nendswiths: COMPARISON_OPERATORS.NENDSWITHS,
    ina: COMPARISON_OPERATORS.INA,
    nina: COMPARISON_OPERATORS.NINA,
  };

  const mapped = mapping[operator];
  if (mapped === undefined) {
    throw new Error(`Unsupported operator: ${operator}`);
  }
  return mapped;
}

/**
 * Maps query parameter operator back to Refine operator
 */
export function mapOperatorFromParam(operator: string): ExtendedCrudOperators {
  const mapping: Record<string, ExtendedCrudOperators> = {
    "": COMPARISON_OPERATORS.EQ,
    "eq": COMPARISON_OPERATORS.EQ,
    "ne": COMPARISON_OPERATORS.NE,
    "neq": COMPARISON_OPERATORS.NE,
    "lt": COMPARISON_OPERATORS.LT,
    "gt": COMPARISON_OPERATORS.GT,
    "lte": COMPARISON_OPERATORS.LTE,
    "gte": COMPARISON_OPERATORS.GTE,
    "in": COMPARISON_OPERATORS.IN,
    "nin": COMPARISON_OPERATORS.NIN,
    "contains": COMPARISON_OPERATORS.CONTAINS,
    "ncontains": COMPARISON_OPERATORS.NCONTAINS,
    "containss": COMPARISON_OPERATORS.CONTAINSS,
    "ncontainss": COMPARISON_OPERATORS.NCONTAINSS,
    "between": COMPARISON_OPERATORS.BETWEEN,
    "nbetween": COMPARISON_OPERATORS.NBETWEEN,
    "null": COMPARISON_OPERATORS.NULL,
    "nnull": COMPARISON_OPERATORS.NNULL,
    "startswith": COMPARISON_OPERATORS.STARTSWITH,
    "nstartswith": COMPARISON_OPERATORS.NSTARTSWITH,
    "startswiths": COMPARISON_OPERATORS.STARTSWITHS,
    "nstartswiths": COMPARISON_OPERATORS.NSTARTSWITHS,
    "endswith": COMPARISON_OPERATORS.ENDSWITH,
    "nendswith": COMPARISON_OPERATORS.NENDSWITH,
    "endswiths": COMPARISON_OPERATORS.ENDSWITHS,
    "nendswiths": COMPARISON_OPERATORS.NENDSWITHS,
    "ina": COMPARISON_OPERATORS.INA,
    "nina": COMPARISON_OPERATORS.NINA,
    "not": LOGICAL_OPERATORS.NOT,
  };

  const mapped = mapping[operator];
  if (mapped === undefined) {
    throw new Error(`Unsupported operator parameter: ${operator}`);
  }
  return mapped;
}

/**
 * Operators that require array values
 */
export const ARRAY_OPERATORS = new Set<ComparisonOperator>([
  COMPARISON_OPERATORS.IN,
  COMPARISON_OPERATORS.NIN,
  COMPARISON_OPERATORS.INA,
  COMPARISON_OPERATORS.NINA,
  COMPARISON_OPERATORS.BETWEEN,
  COMPARISON_OPERATORS.NBETWEEN,
]);

/**
 * Check if an operator requires array values
 */
export function isArrayOperator(operator: string): boolean {
  return ARRAY_OPERATORS.has(operator as ComparisonOperator);
}
