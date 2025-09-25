import { registerBridgedContext } from "@lumeweb/portal-framework-core";
import { Table } from "@tanstack/react-table";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import type { BaseRecord } from "@refinedev/core";

export interface TableInstanceContextValue<TData extends BaseRecord> {
  table: Table<TData>;
}

const TableInstanceContext = createContext<
  TableInstanceContextValue<any> | undefined
>(undefined);

export interface TableInstanceProviderProps<TData extends BaseRecord> {
  children: React.ReactNode;
  table: Table<TData>;
}

export function TableInstanceProvider<TData extends BaseRecord>({
  children,
  table,
}: TableInstanceProviderProps<TData>) {
  // Use refs to stabilize references and prevent contexts thrashing
  const tableRef = useRef(table);

  // Update refs when values change
  useEffect(() => {
    tableRef.current = table;
  }, [table]);

  const value = useMemo(() => {
    return {
      table: tableRef.current,
    };
  }, []);

  return (
    <TableInstanceContext.Provider value={value}>
      {children}
    </TableInstanceContext.Provider>
  );
}

export const useTableInstance = <TData extends BaseRecord>() => {
  const context = useContext(TableInstanceContext);
  if (context === undefined) {
    throw new Error(
      "useTableInstance must be used within a TableInstanceProvider",
    );
  }
  return context as TableInstanceContextValue<TData>;
};

registerBridgedContext(TableInstanceContext);
