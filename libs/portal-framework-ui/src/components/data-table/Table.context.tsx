import { registerBridgedContext } from "@lumeweb/portal-framework-core";
import {
  ColumnDef,
  getCoreRowModel,
  Table,
  useReactTable,
} from "@tanstack/react-table";
import React, { createContext, useContext, useMemo } from "react";

import { ActionColumnDef } from "./BaseTable";

export interface TableContextValue<TData> {
  table: Table<TData>;
}

const TableContext = createContext<TableContextValue<any> | undefined>(
  undefined,
);

export function CreateTableProvider<TData>({
  actionColumn,
  children,
  columns,
  data,
}: {
  actionColumn?: ActionColumnDef<TData>;
  children: React.ReactNode;
  columns: ColumnDef<TData>[];
  data: TData[];
}) {
  const tableColumns = useMemo(() => {
    const cols = [...columns];
    if (actionColumn) {
      cols.push({
        ...actionColumn,
        cell: (props) => actionColumn.cell(props),
        id: actionColumn.id || "actions",
      });
    }
    return cols;
  }, [columns, actionColumn]);

  const table = useReactTable({
    columns: tableColumns,
    data,
    getCoreRowModel: getCoreRowModel(),
  });

  return <TableProvider table={table}>{children}</TableProvider>;
}

export function TableProvider<TData>({
  children,
  table,
}: {
  children: React.ReactNode;
  table: Table<TData>;
}) {
  const value = useMemo(() => ({ table }), [table]);

  return (
    <TableContext.Provider value={value}>{children}</TableContext.Provider>
  );
}

export const useTable = <TData,>() => {
  const context = useContext(TableContext);
  if (context === undefined) {
    throw new Error("useTable must be used within a TableProvider");
  }
  return context as TableContextValue<TData>;
};

registerBridgedContext(TableContext);
