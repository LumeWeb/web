"use client";

import React, { useEffect } from "react";
import { useRefineTable } from "./contexts";
import type { BaseRecord } from "@refinedev/core";

export interface TableControls<TData extends BaseRecord = BaseRecord> {
  setFilters: (filters: any[]) => void;
  setSorters: (sorters: any[]) => void;
  refetch: () => void;
  getCurrentFilters: () => any[];
  getCurrentSorters: () => any[];
}

interface DataTableControllerProps<TData extends BaseRecord = BaseRecord> {
  onControlsReady?: (controls: TableControls<TData>) => void;
}

export function DataTableController<TData extends BaseRecord = BaseRecord>({
  onControlsReady,
}: DataTableControllerProps<TData>) {
  const { setFilters, setSorters, tableQuery, filters, sorters } = useRefineTable<TData>();

  useEffect(() => {
    if (setFilters && setSorters && tableQuery?.refetch && onControlsReady) {
      const controls: TableControls<TData> = {
        setFilters,
        setSorters,
        refetch: tableQuery.refetch,
        getCurrentFilters: () => filters || [],
        getCurrentSorters: () => sorters || [],
      };
      
      onControlsReady(controls);
    }
  }, [setFilters, setSorters, tableQuery, filters, sorters, onControlsReady]);

  return null;
}
