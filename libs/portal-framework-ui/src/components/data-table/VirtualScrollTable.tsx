import { cn } from "@lumeweb/portal-framework-ui-core";
import React from "react";

interface VirtualScrollTableProps<TData> {
  cellRefs: React.RefObject<Record<string, HTMLElement | null>>;
  data: TData[];
  enableExpandableRows: boolean;
  enableKeyboardNavigation: boolean;
  enableRowSelection: boolean;
  estimateSize: number;
  expanded: Record<string, boolean>;
  focusedCell: null | { colIndex: number; rowIndex: number };
  getCellStyle: (cell: any) => string;
  getHeaderGroups: () => any[];
  getRowAnimationClass: (rowId: string) => string;
  getRowAnimationStyle: (rowId: string) => React.CSSProperties;
  getRowHighlightClass: (row: any) => string;
  getRowModel: () => any;
  onScroll: (info: {
    scrollDirection: "backward" | "forward";
    scrollOffset: number;
  }) => void;
  overscan: number;
  renderCellContent: (
    cell: any,
    rowIndex: number,
    colIndex: number,
  ) => React.ReactNode;
  renderExpandedRow: ((row: TData) => React.ReactNode) | undefined;
  scrollToIndex: number | undefined;
  setFocusedCell: (cell: null | { colIndex: number; rowIndex: number }) => void;
  tableHeight: number;
}

