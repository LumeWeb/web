import { cn } from "@lumeweb/portal-framework-ui-core";
import { Cell, Row, Table } from "@tanstack/react-table";
import React from "react";

import { Toolbar } from "./Toolbar";
import { BaseRecord } from "@refinedev/core";
import { useTableConfigOptional } from "./contexts";
import { TableLayoutRenderer } from "./TableLayoutRenderer";
import { TableLayoutType } from "./DataTable.types";
import { ComponentSize } from "@lumeweb/portal-framework-ui-core";

export interface BaseTableContentProps<TData extends BaseRecord> {
  className?: string;
  emptyState?: React.ReactNode;
  footer?: React.ReactNode;
  getCellProps?: (
    cell: Cell<TData, unknown>,
  ) => React.HTMLAttributes<HTMLTableCellElement>;
  getRowProps?: (row: Row<TData>) => React.HTMLAttributes<HTMLTableRowElement>;
  header?: React.ReactNode;
  /** Whether table is in loading state */
  isLoading?: boolean;
  /** Loading state content */
  loadingState?: React.ReactNode;
  onRowClick?: (row: Row<TData>) => void;
  pagination?: React.ReactNode;
  table: Table<TData>;
  responsive?: boolean;
  layoutType?: TableLayoutType;
  hideColumnsOnMobile?: string[];
  mobileBreakpoint?: ComponentSize | string;
  stackedHeaderColumn?: string;
}

function BaseTableContent<TData extends BaseRecord>({
  className,
  emptyState,
  footer,
  getCellProps,
  getRowProps,
  header,
  isLoading,
  loadingState,
  onRowClick,
  pagination,
  table,
  responsive = false,
  layoutType = TableLayoutType.AUTO,
  hideColumnsOnMobile = [],
  mobileBreakpoint,
  stackedHeaderColumn,
}: BaseTableContentProps<TData>) {
  const tableConfig = useTableConfigOptional<TData>();
  const toolbarConfig = tableConfig?.toolbarConfig;

  return (
    <div className={cn(className)}>
      {toolbarConfig && <Toolbar table={table} />}
      <TableLayoutRenderer
        layoutType={layoutType}
        table={table}
        className={className}
        emptyState={emptyState}
        footer={footer}
        getCellProps={getCellProps}
        getRowProps={getRowProps}
        header={header}
        isLoading={isLoading}
        loadingState={loadingState}
        onRowClick={onRowClick}
        pagination={pagination}
        responsive={responsive}
        hideColumnsOnMobile={hideColumnsOnMobile}
        mobileBreakpoint={mobileBreakpoint || toolbarConfig?.mobileBreakpoint}
        stackedHeaderColumn={stackedHeaderColumn}
      />
    </div>
  );
}

export { BaseTableContent };
