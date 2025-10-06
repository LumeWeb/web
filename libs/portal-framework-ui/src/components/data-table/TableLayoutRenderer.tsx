import React from "react";
import { BaseRecord, useTableReturnType } from "@refinedev/core";
import { Table } from "@tanstack/react-table";

import { BaseTableStackedLayout } from "./BaseTableStackedLayout";
import { DefaultTableLayout } from "./DefaultTableLayout";
import { useTableLayoutSelector } from "./useTableLayoutSelector";
import { useTableConfigOptional } from "./contexts";
import { BaseTableContentProps } from "./BaseTableContent";
import { TableLayoutType } from "./DataTable.types";
import { ComponentSize } from "@/components";

// Layout registry mapping layout types to components
const layoutRegistry = {
  [TableLayoutType.TABLE]: DefaultTableLayout,
  [TableLayoutType.STACKED]: BaseTableStackedLayout,
};

// Type for layout components
type LayoutComponent<TData extends BaseRecord> = React.ComponentType<
  Omit<BaseTableContentProps<TData>, "table" | "layoutType">
>;

interface TableLayoutRendererProps<TData extends BaseRecord> {
  layoutType: TableLayoutType;
  table: Table<TData>;
  refineTable?: useTableReturnType<TData, any>;
  // All other props from BaseTableContent
  className?: string;
  emptyState?: React.ReactNode;
  footer?: React.ReactNode;
  getCellProps?: (
    cell: any, // Using any to avoid complex typing issues
  ) => React.HTMLAttributes<HTMLTableCellElement>;
  getRowProps?: (row: any) => React.HTMLAttributes<HTMLTableRowElement>;
  header?: React.ReactNode;
  isLoading?: boolean;
  loadingState?: React.ReactNode;
  onRowClick?: (row: any) => void;
  pagination?: React.ReactNode;
  responsive?: boolean;
  hideColumnsOnMobile?: string[];
  mobileBreakpoint?: ComponentSize | string;
  stackedHeaderColumn?: string;
}

function TableLayoutRenderer<TData extends BaseRecord>({
  layoutType,
  table,
  refineTable,
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
  responsive = false,
  hideColumnsOnMobile = [],
  mobileBreakpoint,
  stackedHeaderColumn,
}: TableLayoutRendererProps<TData>) {
  const tableConfig = useTableConfigOptional<TData>();

  // Determine the actual layout to render
  const actualLayoutType = useTableLayoutSelector({
    responsive,
    mobileLayout: layoutType,
    mobileBreakpoint:
      mobileBreakpoint || tableConfig?.toolbarConfig?.mobileBreakpoint,
  });

  // Get the layout component from registry
  const LayoutComponent = layoutRegistry[
    actualLayoutType
  ] as LayoutComponent<TData>;

  if (!LayoutComponent) {
    throw new Error(`Unsupported layout type: ${actualLayoutType}`);
  }

  // Render the registered layout component
  return (
    <LayoutComponent
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
      table={table}
      responsive={responsive}
      hideColumnsOnMobile={hideColumnsOnMobile}
      mobileBreakpoint={mobileBreakpoint}
      stackedHeaderColumn={stackedHeaderColumn}
    />
  );
}

export { TableLayoutRenderer };
