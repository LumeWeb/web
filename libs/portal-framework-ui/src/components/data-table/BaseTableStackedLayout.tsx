import { Card, CardContent, cn } from "@lumeweb/portal-framework-ui-core";
import { flexRender } from "@tanstack/react-table";
import React from "react";

import { useTableConfigOptional } from "./contexts";
import { useMobileDetection } from "./useMobileDetection";
import { BaseRecord } from "@refinedev/core";
import { BaseTableLayoutPropsBase } from "./BaseTable";
import { useMobileColumnHiding, useTableRowHandlers } from "./useTableHandlers";
import { normalizeTableOptions } from "./tableOptions";
import { ComponentSize } from "@/components";

interface BaseTableStackedLayoutProps<TData extends BaseRecord>
  extends BaseTableLayoutPropsBase<TData> {
  getCellProps?: (
    cell: any, // Using any to match BaseTableContentProps interface
  ) => React.HTMLAttributes<HTMLDivElement>;
  stackedHeaderColumn?: string;
}

function BaseTableStackedLayout<TData extends BaseRecord>({
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
  table,
  responsive,
  hideColumnsOnMobile,
  mobileBreakpoint,
  stackedHeaderColumn,
}: BaseTableStackedLayoutProps<TData>) {
  const tableConfig = useTableConfigOptional<TData>();
  const { isMobile } = useMobileDetection({
    mobileBreakpoint:
      mobileBreakpoint ||
      tableConfig?.toolbarConfig?.mobileBreakpoint ||
      ComponentSize.SM,
  });

  // Normalize table options including pagination
  const normalizedOptions = normalizeTableOptions(
    pagination,
    emptyState,
    emptyStateMessage,
    loadingState,
    loadingStateMessage,
    table,
  );

  // Use the shared hook for row handling
  const getTableRowProps = useTableRowHandlers({ onRowClick, getRowProps });

  if (isLoading) {
    return (
      <div className={cn(className)}>
        {header && <div className="mb-4">{header}</div>}
        {normalizedOptions.loadingState}
        {footer && <div className="mt-4">{footer}</div>}
      </div>
    );
  }

  const rows = table.getRowModel().rows;

  if (rows.length === 0) {
    return (
      <div className={cn(className)}>
        {header && <div className="mb-4">{header}</div>}
        {normalizedOptions.emptyState}
        {footer && <div className="mt-4">{footer}</div>}
      </div>
    );
  }

  return (
    <div className={cn(className)}>
      {header && <div className="mb-4">{header}</div>}
      <div className="space-y-4">
        {rows.map((row) => {
          // Use the shared hook for row props
          const rowProps = getTableRowProps(row);

          return (
            <Card key={row.id} {...rowProps}>
              {/* Render stacked header if specified */}
              {stackedHeaderColumn &&
                (() => {
                  const headerCell = row
                    .getVisibleCells()
                    .find((cell) => cell.column.id === stackedHeaderColumn);

                  if (headerCell) {
                    return (
                      <div
                        className={cn(
                          "border-b p-4",
                          "[word-break:break-word]",
                        )}>
                        <div className="text-lg font-semibold">
                          {flexRender(
                            headerCell.column.columnDef.cell,
                            headerCell.getContext(),
                          )}
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}

              <CardContent
                className={cn("space-y-3", "[word-break:break-word]")}>
                {row.getVisibleCells().map((cell) => {
                  // Use the shared hook for mobile column hiding
                  const isHidden = useMobileColumnHiding({
                    responsive,
                    hideColumnsOnMobile,
                    columnId: cell.column.id,
                  });

                  if (isHidden) {
                    return null;
                  }

                  // Skip the actions column for stacked layout
                  if (cell.column.id === "actions") {
                    return (
                      <div
                        key={cell.id}
                        className={cn(
                          "flex justify-end border-t pt-3",
                          isMobile && "pt-4",
                        )}
                        {...getCellProps?.(cell)}>
                        <div className={cn("flex min-h-10 items-center")}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </div>
                      </div>
                    );
                  }

                  // Skip the stacked header column to avoid duplication
                  if (cell.column.id === stackedHeaderColumn) {
                    return null;
                  }

                  const header = cell.column.columnDef.header;
                  const headerText =
                    typeof header === "string" ? header : undefined;

                  return (
                    <div
                      key={cell.id}
                      className={cn(
                        "flex flex-col space-y-1",
                        isMobile && "space-y-2",
                        !stackedHeaderColumn && "pt-4",
                      )}
                      {...getCellProps?.(cell)}>
                      {headerText && (
                        <span
                          className={cn(
                            "text-muted-foreground text-sm font-medium",
                            isMobile && "text-base",
                          )}>
                          {headerText}
                        </span>
                      )}
                      <div
                        className={cn(
                          "flex min-h-6 items-center text-base",
                          isMobile && "min-h-8 text-lg",
                        )}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}
      </div>
      {footer && <div className="mt-4">{footer}</div>}
    </div>
  );
}

export { BaseTableStackedLayout };
