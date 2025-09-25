import { BaseRecord } from "@refinedev/core";
import { useTable as useRefineTable } from "@refinedev/react-table";
import { Table } from "@tanstack/react-table";
import React, { useEffect, useMemo, useRef, useState } from "react";

import type { DataTableProps } from "./DataTable.types";

import { ActionColumnCellProps, BaseTable } from "./BaseTable";
import { TableAction } from "./TableAction";
import { TableActionMenu } from "./TableActionMenu";
import {
  FilterHelpersProvider,
  RefineTableProvider,
  TableConfigProvider,
  TableInstanceProvider,
} from "./contexts";
import { getDefaultFilter as refineGetDefaultFilter } from "@refinedev/core";
import {
  getAvailableOperators as getAvailableOperatorsHelper,
  getDefaultOperatorForFieldType,
} from "./toolbarItems/filters/hooks/useFilterOperators";

// Instance counter to track component creations
let instanceCounter = 0;

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
  toolbar,
  refetchInterval,
  ...props
}: DataTableProps<TData, TError, TSearchVariables>) {
  // Create unique instance ID for this component
  const instanceId = useRef(++instanceCounter);
  const renderCount = useRef(0);

  const tableColumns = useMemo(() => {
    const cols = [...(columns || [])];
    
    // Create actionColumn inside useMemo to avoid unnecessary recreations
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
          meta: {
            cellClassName: "max-w-24 w-12",
            headerClassName: "max-w-24 w-12",
          },
          size: 0,
        }
      : undefined;
    
    if (actionColumn) {
      cols.push(actionColumn);
    }
    return cols;
  }, [columns, actionMenu]);

  const memoizedRefineCoreProps = useMemo(() => ({
    dataProviderName: dataProviderName ?? undefined,
    resource,
    ...refineCoreProps,
    queryOptions: {
      ...refineCoreProps?.queryOptions,
      refetchInterval,
    },
  }), [dataProviderName, resource, refineCoreProps, refetchInterval]);

  const refineTable = useRefineTable<TData>({
    columns: tableColumns,
    // @ts-ignore
    refineCoreProps: memoizedRefineCoreProps,
  });

  const table: Table<TData> = {
    ...refineTable,
    options: {
      ...refineTable.options,
      refineCore: refineTable.refineCore,
    },
  } as unknown as Table<TData>;

  const getDefaultFilter = (columnName: string, operatorType?: string) =>
    refineGetDefaultFilter(
      columnName,
      refineTable.refineCore?.filters,
      operatorType as any,
    );

  const getDefaultOperator = (fieldType: string): string =>
    getDefaultOperatorForFieldType(fieldType);

  const getAvailableOperators = (fieldType: string) =>
    getAvailableOperatorsHelper(fieldType);

  return (
    <RefineTableProvider refineTable={refineTable.refineCore}>
      <TableInstanceProvider table={table}>
        <FilterHelpersProvider
          refineTable={refineTable}
          getDefaultFilter={getDefaultFilter}
          getDefaultOperator={getDefaultOperator}
          getAvailableOperators={getAvailableOperators}>
          <TableConfigProvider
            toolbarConfig={toolbar}
            refineContext={{
              tableInstance: refineTable.refineCore,
              refetch: refineTable.refineCore.tableQuery.refetch,
              isLoading: refineTable.refineCore.tableQuery.isFetching,
              error: refineTable.refineCore.tableQuery.error,
            }}>
            <BaseTable
              table={table}
              refineTable={refineTable.refineCore}
              {...props}
            />
          </TableConfigProvider>
        </FilterHelpersProvider>
      </TableInstanceProvider>
    </RefineTableProvider>
  );
}

export { DataTable };
