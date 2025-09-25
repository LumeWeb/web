import { registerBridgedContext } from "@lumeweb/portal-framework-core";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import type { useTableReturnType } from "@refinedev/core";
import type { BaseRecord } from "@refinedev/core";
import deepEqual from "fast-deep-equal";

export interface RefineTableContextValue<TData extends BaseRecord> {
  refineTable?: useTableReturnType<TData, any>;
  setFilters?: useTableReturnType<TData, any>["setFilters"];
  setSorters?: useTableReturnType<TData, any>["setSorters"];
  tableQuery?: any;
  filters?: any;
  sorters?: any;
}

const RefineTableContext = createContext<
  RefineTableContextValue<any> | undefined
>(undefined);

export interface RefineTableProviderProps<TData extends BaseRecord> {
  children: React.ReactNode;
  refineTable?: useTableReturnType<TData, any>;
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
  const setFiltersRef = useRef(refineTable?.setFilters);
  const setSortersRef = useRef(refineTable?.setSorters);
  const tableQueryRef = useRef(refineTable?.tableQuery);
  const filtersRef = useRef(refineTable?.filters);
  const sortersRef = useRef(refineTable?.sorters);
  
  // Track previous values for deep comparison
  const prevFiltersRef = useRef(refineTable?.filters);
  const prevSortersRef = useRef(refineTable?.sorters);

  // Update refs when values change (only update if actual data changed)
  useEffect(() => {
    // Update function refs if they've changed
    if (refineTable?.setFilters !== setFiltersRef.current) {
      setFiltersRef.current = refineTable?.setFilters;
    }
    
    if (refineTable?.setSorters !== setSortersRef.current) {
      setSortersRef.current = refineTable?.setSorters;
    }
    
    // Deep compare filters to prevent false positives
    const newFilters = refineTable?.filters || [];
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
    const newSorters = refineTable?.sorters || [];
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
    tableQueryRef.current = refineTable?.tableQuery;
  }, [refineTable, instanceId]);

  // Create stable context value that only changes when refs are updated
  const value = useMemo(() => {
    return {
      refineTable: refineTableRef.current,
      setFilters: setFiltersRef.current,
      setSorters: setSortersRef.current,
      tableQuery: tableQueryRef.current,
      filters: filtersRef.current,
      sorters: sortersRef.current,
    };
  }, [refineTable, filtersRef.current, sortersRef.current]);

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
