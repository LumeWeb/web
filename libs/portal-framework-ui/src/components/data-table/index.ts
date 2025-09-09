export * from "./BaseTable";
export * from "./BaseTableContent";
export * from "./BaseTableInner";
export * from "./DataTable";
export * from "./DataTable.types";
export * from "./DefaultPagination";
export * from "./EmptyState";
export * from "./LoadingState";
export * from "./Table.context";
export * from "./TableAction";
export * from "./TableActionMenu";
export * from "./tableOptions";
declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends RowData, TValue> {
    /** Class name for data cells */
    cellClassName?: string;
    /** Class name for header cells */
    headerClassName?: string;
    /** Fixed width for the column (number in px or string) */
    size?: number | string;
  }
}

export type { Cell, ColumnDef, Row } from "@tanstack/react-table";
