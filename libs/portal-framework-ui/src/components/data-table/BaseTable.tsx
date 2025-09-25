import {
  Cell,
  ColumnDef,
  getCoreRowModel,
  Row,
  Table,
  useReactTable,
} from "@tanstack/react-table";
import React from "react";
import { BaseRecord, useTableReturnType } from "@refinedev/core";

import { BaseTableInner } from "./BaseTableInner";
import {
  FilterHelpersProvider,
  RefineTableProvider,
  TableConfigProvider,
  TableInstanceProvider,
  useTableConfigOptional,
} from "./contexts";
import { ToolbarConfig } from "./DataTable.types";
import {
  getAvailableOperators,
  getDefaultOperatorForFieldType,
} from "./toolbarItems/filters/hooks/useFilterOperators";

export interface ActionColumnCellProps<TData> {
  row: Row<TData>;
}

export type ActionColumnDef<TData> = ColumnDef<TData, unknown> & {
  /** Function to render cell content */
  cell: (props: ActionColumnCellProps<TData>) => React.ReactNode;
};

export interface BaseTableRefineProps<TData extends BaseRecord> {
  /** Refine table instance */
  refineTable?: useTableReturnType<TData, any>;
}

export interface BaseTableCommonProps<TData extends BaseRecord> {
  /** Whether table is in loading state */
  isLoading?: boolean;
  /** Toolbar configuration */
  toolbarConfig?: ToolbarConfig<TData>;
}

export type BaseTableCommonPropsType<TData extends BaseRecord> =
  TableInteractionProps<TData> &
    TablePaginationConfigProps &
    TableStateProps<TData> &
    TableStylingProps &
    BaseTableRefineProps<TData> &
    BaseTableCommonProps<TData>;

export type BaseTablePaginationConfig = boolean | TablePaginationProps;

export type BaseTableProps<TData extends BaseRecord> =
  | BaseTableWithDataProps<TData>
  | BaseTableWithTableProps<TData>;

export type BaseTableWithDataProps<TData extends BaseRecord> =
  BaseTableCommonPropsType<TData> &
    TableDataProps<TData> & {
      table?: never;
    };

export type BaseTableWithTableProps<TData extends BaseRecord> =
  BaseTableCommonPropsType<TData> &
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

export interface TableInstanceProps<TData extends BaseRecord> {
  table: Table<TData>;
  refineTable?: useTableReturnType<TData, any>;
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

function BaseTableWithData<TData extends BaseRecord>(
  props: BaseTableWithDataProps<TData>,
) {
  const table = useReactTable({
    data: props.data,
    columns: props.columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // Safe check for existing TableConfigContext using the optional hook
  const existingTableConfig = useTableConfigOptional<TData>();

  // Only render TableConfigProvider if context doesn't already exist
  const shouldRenderTableConfigProvider =
    !existingTableConfig ||
    (!existingTableConfig.toolbarConfig && !existingTableConfig.refineContext);

  if (shouldRenderTableConfigProvider) {
    return (
      <TableInstanceProvider table={table}>
        <FilterHelpersProvider
          refineTable={props.refineTable}
          getDefaultOperator={getDefaultOperatorForFieldType}
          getAvailableOperators={getAvailableOperators}>
          <TableConfigProvider
            toolbarConfig={props.toolbarConfig}
            refineContext={
              props.refineTable
                ? {
                    tableInstance: props.refineTable,
                    refetch: props.refineTable?.tableQuery?.refetch,
                    isLoading: props.refineTable?.tableQuery?.isFetching,
                    error: props.refineTable?.tableQuery?.error,
                  }
                : undefined
            }>
            <BaseTableInner {...props} />
          </TableConfigProvider>
        </FilterHelpersProvider>
      </TableInstanceProvider>
    );
  }

  return (
    <TableInstanceProvider table={table}>
      <FilterHelpersProvider
        refineTable={props.refineTable}
        getDefaultOperator={getDefaultOperatorForFieldType}
        getAvailableOperators={getAvailableOperators}>
        <BaseTableInner {...props} />
      </FilterHelpersProvider>
    </TableInstanceProvider>
  );
}

function BaseTable<TData extends object>(props: BaseTableProps<TData>) {
  if ("table" in props && props.table && "data" in props && props.data) {
    throw new Error(
      "BaseTable cannot accept both table and data props - use one or the other",
    );
  }

  if ("table" in props && props.table) {
    // Safe check for existing TableConfigContext using the optional hook
    const existingTableConfig = useTableConfigOptional<TData>();

    // Only render TableConfigProvider if context doesn't already exist
    const shouldRenderTableConfigProvider =
      !existingTableConfig ||
      (!existingTableConfig.toolbarConfig && !existingTableConfig.refineContext);

    if (shouldRenderTableConfigProvider) {
      return (
        <TableInstanceProvider table={props.table}>
          <FilterHelpersProvider
            refineTable={props.refineTable}
            getDefaultOperator={getDefaultOperatorForFieldType}
            getAvailableOperators={getAvailableOperators}>
            <TableConfigProvider
              toolbarConfig={props.toolbarConfig}
              refineContext={
                props.refineTable
                  ? {
                      tableInstance: props.refineTable,
                      refetch: props.refineTable?.tableQuery?.refetch,
                      isLoading: props.refineTable?.tableQuery?.isFetching,
                      error: props.refineTable?.tableQuery?.error,
                    }
                  : undefined
              }>
              <BaseTableInner {...props} />
            </TableConfigProvider>
          </FilterHelpersProvider>
        </TableInstanceProvider>
      );
    }

    return (
      <TableInstanceProvider table={props.table}>
        <FilterHelpersProvider
          refineTable={props.refineTable}
          getDefaultOperator={getDefaultOperatorForFieldType}
          getAvailableOperators={getAvailableOperators}>
          <BaseTableInner {...props} />
        </FilterHelpersProvider>
      </TableInstanceProvider>
    );
  }

  if ("data" in props && props.data) {
    return <BaseTableWithData {...props} />;
  }

  throw new Error("BaseTable requires either table or data prop");
}

export { BaseTable };
