import { useMemo} from "react";
import type { BaseRecord } from "@refinedev/core";
import { useTable } from "@refinedev/react-table";
import {
  type ColumnDef,
  flexRender,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table"
import { Skeleton } from "./ui/skeleton";
import { DataTablePagination } from "./table-pagination"

interface DataTableProps<TData extends BaseRecord = BaseRecord, TValue = unknown> {
  columns: ColumnDef<TData, TValue>[]
}

export function DataTable<TData extends BaseRecord, TValue>({
  columns,
}: DataTableProps<TData, TValue>) {
  const table = useTable({
    columns,
    refineCoreProps: {
      resource: "file"
    }
  })

  const loadingRows = useMemo(() => Array(4).fill({}).map(() => ({
    getIsSelected: () => false,
    getVisibleCells: () => columns.map(() => ({
      column: {
        columnDef: {
          cell: <Skeleton className="h-4 w-full bg-primary-1/30" />,
        }
      },
      getContext: () => null
    })),
  })), [])

  const rows = table.refineCore.tableQueryResult.isLoading ? loadingRows : table.getRowModel().rows

  return (
    <>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header, index) => {
                return (
                  <TableHead key={`FileDataTableHeader_${index}`} style={{ width: header.getSize() }}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {rows.length ? (
            rows.map((row, index) => (
              <TableRow
                key={`FileDataTableRow_${index}`}
                data-state={row.getIsSelected() && "selected"}
                className="group"
              >
                {row.getVisibleCells().map((cell, index) => (
                  <TableCell key={`FileDataTableCell_${index}`}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <DataTablePagination table={table} />
    </>
  )
}
