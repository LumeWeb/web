import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Table as UITable,
} from "@lumeweb/portal-framework-ui-core";
import { flexRender, Table } from "@tanstack/react-table";
import React, { useMemo } from "react";
import { BaseRecord } from "@refinedev/core";
import {
  useTableRowHandlers,
  useTableCellHandlers,
  useMobileColumnHiding,
  useTableHeaderCellHandlers,
} from "./useTableHandlers";
import { BaseTableLayoutPropsBase } from "./BaseTable";
import { normalizeTableOptions } from "./tableOptions";

interface DefaultTableLayoutProps<TData extends BaseRecord>
  extends BaseTableLayoutPropsBase<TData> {
  emptyStateMessage?: string;
  loadingStateMessage?: string;
}

function DefaultTableLayout<TData extends BaseRecord>({
  table,
  getCellProps,
  getRowProps,
  onRowClick,
  className,
  emptyState,
  emptyStateMessage,
  footer,
  header,
  isLoading,
  loadingState,
  loadingStateMessage,
  pagination,
  responsive,
  hideColumnsOnMobile,
}: DefaultTableLayoutProps<TData>) {
  // Use the shared hooks for row and cell handling
  const getTableRowProps = useTableRowHandlers({ onRowClick, getRowProps });
  const getTableCellProps = useTableCellHandlers({ getCellProps });
  const getTableHeaderCellProps = useTableHeaderCellHandlers();
  
  // Get hidden columns at top level to avoid hooks violation
  const hiddenColumns = useMobileColumnHiding({
    responsive,
    hideColumnsOnMobile,
  });

  // Normalize table options
  const normalizedOptions = useMemo(
    () =>
      normalizeTableOptions(
        pagination,
        emptyState,
        emptyStateMessage,
        loadingState,
        loadingStateMessage,
        table,
      ),
    [
      pagination,
      emptyState,
      emptyStateMessage,
      loadingState,
      loadingStateMessage,
      table,
    ]
  );

  return (
    <div className={className}>
      {header && <div className="mb-4">{header}</div>}
      <div className="rounded-md border">
        <UITable>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  // Check if column should be hidden using the precomputed set
                  if (hiddenColumns.has(header.id)) {
                    return null;
                  }

                  const headerProps = getTableHeaderCellProps(header);

                  return (
                    <TableHead key={header.id} {...headerProps}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading
              ? normalizedOptions.loadingState
              : table.getRowModel().rows.length > 0
                ? table.getRowModel().rows.map((row) => {
                    // Use the shared hook for row props
                    const rowProps = getTableRowProps(row);

                    return (
                      <TableRow key={row.id} {...rowProps}>
                        {row.getVisibleCells().map((cell) => {
                          // Check if column should be hidden using the precomputed set
                          if (hiddenColumns.has(cell.column.id)) {
                            return null;
                          }

                          // Use the shared hook for cell props
                          const cellProps = getTableCellProps(cell);

                          return (
                            <TableCell key={cell.id} {...cellProps}>
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext(),
                              )}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    );
                  })
                : normalizedOptions.emptyState}
          </TableBody>
        </UITable>
      </div>
      {normalizedOptions.pagination.enabled && (
        <div className="mt-4">{normalizedOptions.pagination.component}</div>
      )}
      {footer && <div className="mt-4">{footer}</div>}
    </div>
  );
}

export { DefaultTableLayout };
