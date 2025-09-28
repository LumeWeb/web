import { useEffect, useState } from "react";
import { FilterOperator } from "@/components/data-table/toolbarItems/filters/types";

/**
 * Default operators mapping based on data types
 */
export const DEFAULT_OPERATORS: Record<string, FilterOperator> = {
  string: FilterOperator.CONTAINS,
  number: FilterOperator.EQ,
  boolean: FilterOperator.EQ,
  date: FilterOperator.GTE,
  array: FilterOperator.IN,
};

/**
 * Get available operators for a specific field type
 */
export const getAvailableOperators = (
  type: string,
): FilterOperator[] => {
  switch (type) {
    case "string":
      return [
        FilterOperator.CONTAINS,
        FilterOperator.EQ,
        FilterOperator.NE,
        FilterOperator.STARTS_WITH,
        FilterOperator.ENDS_WITH,
      ];
    case "number":
      return [
        FilterOperator.EQ,
        FilterOperator.NE,
        FilterOperator.LT,
        FilterOperator.GT,
        FilterOperator.LTE,
        FilterOperator.GTE,
      ];
    case "boolean":
      return [FilterOperator.EQ];
    case "date":
      return [
        FilterOperator.EQ,
        FilterOperator.NE,
        FilterOperator.LT,
        FilterOperator.GT,
        FilterOperator.LTE,
        FilterOperator.GTE,
      ];
    case "array":
      return [FilterOperator.IN, FilterOperator.NIN];
    default:
      return [FilterOperator.EQ, FilterOperator.NE];
  }
};

/**
 * Get default operator for a field type
 * @param fieldType - The type of field to get default operator for
 * @returns The default operator for the field type
 */
export const getDefaultOperatorForFieldType = (fieldType: string): FilterOperator => {
  return DEFAULT_OPERATORS[fieldType] || FilterOperator.EQ;
};

/**
 * Get the default operator for a field type
 */
export const getDefaultOperator = (
  type: string,
): FilterOperator => {
  return getDefaultOperatorForFieldType(type);
};

/**
 * Hook for managing filter operators with defaults based on filter type
 *
 * This hook provides a clean API for handling filter operators in components,
 * automatically setting appropriate default operators based on the data type
 * and allowing for custom operator selection.
 *
 * @template TData - The type of data being filtered
 * @param fieldType - The type of field being filtered (string, number, boolean, date, array)
 * @param initialOperator - Optional initial operator to override defaults
 * @returns An object containing the current operator and setter function
 */
export function useFilterOperators<TData = any>(
  fieldType: string,
  initialOperator?: FilterOperator,
) {
  const [operator, setOperator] = useState<FilterOperator>(
    initialOperator || DEFAULT_OPERATORS[fieldType] || FilterOperator.EQ,
  );

  /**
   * Reset operator to default for the field type
   */
  const resetOperator = () => {
    setOperator(getDefaultOperator(fieldType));
  };

  // Update operator when fieldType or initialOperator changes
  useEffect(() => {
    if (initialOperator !== undefined) {
      setOperator(initialOperator);
    } else {
      setOperator(getDefaultOperator(fieldType));
    }
  }, [fieldType, initialOperator]);

  return {
    /** Current operator */
    operator,
    /** Setter function for operator */
    setOperator,
    /** Function to get available operators for a field type */
    getAvailableOperators,
    /** Function to get default operator for a field type */
    getDefaultOperator,
    /** Function to reset operator to default */
    resetOperator,
  };
}
