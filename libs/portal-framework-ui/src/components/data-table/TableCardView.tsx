import {
  Button,
  Card,
  CardContent,
  Checkbox,
  cn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@lumeweb/portal-framework-ui-core";
import { flexRender } from "@tanstack/react-table";
import { ChevronDown, ChevronUp, MoreHorizontal } from "lucide-react";
import * as React from "react";

import type { RowAction } from "./types/table";
import { UseTableReturnType } from "@refinedev/react-table";
import type { BaseRecord, HttpError } from "@refinedev/core";

interface TableCardViewProps<
  TData extends BaseRecord = BaseRecord,
  TError extends HttpError = HttpError,
> {
  columns: any[];
  table: UseTableReturnType<TData, TError>;
  enableExpandableRows?: boolean;
  enableRowSelection?: boolean;
  expandedRows: Record<string, boolean>;
  getRowId: (row: TData) => string;
  getRowStyles?: (row: TData) => string;
  onRowExpansionChange: (rowId: string, expanded: boolean) => void;
  onRowSelectionChange: (rowId: string, selected: boolean) => void;
  primaryColumn?: string;
  renderExpandedRow?: (row: TData) => React.ReactNode;
  rowActions?: RowAction<TData>[];
  secondaryColumns?: string[];
  selectedRows: Record<string, boolean>;
  isDataLoading?: boolean;
}

export function TableCardView<
  TData extends BaseRecord = BaseRecord,
  TError extends HttpError = HttpError,
>({
  columns,
  table,
  enableExpandableRows = false,
  enableRowSelection = false,
  expandedRows,
  getRowId,
  getRowStyles,
  onRowExpansionChange,
  onRowSelectionChange,
  primaryColumn = "",
  renderExpandedRow,
  rowActions = [],
  secondaryColumns = [],
  selectedRows,
  isDataLoading = false,
}: TableCardViewProps<TData, TError>) {
  if (isDataLoading) {
    return null;
  }

  const data = table.getRowModel().rows.map((row) => row.original);

  // Find the primary column if not specified
  const effectivePrimaryColumn = React.useMemo(() => {
    if (primaryColumn) return primaryColumn;

    // Try to find a column with 'name' or 'title'
    const nameColumn = columns.find(
      (col) =>
        col.id === "name" ||
        col.accessorKey === "name" ||
        col.id === "title" ||
        col.accessorKey === "title",
    );

    if (nameColumn) return nameColumn.id || nameColumn.accessorKey;

    // Otherwise use the first non-checkbox, non-expander column
    const firstRegularColumn = columns.find(
      (col) =>
        col.id !== "select" && col.id !== "expander" && col.id !== "actions",
    );

    return firstRegularColumn
      ? firstRegularColumn.id || firstRegularColumn.accessorKey
      : columns[0].id || columns[0].accessorKey;
  }, [columns, primaryColumn]);

  // Determine secondary columns if not specified
  const effectiveSecondaryColumns = React.useMemo(() => {
    if (secondaryColumns.length > 0) return secondaryColumns;

    // Use up to 3 columns that aren't the primary, select, expander, or actions
    return columns
      .filter(
        (col) =>
          (col.id || col.accessorKey) !== effectivePrimaryColumn &&
          col.id !== "select" &&
          col.id !== "expander" &&
          col.id !== "actions",
      )
      .slice(0, 3)
      .map((col) => col.id || col.accessorKey);
  }, [columns, effectivePrimaryColumn, secondaryColumns]);

  // Get column by ID or accessorKey
  const getColumn = React.useCallback(
    (columnId: string) => {
      return columns.find((col) => (col.id || col.accessorKey) === columnId);
    },
    [columns],
  );

  // Update the getCellContent function to properly handle cell rendering without relying on row.getValue

  const getCellContent = React.useCallback(
    (row: TData, columnId: string) => {
      const column = getColumn(columnId);
      if (!column) return null;

      // Create a cell context similar to what TanStack Table would provide
      const cellContext = {
        cell: {
          getValue: () => {
            if (column.accessorFn) {
              return column.accessorFn(row, data.indexOf(row));
            }
            if (column.accessorKey) {
              return (row as any)[column.accessorKey];
            }
            return undefined;
          },
          id: `${getRowId(row)}_${columnId}`,
        },
        column,
        getValue: () => {
          if (column.accessorFn) {
            return column.accessorFn(row, data.indexOf(row));
          }
          if (column.accessorKey) {
            return (row as any)[column.accessorKey];
          }
          return undefined;
        },
        renderValue: () => {
          if (column.cell) {
            return flexRender(column.cell, {
              column,
              row: {
                getValue: (id: string) => {
                  const col = getColumn(id);
                  if (col?.accessorFn) {
                    return col.accessorFn(row, data.indexOf(row));
                  }
                  if (col?.accessorKey) {
                    return (row as any)[col.accessorKey];
                  }
                  return undefined;
                },
                getVisibleCells: () => [],
                id: getRowId(row),
                index: data.indexOf(row),
                original: row,
              },
              table: {},
            });
          }
          if (column.accessorFn) {
            return column.accessorFn(row, data.indexOf(row));
          }
          if (column.accessorKey) {
            return (row as any)[column.accessorKey];
          }
          return undefined;
        },
        row: {
          getValue: (id: string) => {
            const col = getColumn(id);
            if (col?.accessorFn) {
              return col.accessorFn(row, data.indexOf(row));
            }
            if (col?.accessorKey) {
              return (row as any)[col.accessorKey];
            }
            return undefined;
          },
          getVisibleCells: () => [],
          id: getRowId(row),
          index: data.indexOf(row),
          original: row,
        },
        table: {},
      };

      // Render the cell content
      if (column.cell) {
        return flexRender(column.cell, cellContext);
      }

      // Fall back to accessor
      if (column.accessorFn) {
        return column.accessorFn(row, data.indexOf(row));
      }
      if (column.accessorKey) {
        return (row as any)[column.accessorKey];
      }

      return null;
    },
    [columns, data, getColumn, getRowId],
  );

  return (
    <div className="space-y-4">
      {data.map((row) => {
        const rowId = getRowId(row);
        const isSelected = selectedRows[rowId] || false;
        const isExpanded = expandedRows[rowId] || false;
        const rowStyle = getRowStyles ? getRowStyles(row) : "";

        return (
          <div className="animate-in fade-in-50 duration-300" key={rowId}>
            <Card
              data-testid={`table-card-${rowId}`}
              className={cn("overflow-hidden", rowStyle)}>
              <CardContent className="p-0">
                {/* Card header with selection, primary content, and actions */}
                <div className="flex items-center justify-between p-4 border-b">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {enableRowSelection && (
                      <Checkbox
                        aria-label="Select row"
                        checked={isSelected}
                        className="mr-1"
                        onCheckedChange={(checked) =>
                          onRowSelectionChange(rowId, !!checked)
                        }
                      />
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        {getCellContent(row, effectivePrimaryColumn)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {enableExpandableRows && (
                      <Button
                        aria-label={isExpanded ? "Collapse row" : "Expand row"}
                        onClick={() => onRowExpansionChange(rowId, !isExpanded)}
                        size="sm"
                        variant="ghost">
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    )}

                    {rowActions.length > 0 && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            className="h-8 w-8 p-0"
                            size="sm"
                            variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {rowActions.map((action, index) => (
                            <DropdownMenuItem
                              className={action.className}
                              key={index}
                              onClick={() => action.onClick(row)}>
                              {action.icon && (
                                <span className="mr-2">{action.icon}</span>
                              )}
                              {action.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>

                {/* Card body with secondary content */}
                <div className="p-4 grid gap-3">
                  {effectiveSecondaryColumns.map((columnId) => {
                    const column = getColumn(columnId);
                    if (!column) return null;

                    return (
                      <div
                        className="grid grid-cols-3 gap-2 items-center"
                        key={columnId}>
                        <div className="text-sm font-medium text-muted-foreground">
                          {column.header
                            ? typeof column.header === "function"
                              ? flexRender(column.header, { column })
                              : column.header
                            : column.id || column.accessorKey}
                        </div>
                        <div className="col-span-2 text-sm">
                          {getCellContent(row, columnId)}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Expanded content */}
                {isExpanded && enableExpandableRows && renderExpandedRow && (
                  <div className="p-4 pt-0 border-t">
                    {renderExpandedRow(row)}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );
      })}

      {data.length === 0 && (
        <Card className="p-6 text-center text-muted-foreground">
          No data to display
        </Card>
      )}
    </div>
  );
}
