import { BaseRecord } from "@refinedev/core";
import { useTable as useRefineTable } from "@refinedev/react-table";
import { Table } from "@tanstack/react-table";
import React from "react";

import type { DataTableProps } from "./DataTable.types";

import { ActionColumnCellProps, BaseTable } from "./BaseTable";
import { TableAction } from "./TableAction";
import { TableActionMenu } from "./TableActionMenu";

function DataTable<
  TData extends BaseRecord = BaseRecord,
  TError = unknown,
  TSearchVariables = unknown,
>({
  actionMenu,
  columns,
  dataProviderName,
  refineCoreProps,
  resource,
  ...props
}: DataTableProps<TData, TError, TSearchVariables>) {
  const actionColumn = actionMenu
    ? {
        cell: ({ row }: ActionColumnCellProps<TData>) => (
          <div className="flex items-center gap-1">
            {actionMenu.actionItems && (
              <TableAction items={actionMenu.actionItems} row={row.original} />
            )}
            <TableActionMenu items={actionMenu.items} row={row.original} />
          </div>
        ),
        header: actionMenu.label ?? "Actions",
        id: "actions",
      }
    : undefined;

  const tableColumns = [...(columns || [])];
  if (actionColumn) {
    tableColumns.push(actionColumn);
  }

  const refineTable = useRefineTable<TData>({
    columns: tableColumns,
    // @ts-ignore
    refineCoreProps: {
      dataProviderName: dataProviderName ?? undefined,
      resource,
      ...refineCoreProps,
    },
  });

  const table: Table<TData> = {
    ...refineTable,
    options: {
      ...refineTable.options,
      refineCore: refineTable.refineCore,
    },
  } as unknown as Table<TData>;

  return <BaseTable table={table} {...props} />;
}

export { DataTable };
