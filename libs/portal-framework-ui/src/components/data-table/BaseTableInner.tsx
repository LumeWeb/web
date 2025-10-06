import type { BaseTableCommonPropsType, TableHeaderFooterProps, TableResponsiveProps } from "./BaseTable";
import { BaseTableContent } from "./BaseTableContent";
import { useTableInstance } from "./contexts";
import { normalizeTableOptions } from "./tableOptions";
import { type Table } from "@tanstack/react-table";
import React from "react";

// Extend the common props interface with specific properties BaseTableInner actually uses
interface BaseTableInnerProps<TData extends object> 
  extends BaseTableCommonPropsType<TData>, TableHeaderFooterProps, TableResponsiveProps {
  stackedHeaderColumn?: string;
}

function BaseTableInner<TData extends object>(
  props: BaseTableInnerProps<TData>,
): React.JSX.Element {
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
    responsive,
    layoutType,
    hideColumnsOnMobile,
    mobileBreakpoint,
    stackedHeaderColumn,
  } = props;

  const { table } = useTableInstance<TData>();

  const normalizedOptions = normalizeTableOptions(
    pagination,
    emptyState,
    emptyStateMessage,
    loadingState,
    loadingStateMessage,
    table,
  );

  return (
    <BaseTableContent
      className={className}
      emptyState={normalizedOptions.emptyState}
      footer={footer}
      getCellProps={getCellProps}
      getRowProps={getRowProps}
      header={header}
      isLoading={isLoading}
      loadingState={normalizedOptions.loadingState}
      onRowClick={onRowClick}
      pagination={
        normalizedOptions.pagination.enabled
          ? normalizedOptions.pagination.component
          : undefined
      }
      table={table}
      responsive={responsive}
      layoutType={layoutType}
      hideColumnsOnMobile={hideColumnsOnMobile}
      mobileBreakpoint={mobileBreakpoint}
      stackedHeaderColumn={stackedHeaderColumn}
    />
  );
}

export { BaseTableInner };
