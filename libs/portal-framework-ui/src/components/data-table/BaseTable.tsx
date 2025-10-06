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
import { ToolbarConfig, TableLayoutType } from "./DataTable.types";
import {
  getAvailableOperators,
  getDefaultOperatorForFieldType,
} from "./toolbarItems/filters/hooks/useFilterOperators";
import { filterColumnsForMobile } from "./filterColumnsForMobile";
import { ComponentSize } from "@lumeweb/portal-framework-ui-core";

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

export interface TableResponsiveProps {
  responsive?: boolean;
  layoutType?: TableLayoutType;
  hideColumnsOnMobile?: string[];
  mobileBreakpoint?: ComponentSize | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export interface TableHeaderFooterProps {
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export interface TableStylingProps extends TableResponsiveProps, TableHeaderFooterProps {
  className?: string;
}

export interface BaseTableLayoutPropsBase<TData extends BaseRecord> 
  extends TableInteractionProps<TData>,
    TableStateProps<TData>,
    TableHeaderFooterProps,
    TableStylingProps,
    BaseTableCommonProps<TData>,
    TablePaginationConfigProps {
  table: Table<TData>;
}

function BaseTableWithData<TData extends BaseRecord>(
  props: BaseTableWithDataProps<TData>,
) {
  const {
    columns,
    data,
    hideColumnsOnMobile = [],
    responsive = false,
    ...restProps
  } = props;

  // Filter columns for mobile if responsive mode is enabled
  const filteredColumns = responsive 
    ? filterColumnsForMobile(columns, hideColumnsOnMobile) 
    : columns;

  const table = useReactTable({
    data,
    columns: filteredColumns,
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
            <BaseTableInner {...restProps} />
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
        <BaseTableInner {...restProps} />
      </FilterHelpersProvider>
    </TableInstanceProvider>
  );
}

function BaseTable<TData extends object>(props: BaseTableProps<TData>) {
  const {
    className,
    emptyState,
    emptyStateMessage,
    footer,
    getCellProps,
    getRowProps,
    header,
    isLoading,
    loadingState,
    loadingStateMessage,
    onRowClick,
    pagination,
    responsive = false,
    layoutType = TableLayoutType.AUTO,
    hideColumnsOnMobile = [],
    mobileBreakpoint,
    ...restProps
  } = props;

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
              <BaseTableInner 
                className={className}
                emptyState={emptyState}
                emptyStateMessage={emptyStateMessage}
                footer={footer}
                getCellProps={getCellProps}
                getRowProps={getRowProps}
                header={header}
                isLoading={isLoading}
                loadingState={loadingState}
                loadingStateMessage={loadingStateMessage}
                onRowClick={onRowClick}
                pagination={pagination}
                responsive={responsive}
                layoutType={layoutType}
                hideColumnsOnMobile={hideColumnsOnMobile}
                mobileBreakpoint={mobileBreakpoint}
              />
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
          <BaseTableInner 
            className={className}
            emptyState={emptyState}
            emptyStateMessage={emptyStateMessage}
            footer={footer}
            getCellProps={getCellProps}
            getRowProps={getRowProps}
            header={header}
            isLoading={isLoading}
            loadingState={loadingState}
            loadingStateMessage={loadingStateMessage}
            onRowClick={onRowClick}
            pagination={pagination}
            responsive={responsive}
            layoutType={layoutType}
            hideColumnsOnMobile={hideColumnsOnMobile}
            mobileBreakpoint={mobileBreakpoint}
          />
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
