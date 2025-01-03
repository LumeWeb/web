import { useEffect, useMemo, useState } from "react";
import type { BaseRecord, CrudFilters, MetaQuery } from "@refinedev/core";
import { useTable } from "@refinedev/react-table";
import { type ColumnDef, flexRender, RowData } from "@tanstack/react-table";
import { cn } from "@/lib/utils"; // Make sure this import is correct for your project structure
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTablePagination } from "@/components/TablePagination";

import "@tanstack/react-table";
import { SkeletonLoader } from "@/components/SkeletonLoader";
import type { Pagination } from "@refinedev/core/src/contexts/data/types";

// @ts-ignore
declare module "@tanstack/table-core" {
  interface ColumnMeta<TData extends RowData, TValue> {
    className?: string;
  }
}

export interface DataTableProps<
  TData extends BaseRecord = BaseRecord,
  TValue = unknown,
> {
  columns: ColumnDef<TData, TValue>[];
  resource: string;
  dataProviderName?: string;
  className?: string;
  autoRefresh?: boolean;
  autoRefreshInterval?: number;
  filters?: CrudFilters;
  permanentFilters?: CrudFilters;
  meta?: MetaQuery;
  pagination?: Pagination;
}

export function DataTable<TData extends BaseRecord, TValue>({
  columns,
  resource,
  dataProviderName,
  className,
  autoRefresh,
  autoRefreshInterval,
  filters,
  permanentFilters,
  meta,
  pagination,
}: DataTableProps<TData, TValue>) {
  const table = useTable({
    columns,
    refineCoreProps: {
      resource,
      filters: {
        permanent: permanentFilters,
      },
      meta,
      dataProviderName,
      // @ts-ignore
      queryOptions: {
        refetchInterval: autoRefresh ? autoRefreshInterval : undefined,
        refetchIntervalInBackground: true,
        keepPreviousData: true,
      },
      pagination,
    },
  });

  useEffect(() => {
    table.refineCore.setFilters(filters || []);
  }, [filters]);

  const initialLoading = table.refineCore.tableQueryResult.isInitialLoading;
  const rows = initialLoading ? [] : table.getRowModel().rows;

  if (initialLoading) {
    return (
      <SkeletonLoader
        layout="table"
        table={table}
        showHeader
        className={className}
      />
    );
  }

  return (
    <>
      <Table className={className}>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header, index) => {
                return (
                  <TableHead
                    key={`DataTableHeader_${index}`}
                    style={{ width: header.getSize() }}>
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
          {rows.length ? (
            rows.map((row, index) => (
              <TableRow
                key={`DataTableRow_${index}`}
                data-state={row.getIsSelected() && "selected"}
                className={cn("group")}>
                {row.getVisibleCells().map((cell, index) => {
                  return (
                    <TableCell
                      key={`DataTableCell_${index}`}
                      // @ts-ignore
                      style={{ width: cell?.column?.getSize?.() }}
                      // @ts-ignore
                      className={cn(cell.column.columnDef?.meta?.className)}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext() as any,
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-foreground">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {!table?.refineCore.tableQueryResult.isLoading && (
        <DataTablePagination table={table} />
      )}
    </>
  );
}
