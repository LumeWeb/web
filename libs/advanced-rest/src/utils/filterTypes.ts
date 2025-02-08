import { CrudOperators } from "@refinedev/core";

export type FilterCondition = {
  field?: string;
  operator: FilterOperator;
  value: any;
  logical?: "and" | "or";
};

export type FilterOperator = CrudOperators;

export type Sort = {
  field: string;
  order: "asc" | "desc";
};

export type QueryParams = {
  filters?: FilterCondition[];
  sorters?: Sort[];
  pagination?: {
    page: number;
    pageSize: number;
  };
};

// Removed duplicate declaration of Sort and FilterCondition

// The FilterCondition type below seems to be an alternative definition,
// potentially for a different use case or an older version.
// Given the error points to 'Sort' and the first definition of Sort
// matches the usage in generateSort.ts, I will keep the first definitions
// and remove the second set which includes the duplicate Sort and a different
// structure for FilterCondition.

/*
export type Sort = {
  field: string;
  direction: "asc" | "desc";
};

export type FilterCondition =
  | {
      field: string;
      operator: FilterOperator;
      value: any;
    }
  | {
      logical: "and" | "or";
      value: FilterCondition[];
    };
*/
