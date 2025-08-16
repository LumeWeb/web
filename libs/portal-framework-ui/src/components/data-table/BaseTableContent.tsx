import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Table as UITable,
} from "@lumeweb/portal-framework-ui-core";
import { Cell, flexRender, Row, Table } from "@tanstack/react-table";
import React from "react";

interface BaseTableContentProps<TData> {
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
}

function BaseTableContent<TData extends object>({
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
}: BaseTableContentProps<TData>) {
  return (
    <div className={className}>
      {header && <div className="mb-4">{header}</div>}
      <UITable>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead 
                    key={header.id}
                    style={{
                      minWidth: header.column.columnDef.size,
                      maxWidth: header.column.columnDef.size,
                      width: header.column.columnDef.size,
                    }}
                    className={header.column.columnDef.meta?.headerClassName}
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
          {isLoading ? (
            loadingState
          ) : table.getRowModel().rows.length > 0 ? (
            table.getRowModel().rows.map((row) => {
              const rowProps = getRowProps?.(row) || {};
              if (onRowClick) {
                rowProps.onClick = () => onRowClick(row);
                rowProps.className = [
                  rowProps.className,
                  "cursor-pointer hover:bg-muted",
                ]
                  .filter(Boolean)
                  .join(" ");
              }
              return (
                <TableRow key={row.id} {...rowProps}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell 
                      key={cell.id} 
                      style={{
                        minWidth: cell.column.columnDef.size,
                        maxWidth: cell.column.columnDef.size,
                        width: cell.column.columnDef.size,
                      }}
                      className={[
                        cell.column.columnDef.meta?.cellClassName,
                        getCellProps?.(cell)?.className
                      ].filter(Boolean).join(' ')}
                      {...getCellProps?.(cell)}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })
          ) : (
            emptyState
          )}
        </TableBody>
      </UITable>
      {footer && <div className="mt-4">{footer}</div>}
      {pagination && <div className="mt-4">{pagination}</div>}
    </div>
  );
}

export { BaseTableContent };
