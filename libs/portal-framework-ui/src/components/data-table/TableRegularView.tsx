import type { BaseRecord, HttpError, LogicalFilter } from "@refinedev/core";

import {
  cn,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@lumeweb/portal-framework-ui-core";
import { flexRender } from "@tanstack/react-table";
import { GripVertical } from "lucide-react";
import React from "react";

import { ColumnFilter } from "./ColumnFilter";
import { EmptyState } from "./EmptyState";
import { UseTableReturnType } from "@refinedev/react-table";

interface TableRegularViewProps<
  TData extends BaseRecord = BaseRecord,
  TError extends HttpError = HttpError,
> {
  activeColumnFilters: Record<
    string,
    { field: string; operator: string; value: any }
  >;
  densityStyles: { row: string };
  emptyState: React.ReactNode | undefined;
  enableColumnFilters: boolean;
  enableColumnReordering?: boolean;
  enableExpandableRows: boolean;
  enableHoverActions: boolean;
  enableKeyboardNavigation: boolean;
  errorState: React.ReactNode | undefined;
  expanded: Record<string, boolean>;
  getCellStyle: (cell: any) => string;
  getRowAnimationClass: (rowId: string) => string;
  getRowAnimationStyle: (rowId: string) => React.CSSProperties;
  getRowHighlightClass: (row: any) => string;
  table: UseTableReturnType<TData, TError>;
  handleApplyColumnFilter: (
    columnId: string,
    filter: null | { field: string; operator: string; value: any },
  ) => void;
  hoverActionsPosition: "end" | "start";
  isDataError: boolean;
  isDataLoading: boolean;
  onColumnReorder?: (draggedColumnId: string, targetColumnId: string) => void;
  renderCellContent: (
    cell: any,
    rowIndex: number,
    colIndex: number,
  ) => React.ReactNode;
  renderEmptyState: () => React.ReactNode;
  renderExpandedRow: ((row: TData) => React.ReactNode) | undefined;
  renderHoverActions: ((row: any) => React.ReactNode) | undefined;
  tableColumns: any[];
}

export function TableRegularView<
  TData extends BaseRecord = BaseRecord,
  TError extends HttpError = HttpError,
>({
  activeColumnFilters,
  densityStyles,
  emptyState,
  enableColumnFilters,
  enableColumnReordering = false,
  enableExpandableRows,
  enableHoverActions,
  enableKeyboardNavigation,
  errorState,
  expanded,
  getCellStyle,
  getRowAnimationClass,
  getRowAnimationStyle,
  getRowHighlightClass,
  table,
  handleApplyColumnFilter,
  hoverActionsPosition,
  isDataError,
  isDataLoading,
  onColumnReorder,
  renderCellContent,
  renderEmptyState,
  renderExpandedRow,
  renderHoverActions,
  tableColumns,
}: TableRegularViewProps<TData, TError>) {
  // State to track drag operation
  const [draggedColumnId, setDraggedColumnId] = React.useState<null | string>(
    null,
  );

  // Handle drag start
  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    columnId: string,
  ) => {
    if (!enableColumnReordering) return;

    setDraggedColumnId(columnId);
    e.dataTransfer.setData("text/plain", columnId);
    e.dataTransfer.effectAllowed = "move";
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (!enableColumnReordering || !draggedColumnId) return;

    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  // Handle drop
  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>,
    targetColumnId: string,
  ) => {
    if (
      !enableColumnReordering ||
      !draggedColumnId ||
      draggedColumnId === targetColumnId
    )
      return;

    e.preventDefault();

    // Call the onColumnReorder callback
    if (onColumnReorder) {
      onColumnReorder(draggedColumnId, targetColumnId);
    }

    setDraggedColumnId(null);
  };

  // Handle drag end
  const handleDragEnd = () => {
    setDraggedColumnId(null);
  };

  return (
    <Table
      aria-colcount={
        enableKeyboardNavigation
          ? table.getHeaderGroups()[0].headers.length
          : undefined
      }
      aria-rowcount={
        enableKeyboardNavigation ? table.getRowModel().rows.length : undefined
      }
      role={enableKeyboardNavigation ? "grid" : undefined}>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow
            key={headerGroup.id}
            role={enableKeyboardNavigation ? "row" : undefined}>
            {headerGroup.headers.map((header, colIndex) => {
              // Skip reordering for special columns like select, expander, etc.
              const canReorder =
                enableColumnReordering &&
                !["actions", "expander", "select"].includes(header.column.id);

              return (
                <TableHead
                  aria-colindex={
                    enableKeyboardNavigation ? colIndex + 1 : undefined
                  }
                  className={cn(
                    draggedColumnId === header.column.id && "opacity-50",
                    canReorder && "cursor-move",
                  )}
                  draggable={canReorder}
                  key={header.id}
                  onDragEnd={canReorder ? handleDragEnd : undefined}
                  onDragOver={canReorder ? handleDragOver : undefined}
                  onDragStart={
                    canReorder
                      ? (e) => handleDragStart(e, header.column.id)
                      : undefined
                  }
                  onDrop={
                    canReorder
                      ? (e) => handleDrop(e, header.column.id)
                      : undefined
                  }
                  role={enableKeyboardNavigation ? "columnheader" : undefined}>
                  {header.isPlaceholder ? null : (
                    <div className="flex items-center gap-1">
                      {canReorder && (
                        <span className="mr-1 text-muted-foreground">
                          <GripVertical className="h-4 w-4" />
                        </span>
                      )}
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                      {enableColumnFilters && header.column.getCanFilter() ? (
                        <ColumnFilter
                          columnId={header.column.id}
                          columnLabel={header.column.columnDef.header as string}
                          columnOptions={
                            (header.column.columnDef.meta as any)
                              ?.editOptions as {
                              label: string;
                              value: boolean | number | string;
                            }[]
                          }
                          columnType={
                            (header.column.columnDef.meta as any)
                              ?.type as string
                          }
                          existingFilter={
                            activeColumnFilters[header.column.id] as unknown as
                              | LogicalFilter
                              | undefined
                          }
                          hasActiveFilter={
                            !!activeColumnFilters[header.column.id]
                          }
                          onApplyFilter={(filter) =>
                            handleApplyColumnFilter(
                              header.column.id,
                              filter as any,
                            )
                          }
                        />
                      ) : null}
                    </div>
                  )}
                </TableHead>
              );
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {isDataLoading ? (
          // Loading state
          <TableRow>
            <TableCell
              className="h-24 text-center"
              colSpan={tableColumns.length}>
              <div className="flex justify-center items-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <span className="ml-2">Loading...</span>
              </div>
            </TableCell>
          </TableRow>
        ) : isDataError ? (
          // Error state
          <TableRow>
            <TableCell
              className="h-24 text-center"
              colSpan={tableColumns.length}>
              {errorState || (
                <EmptyState
                  description="There was an error loading the data. Please try again."
                  title="Error loading data"
                  type="error"
                />
              )}
            </TableCell>
          </TableRow>
        ) : table.getRowModel().rows.length === 0 ? (
          // Empty state
          <TableRow>
            <TableCell
              className="h-24 text-center"
              colSpan={tableColumns.length}>
              {emptyState || renderEmptyState()}
            </TableCell>
          </TableRow>
        ) : (
          // Data rows
          table.getRowModel().rows.map((row, rowIndex) => (
            <React.Fragment key={row.id}>
              <TableRow
                aria-expanded={
                  enableKeyboardNavigation && enableExpandableRows
                    ? expanded[row.id]
                    : undefined
                }
                aria-rowindex={
                  enableKeyboardNavigation ? rowIndex + 1 : undefined
                }
                aria-selected={
                  enableKeyboardNavigation ? row.getIsSelected() : undefined
                }
                className={cn(
                  densityStyles.row,
                  getRowHighlightClass(row),
                  getRowAnimationClass(row.id),
                )}
                key={row.id}
                role={enableKeyboardNavigation ? "row" : undefined}
                style={getRowAnimationStyle(row.id)}>
                {row.getVisibleCells().map((cell, colIndex) => {
                  return (
                    <TableCell
                      className={cn(
                        getCellStyle(cell),
                        enableHoverActions && "group relative",
                      )}
                      key={cell.id}
                      role={enableKeyboardNavigation ? "gridcell" : undefined}>
                      {renderCellContent(cell, rowIndex, colIndex)}

                      {/* Render hover actions if enabled */}
                      {enableHoverActions && renderHoverActions && (
                        <div
                          className={cn(
                            "absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity",
                            hoverActionsPosition === "start"
                              ? "left-1"
                              : "right-1",
                          )}>
                          {renderHoverActions({ row })}
                        </div>
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
              {enableExpandableRows && expanded[row.id] && renderExpandedRow ? (
                <TableRow>
                  <TableCell
                    colSpan={100}
                    role={enableKeyboardNavigation ? "gridcell" : undefined}>
                    {renderExpandedRow(row.original)}
                  </TableCell>
                </TableRow>
              ) : null}
            </React.Fragment>
          ))
        )}
      </TableBody>
    </Table>
  );
}
