import { useState } from "react";
import { BaseRecord } from "@refinedev/core";
import { useTable } from "@refinedev/react-table";
import {
  ColumnDef,
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
import { DataTablePagination } from "./table-pagination"

interface DataTableProps<TData extends BaseRecord = BaseRecord, TValue = unknown> {
  columns: ColumnDef<TData, TValue>[]
}

export function DataTable<TData extends BaseRecord, TValue>({
  columns
}: DataTableProps<TData, TValue>) {
  const [hoveredRowId, setHoveredRowId] = useState<string>("");

  const table = useTable({
    columns,
    meta: {
      hoveredRowId,
    },
    refineCoreProps: {
      resource: "files"
    }
  })

  return (
    <div className="rounded-lg">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id} style={{ width: header.getSize() }}>
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
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                onMouseEnter={() => {
                  console.log(hoveredRowId, row.id);
                  setHoveredRowId(row.id)
                }}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
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
    </div>
  )
}
