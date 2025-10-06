import {
  cn,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Table as UITable,
} from "@lumeweb/portal-framework-ui-core";
import { flexRender, Table } from "@tanstack/react-table";
import React from "react";
import { BaseRecord } from "@refinedev/core";
import { 
  useTableRowHandlers, 
  useTableCellHandlers, 
  useMobileColumnHiding,
  useTableHeaderCellHandlers
} from "./useTableHandlers";
import { BaseTableLayoutPropsBase } from "./BaseTable";

interface DefaultTableLayoutProps<TData extends BaseRecord> extends BaseTableLayoutPropsBase<TData> {}

function DefaultTableLayout<TData extends BaseRecord>({
  table,
  getCellProps,
  getRowProps,
  onRowClick,
  className,
  emptyState,
  footer,
  header,
  isLoading,
  loadingState,
  pagination,
  responsive,
  hideColumnsOnMobile,
  mobileBreakpoint,
}: DefaultTableLayoutProps<TData>) {
  // Use the shared hooks for row and cell handling
  const getTableRowProps = useTableRowHandlers({ onRowClick, getRowProps });
  const getTableCellProps = useTableCellHandlers({ getCellProps });
  const getTableHeaderCellProps = useTableHeaderCellHandlers();
  
  return (
    <div className={className}>
      {header && <div className="mb-4">{header}</div>}
      <div className="border rounded-md">
        <UITable>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  // Use the shared hook for mobile column hiding
                  const isHidden = useMobileColumnHiding({
                    responsive,
                    hideColumnsOnMobile,
                    columnId: header.id,
                  });
                  
                  if (isHidden) {
                    return null;
                  }
                  
                  const headerProps = getTableHeaderCellProps(header);
                  
                  return (
                    <TableHead
                      key={header.id}
                      {...headerProps}
                    >
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
              ? loadingState
              : table.getRowModel().rows.length > 0
                ? table.getRowModel().rows.map((row) => {
                    // Use the shared hook for row props
                    const rowProps = getTableRowProps(row);
                    
                    return (
                      <TableRow key={row.id} {...rowProps}>
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
                          
                          // Use the shared hook for cell props
                          const cellProps = getTableCellProps(cell);
                          
                          return (
                            <TableCell
                              key={cell.id}
                              {...cellProps}
                            >
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
                : emptyState}
          </TableBody>
        </UITable>
      </div>
      {footer && <div className="mt-4">{footer}</div>}
    </div>
  );
}

export { DefaultTableLayout };
