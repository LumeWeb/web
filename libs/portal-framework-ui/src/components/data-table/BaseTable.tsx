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

export type BaseTableCommonProps<TData> = TableInteractionProps<TData> &
  TablePaginationConfigProps &
  TableStateProps<TData> &
  TableStylingProps;

export type BaseTablePaginationConfig = boolean | TablePaginationProps;

export type BaseTableProps<TData> =
  | BaseTableWithDataProps<TData>
  | BaseTableWithTableProps<TData>;

export type BaseTableWithDataProps<TData> = BaseTableCommonProps<TData> &
  TableDataProps<TData> & {
    table?: never;
  };

export type BaseTableWithTableProps<TData> = BaseTableCommonProps<TData> &
  TableInstanceProps<TData> & {
    actionColumn?: never;
    columns?: never;
    data?: never;
  };

export interface TableDataProps<TData> {
  /** Optional action column configuration */
  actionColumn?: ActionColumnDef<TData>;
  columns: ColumnDef<TData>[];
  data: TData[];
}

export interface TableInstanceProps<TData> {
  table: Table<TData>;
}

export interface TableInteractionProps<TData> {
  getCellProps?: (
    cell: Cell<TData, unknown>,
  ) => React.HTMLAttributes<HTMLTableCellElement>;
  getRowProps?: (row: Row<TData>) => React.HTMLAttributes<HTMLTableRowElement>;
  onRowClick?: (row: Row<TData>) => void;
}

export interface TablePaginationConfigProps {
  /** Pagination configuration */
  pagination?: BaseTablePaginationConfig;
}

export interface TablePaginationProps {
  /** Custom pagination component */
  component?: React.ReactNode;
  /** Whether pagination is enabled */
  enabled?: boolean;
}

export interface TableStateProps<TData> {
  emptyState?: ((colSpan: number) => React.ReactNode) | React.ReactNode;
  emptyStateMessage?: string;
  loadingState?: ((colSpan: number) => React.ReactNode) | React.ReactNode;
  loadingStateMessage?: string;
}

export interface TableStylingProps {
  className?: string;
  footer?: React.ReactNode;
  header?: React.ReactNode;
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