export function VirtualScrollTable<TData extends Record<string, any>>({
  cellRefs,
  data,
  enableExpandableRows,
  enableKeyboardNavigation,
  enableRowSelection,
  estimateSize,
  expanded,
  focusedCell,
  getCellStyle,
  getHeaderGroups,
  getRowAnimationClass,
  getRowAnimationStyle,
  getRowHighlightClass,
  getRowModel,
  onScroll,
  overscan,
  renderCellContent,
  renderExpandedRow,
  scrollToIndex,
  setFocusedCell,
  tableHeight,
}: VirtualScrollTableProps<TData>) {
  const scrollContainerRef = React.useRef<
    HTMLDivElement & { lastScrollTop?: number }
  >(null);

  // Use the data prop to render rows if provided, otherwise use getRowModel
  const rows =
    data?.length > 0
      ? data.map((item, index) => ({
          getVisibleCells: () => {
            // Create cells from the item properties
            return Object.keys(item).map((key) => ({
              column: { id: key },
              getValue: () => (item as any)[key],
              id: `${String((item as any).id || index)}-${key}`,
            }));
          },
          id: String((item as any).id || `row-${index}`),
          original: item,
        }))
      : getRowModel().rows;

  React.useEffect(() => {
    if (scrollToIndex !== undefined && scrollContainerRef.current) {
      const scrollOffset = scrollToIndex * estimateSize;
      scrollContainerRef.current.scrollTop = scrollOffset;
    }
  }, [scrollToIndex, estimateSize]);

  // Handle keyboard navigation focus
  React.useEffect(() => {
    if (enableKeyboardNavigation && focusedCell && cellRefs.current) {
      const cellKey = `${focusedCell.rowIndex}-${focusedCell.colIndex}`;
      const cellElement = cellRefs.current[cellKey];
      if (cellElement) {
        cellElement.focus();
        // Ensure the focused cell is visible in the viewport
        const containerTop = scrollContainerRef.current?.scrollTop || 0;
        const cellTop = focusedCell.rowIndex * estimateSize;

        if (cellTop < containerTop) {
          // Cell is above viewport
          scrollContainerRef.current?.scrollTo({ top: cellTop });
        } else if (cellTop + estimateSize > containerTop + tableHeight) {
          // Cell is below viewport
          scrollContainerRef.current?.scrollTo({
            top: cellTop - tableHeight + estimateSize,
          });
        }
      }
    }
  }, [
    focusedCell,
    enableKeyboardNavigation,
    cellRefs,
    estimateSize,
    tableHeight,
  ]);

  return (
    <div
      aria-colcount={
        enableKeyboardNavigation
          ? getHeaderGroups()[0]?.headers.length
          : undefined
      }
      aria-rowcount={enableKeyboardNavigation ? rows.length : undefined}
      className="relative overflow-auto"
      data-testid="virtual-scroll-container" // Add data-testid for easier testing
      onScroll={(e) => {
        const scrollOffset = e.currentTarget.scrollTop;
        const scrollDirection =
          e.currentTarget.scrollTop >
          (scrollContainerRef.current?.lastScrollTop || 0)
            ? "forward"
            : "backward";
        if (scrollContainerRef.current) {
          scrollContainerRef.current.lastScrollTop = e.currentTarget.scrollTop;
        }
        // Pass the actual scroll offset, not a normalized value
        onScroll({ scrollDirection, scrollOffset: scrollOffset });
      }}
      ref={scrollContainerRef}
      role={enableKeyboardNavigation ? "grid" : undefined}
      style={{ height: tableHeight }}
      tabIndex={enableKeyboardNavigation ? 0 : undefined}>
      <div style={{ height: rows.length * estimateSize, width: "100%" }}>
        {rows.map((row, rowIndex) => {
          // Calculate the top offset for each row
          const top = rowIndex * estimateSize;

          // Only render rows that are within the visible range
          if (
            top <
              (scrollContainerRef.current?.scrollTop || 0) -
                estimateSize * overscan ||
            top >
              (scrollContainerRef.current?.scrollTop || 0) +
                tableHeight +
                estimateSize * overscan
          ) {
            return null;
          }

          return (
            <React.Fragment key={row.id}>
              <div
                aria-rowindex={
                  enableKeyboardNavigation ? rowIndex + 1 : undefined
                }
                // Apply aria-selected based on row.getIsSelected()
                aria-selected={
                  enableKeyboardNavigation && enableRowSelection
                    ? row.getIsSelected?.()
                    : undefined
                }
                className={cn(
                  "absolute top-0 left-0 w-full border-b",
                  // Apply highlight class
                  getRowHighlightClass(row),
                  // Apply animation class
                  getRowAnimationClass(row.id),
                  enableRowSelection && "hover:bg-muted/50 cursor-pointer",
                )}
                key={row.id}
                role={enableKeyboardNavigation ? "row" : undefined}
                style={{
                  height: estimateSize,
                  top: top,
                  // Apply animation style
                  ...getRowAnimationStyle(row.id),
                }}>
                <div
                  className="grid grid-cols-[repeat(var(--table-col-count),minmax(0,1fr))]"
                  style={
                    {
                      "--table-col-count": getHeaderGroups()[0]?.headers.length,
                    } as React.CSSProperties
                  }>
                  {row.getVisibleCells().map((cell: any, colIndex: number) => (
                    <div
                      // Apply cell style class
                      className={cn("p-4", getCellStyle(cell))}
                      key={cell.id}
                      onClick={() => {
                        if (enableKeyboardNavigation) {
                          setFocusedCell({ colIndex, rowIndex });
                        }
                      }}
                      ref={(el) => {
                        if (enableKeyboardNavigation && cellRefs.current) {
                          cellRefs.current[`${rowIndex}-${colIndex}`] =
                            el as HTMLElement;
                        }
                      }}
                      role={enableKeyboardNavigation ? "gridcell" : undefined}
                      style={{ height: estimateSize }}
                      // Set tabIndex based on focusedCell
                      tabIndex={
                        enableKeyboardNavigation &&
                        focusedCell?.rowIndex === rowIndex &&
                        focusedCell?.colIndex === colIndex
                          ? 0
                          : -1
                      }>
                      {renderCellContent(cell, rowIndex, colIndex)}
                    </div>
                  ))}
                </div>
              </div>
              {enableExpandableRows && expanded[row.id] && renderExpandedRow ? (
                <div
                  className="absolute top-0 left-0 w-full"
                  style={{ top: top + estimateSize }}>
                  {renderExpandedRow(row.original)}
                </div>
              ) : null}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
