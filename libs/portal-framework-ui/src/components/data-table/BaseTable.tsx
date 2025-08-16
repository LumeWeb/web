import { Cell, ColumnDef, Row, Table } from "@tanstack/react-table";
import React from "react";

import { BaseTableInner } from "./BaseTableInner";
import { CreateTableProvider, TableProvider } from "./Table.context";

export interface ActionColumnCellProps<TData> {
  row: Row<TData>;
}

export interface ActionColumnDef<TData> extends ColumnDef<TData, unknown> {
  /** Function to render cell content */
  cell: (props: ActionColumnCellProps<TData>) => React.ReactNode;
}

export interface BaseTableCommonProps<TData> {
  /** Optional action column configuration */
  actionColumn?: ActionColumnDef<TData>;
  className?: string;
  columns: ColumnDef<TData>[];
  emptyState?: ((colSpan: number) => React.ReactNode) | React.ReactNode;
  emptyStateMessage?: string;
  footer?: React.ReactNode;
  getCellProps?: (
    cell: Cell<TData, unknown>,
  ) => React.HTMLAttributes<HTMLTableCellElement>;
  getRowProps?: (row: Row<TData>) => React.HTMLAttributes<HTMLTableRowElement>;
  header?: React.ReactNode;
  /** Loading state content */
  loadingState?: ((colSpan: number) => React.ReactNode) | React.ReactNode;
  /** Loading state message */
  loadingStateMessage?: string;
  onRowClick?: (row: Row<TData>) => void;
  /** Pagination configuration */
  pagination?: BaseTablePaginationConfig | boolean;
}

export interface BaseTablePaginationConfig {
  /** Custom pagination component */
  component?: React.ReactNode;
  /** Whether pagination is enabled */
  enabled?: boolean;
}

export type BaseTableProps<TData> =
  | BaseTableWithDataProps<TData>
  | BaseTableWithTableProps<TData>;

export interface BaseTableWithDataProps<TData>
  extends BaseTableCommonProps<TData> {
  data: TData[];
  table?: never;
}

export interface BaseTableWithTableProps<TData>
  extends BaseTableCommonProps<TData> {
  data?: never;
  table?: Table<TData>;
}

function BaseTable<TData extends object>(props: BaseTableProps<TData>) {
  if ("table" in props && props.table && "data" in props && props.data) {
    throw new Error(
      "BaseTable cannot accept both table and data props - use one or the other",
    );
  }

  if ("table" in props && props.table) {
    return (
      <TableProvider table={props.table}>
        <BaseTableInner {...props} />
      </TableProvider>
    );
  }

  if ("data" in props && props.data) {
    return (
      <CreateTableProvider
        actionColumn={props.actionColumn}
        columns={props.columns}
        data={props.data}>
        <BaseTableInner {...props} />
      </CreateTableProvider>
    );
  }

  throw new Error("BaseTable requires either table or data prop");
}

export { BaseTable };
