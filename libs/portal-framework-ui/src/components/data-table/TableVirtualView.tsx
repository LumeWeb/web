import React from "react";

import { EmptyState } from "./EmptyState";
import { VirtualScrollTable } from "./VirtualScrollTable";

interface TableVirtualViewProps<TData extends Record<string, any>> {
  cellRefs: React.RefObject<Record<string, HTMLElement | null>>;
  emptyState: React.ReactNode | undefined;
  enableExpandableRows: boolean;
  enableKeyboardNavigation: boolean;
  enableRowSelection: boolean;
  errorState: React.ReactNode | undefined;
  estimateSize: number;
  expanded: Record<string, boolean>;
  focusedCell: null | { colIndex: number; rowIndex: number };
  getCellStyle: (cell: any) => string;
  getHeaderGroups: () => any[];
  getRowAnimationClass: (rowId: string) => string;
  getRowAnimationStyle: (rowId: string) => React.CSSProperties;
  getRowHighlightClass: (row: any) => string;
  getRowModel: () => any;
  isDataError: boolean;
  isDataLoading: boolean;
  isLoadingMore: boolean;
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
  renderEmptyState: () => React.ReactNode;
  renderExpandedRow: ((row: TData) => React.ReactNode) | undefined;
  scrollToIndex: number | undefined;
  setFocusedCell: (cell: null | { colIndex: number; rowIndex: number }) => void;
  tableHeight: number;
  virtualData: TData[];
}

export function TableVirtualView<TData extends Record<string, any>>({
  cellRefs,
  emptyState,
  enableExpandableRows,
  enableKeyboardNavigation,
  enableRowSelection,
  errorState,
  estimateSize,
  expanded,
  focusedCell,
  getCellStyle,
  getHeaderGroups,
  getRowAnimationClass,
  getRowAnimationStyle,
  getRowHighlightClass,
  getRowModel,
  isDataError,
  isDataLoading,
  isLoadingMore,
  onScroll,
  overscan,
  renderCellContent,
  renderEmptyState,
  renderExpandedRow,
  scrollToIndex,
  setFocusedCell,
  tableHeight,
  virtualData,
}: TableVirtualViewProps<TData>) {
  return (
    <div className="relative">
      {isDataLoading && !isLoadingMore ? (
        // Initial loading state
        <div className="h-24 flex justify-center items-center border rounded-md">
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-2">Loading...</span>
          </div>
        </div>
      ) : isDataError ? (
        // Error state
        <div className="h-24 flex justify-center items-center border rounded-md">
          {errorState ? (
            errorState
          ) : (
            <EmptyState
              description="There was an error loading the data. Please try again."
              title="Error loading data"
              type="error"
            />
          )}
        </div>
      ) : virtualData.length === 0 ? (
        // Empty state - properly implemented now
        <div className="h-24 flex justify-center items-center border rounded-md">
          {emptyState || renderEmptyState()}
        </div>
      ) : ( // Data is not empty, not loading, and not error - render table
        // Virtual scroll table
        <div className="relative">
          <VirtualScrollTable
            cellRefs={cellRefs}
            data={virtualData}
            enableExpandableRows={enableExpandableRows}
            enableKeyboardNavigation={enableKeyboardNavigation}
            enableRowSelection={enableRowSelection}
            estimateSize={estimateSize}
            expanded={expanded}
            focusedCell={focusedCell}
            getCellStyle={getCellStyle}
            getHeaderGroups={getHeaderGroups}
            getRowAnimationClass={getRowAnimationClass}
            getRowAnimationStyle={getRowAnimationStyle}
            getRowHighlightClass={getRowHighlightClass}
            getRowModel={getRowModel}
            onScroll={onScroll}
            overscan={overscan}
            renderCellContent={renderCellContent}
            renderExpandedRow={renderExpandedRow}
            scrollToIndex={scrollToIndex}
            setFocusedCell={setFocusedCell}
            tableHeight={tableHeight}
          />

          {/* Loading indicator for progressive loading */}
          {isLoadingMore && (
            <div className="absolute bottom-0 left-0 right-0 flex justify-center items-center p-2 bg-background/80 border-t">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
              <span className="text-sm">Loading more...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
