import { registerBridgedContext } from "@lumeweb/portal-framework-core";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import type { BaseRecord, CrudFilter, CrudOperators } from "@refinedev/core";
import { getDefaultFilter as refineGetDefaultFilter } from "@refinedev/core";
import {
  getDefaultOperatorForFieldType,
  getAvailableOperators as getAvailableOperatorsHelper,
} from "../toolbarItems/filters/hooks/useFilterOperators";
import { FilterOperator } from "../toolbarItems/filters/types";

export type GetDefaultFilterFn = (
  columnName: string,
  operatorType?: CrudOperators,
) => CrudFilter["value"] | undefined;

export interface FilterHelpersContextValue<TData extends BaseRecord> {
  getDefaultFilter: GetDefaultFilterFn;
  getDefaultOperator: (fieldType: string) => string;
  getAvailableOperators: (fieldType: string) => FilterOperator[];
}

const FilterHelpersContext = createContext<FilterHelpersContextValue<any> | undefined>(
  undefined,
);

export interface FilterHelpersProviderProps<TData extends BaseRecord> {
  children: React.ReactNode;
  refineTable?: any;
  getDefaultFilter?: GetDefaultFilterFn;
  getDefaultOperator?: (fieldType: string) => string;
  getAvailableOperators?: (fieldType: string) => FilterOperator[];
}

// Custom hook for getDefaultFilter functionality
export const useDefaultFilter = <TData extends BaseRecord>(
  refineTable?: any,
) => {
  // Use ref to track filters to prevent function recreation
  const filtersRef = useRef(refineTable?.refineCore?.filters);

  // Update ref when filters change
  useEffect(() => {
    filtersRef.current = refineTable?.refineCore?.filters;
  }, [refineTable?.refineCore?.filters]);

  // Stable function that reads from ref
  return useCallback(
    (columnName: string, operatorType: CrudOperators = "eq") => {
      const result = refineGetDefaultFilter(
        columnName,
        filtersRef.current,
        operatorType,
      );
      
      return result;
    },
    [],
  );
};

export function FilterHelpersProvider<TData extends BaseRecord>({
  children,
  refineTable,
  getDefaultFilter,
  getDefaultOperator,
  getAvailableOperators,
}: FilterHelpersProviderProps<TData>) {
  // If getDefaultFilter is not provided, create a default one
  const defaultGetDefaultFilter = useDefaultFilter(refineTable);
  const finalGetDefaultFilter = getDefaultFilter || defaultGetDefaultFilter;

  // If getDefaultOperator is not provided, create a default one
  const defaultGetDefaultOperator = useCallback(
    (fieldType: string): string => {
      return getDefaultOperatorForFieldType(fieldType);
    },
    [],
  );
  const finalGetDefaultOperator =
    getDefaultOperator || defaultGetDefaultOperator;

  const defaultGetAvailableOperators = useCallback(
    (fieldType: string): FilterOperator[] => {
      return getAvailableOperatorsHelper(fieldType);
    },
    [],
  );
  const finalGetAvailableOperators =
    getAvailableOperators || defaultGetAvailableOperators;

  // Use refs to stabilize references and prevent contexts thrashing
  const finalGetDefaultFilterRef = useRef(finalGetDefaultFilter);
  const finalGetDefaultOperatorRef = useRef(finalGetDefaultOperator);
  const finalGetAvailableOperatorsRef = useRef(finalGetAvailableOperators);

  // Update refs when values change
  useEffect(() => {
    finalGetDefaultFilterRef.current = finalGetDefaultFilter;
    finalGetDefaultOperatorRef.current = finalGetDefaultOperator;
    finalGetAvailableOperatorsRef.current = finalGetAvailableOperators;
  }, [finalGetDefaultFilter, finalGetDefaultOperator, finalGetAvailableOperators]);

  // Create stable context value using refs
  const value = useMemo(() => {
    return {
      getDefaultFilter: finalGetDefaultFilterRef.current,
      getDefaultOperator: finalGetDefaultOperatorRef.current,
      getAvailableOperators: finalGetAvailableOperatorsRef.current,
    };
  }, []);

  return (
    <FilterHelpersContext.Provider value={value}>
      {children}
    </FilterHelpersContext.Provider>
  );
}

export const useFilterHelpers = <TData extends BaseRecord>() => {
  const context = useContext(FilterHelpersContext);
  if (context === undefined) {
    throw new Error("useFilterHelpers must be used within a FilterHelpersProvider");
  }
  return context as FilterHelpersContextValue<TData>;
};

registerBridgedContext(FilterHelpersContext);
