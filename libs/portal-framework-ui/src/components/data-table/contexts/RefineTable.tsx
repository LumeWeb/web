import { registerBridgedContext } from "@lumeweb/portal-framework-core";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import type { UseTableReturnType } from "@refinedev/react-table";
import type { BaseRecord } from "@refinedev/core";
import deepEqual from "fast-deep-equal";

export interface RefineTableContextValue<TData extends BaseRecord> {
  refineTable?: UseTableReturnType<TData, any>;
  setFilters?: UseTableReturnType<TData, any>["refineCore"]["setFilters"];
  setSorters?: UseTableReturnType<TData, any>["refineCore"]["setSorters"];
  tableQuery?: any;
  filters?: any;
  sorters?: any;
}

const RefineTableContext = createContext<
  RefineTableContextValue<any> | undefined
>(undefined);

export interface RefineTableProviderProps<TData extends BaseRecord> {
  children: React.ReactNode;
  refineTable?: UseTableReturnType<TData, any>;
}

// Generate unique instance ID for tracking multiple provider instances
const generateInstanceId = () => Math.random().toString(36).substr(2, 9);

export function RefineTableProvider<TData extends BaseRecord>({
  children,
  refineTable,
}: RefineTableProviderProps<TData>) {
  // Create unique instance identifier
  const instanceId = useMemo(() => generateInstanceId(), []);

  // Use refs to stabilize references and prevent contexts thrashing
  const refineTableRef = useRef(refineTable);
  const setFiltersRef = useRef(refineTable?.refineCore?.setFilters);
  const setSortersRef = useRef(refineTable?.refineCore?.setSorters);
  const tableQueryRef = useRef(refineTable?.refineCore?.tableQuery);
  const filtersRef = useRef(refineTable?.refineCore?.filters);
  const sortersRef = useRef(refineTable?.refineCore?.sorters);

  // Track previous values for deep comparison
  const prevFiltersRef = useRef(refineTable?.refineCore?.filters);
  const prevSortersRef = useRef(refineTable?.refineCore?.sorters);

  // Update refs when values change (only update if actual data changed)
  useEffect(() => {
    // Update function refs if they've changed
    if (refineTable?.refineCore?.setFilters !== setFiltersRef.current) {
      setFiltersRef.current = refineTable?.refineCore?.setFilters;
    }

    if (refineTable?.refineCore?.setSorters !== setSortersRef.current) {
      setSortersRef.current = refineTable?.refineCore?.setSorters;
    }

    // Deep compare filters to prevent false positives
    const newFilters = refineTable?.refineCore?.filters || [];
    const filtersChanged = !deepEqual(prevFiltersRef.current, newFilters);

    if (filtersChanged) {
      // Check for filter state reset
      const oldFilters = prevFiltersRef.current || [];
      if (oldFilters.length > 0 && newFilters.length === 0) {
        // Filter state reset detected
      }

      filtersRef.current = newFilters;
      prevFiltersRef.current = newFilters;
    }

    // Deep compare sorters to prevent false positives
    const newSorters = refineTable?.refineCore?.sorters || [];
    const sortersChanged = !deepEqual(prevSortersRef.current, newSorters);

    if (sortersChanged) {
      // Check for sorter state reset
      const oldSorters = prevSortersRef.current || [];
      if (oldSorters.length > 0 && newSorters.length === 0) {
        // Sorter state reset detected
      }

      sortersRef.current = newSorters;
      prevSortersRef.current = newSorters;
    }

    // Always update these refs as they may change reference without content change
    refineTableRef.current = refineTable;
    tableQueryRef.current = refineTable?.refineCore?.tableQuery;
  }, [refineTable, instanceId]);

  // Create stable context value that only changes when refs are updated
  const value = useMemo(() => {
    return {
      refineTable: refineTable,
      setFilters: refineTable?.refineCore?.setFilters,
      setSorters: refineTable?.refineCore?.setSorters,
      tableQuery: refineTable?.refineCore?.tableQuery,
      filters: refineTable?.refineCore?.filters,
      sorters: refineTable?.refineCore?.sorters,
    };
  }, [refineTable]);

  return (
    <RefineTableContext.Provider value={value}>
      {children}
    </RefineTableContext.Provider>
  );
}

export const useRefineTable = <TData extends BaseRecord>() => {
  const context = useContext(RefineTableContext);

  if (context === undefined) {
    throw new Error("useRefineTable must be used within a RefineTableProvider");
  }

  return context as RefineTableContextValue<TData>;
};

registerBridgedContext(RefineTableContext);
