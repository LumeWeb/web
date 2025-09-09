import {
  cn,
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
    <div className={cn(className)}>
      {header && <div className="mb-4">{header}</div>}
      <div className={"scrollbar -mx-4 flex overflow-auto sm:-mx-8"}>
        <div className={"mx-4 grow sm:mx-8"}>
          <UITable>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        className={
                          header.column.columnDef.meta?.headerClassName
                        }
                        key={header.id}>
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
                      const rowProps = getRowProps?.(row) || {};
                      if (onRowClick) {
                        rowProps.onClick = () => onRowClick(row);
                        rowProps.tabIndex = 0;
                        rowProps.role = "button";
                        rowProps.onKeyDown = (e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            if (e.key === " ") {
                              e.preventDefault();
                            }
                            onRowClick(row);
                          }
                        };
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
                              className={[
                                cell.column.columnDef.meta?.cellClassName,
                              ]
                                .filter(Boolean)
                                .join(" ")}
                              key={cell.id}
                              {...getCellProps?.(cell)}>
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext(),
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      );
                    })
                  : emptyState}
            </TableBody>
          </UITable>
        </div>
      </div>
      {footer && <div className="mt-4">{footer}</div>}
      {pagination && <div className="mt-4">{pagination}</div>}
    </div>
  );
}

export { BaseTableContent };
