import { useMemo } from "react";
import type { BaseRecord } from "@refinedev/core";
import { useTable } from "@refinedev/react-table";
import { type ColumnDef, flexRender } from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Skeleton } from "./ui/skeleton";
import { DataTablePagination } from "~/components/TablePagination";

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
}

export function DataTable<TData extends BaseRecord, TValue>({
  columns,
  resource,
  dataProviderName,
  className,
  autoRefresh,
  autoRefreshInterval,
}: DataTableProps<TData, TValue>) {
  const table = useTable({
    columns,
    refineCoreProps: {
      resource,
      dataProviderName: dataProviderName || "default",
      // @ts-ignore
      queryOptions: {
        refetchInterval: autoRefresh ? autoRefreshInterval : undefined,
      },
    },
  });

  const loadingRows = useMemo(
    () =>
      Array(4)
        .fill({})
        .map(() => ({
          getIsSelected: () => false,
          getVisibleCells: () =>
            columns.map(() => ({
              column: {
                columnDef: {
                  cell: <Skeleton className="h-4 w-full bg-foreground/30" />,
                },
              },
              getContext: () => null,
            })),
        })),
    [],
  );

  const rows = table.refineCore.tableQueryResult.isLoading
    ? loadingRows
    : table.getRowModel().rows;

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
                className="group">
                {row.getVisibleCells().map((cell, index) => (
                  <TableCell key={`DataTableCell_${index}`}>
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext() as any,
                    )}
                  </TableCell>
                ))}
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
      {table.refineCore.tableQueryResult.isLoading && (
        <DataTablePagination table={table} />
      )}
    </>
  );
}
