import type { BaseRecord, HttpError } from "@refinedev/core";
import type { Table } from "@tanstack/react-table";

import {
  Button,
  cn,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@lumeweb/portal-framework-ui-core";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import React from "react";

import { useScreenReaderAnnouncement } from "../screen-reader/hooks/useScreenReaderAnnouncement";
import { UseTableReturnType } from "@refinedev/react-table";

// Update the interface to remove the unused TError generic
interface TablePaginationProps<
  TData extends BaseRecord = BaseRecord,
  TError extends HttpError = HttpError,
> {
  className?: string;
  enableKeyboardNavigation?: boolean;
  layout?: "combined" | "separated";
  table: UseTableReturnType<TData, TError>;
}

export function TablePagination<
  TData extends BaseRecord = BaseRecord,
  TError extends HttpError = HttpError,
>({
  className,
  enableKeyboardNavigation = false,
  layout = "separated",
  table,
}: TablePaginationProps<TData, TError>) {
  // Add screen reader announcement
  const { announce } = useScreenReaderAnnouncement();
  const isLoading = table.refineCore.tableQuery.isLoading;

  // Use default values while loading
  const pageIndex = isLoading ? 0 : table.getState().pagination?.pageIndex || 0;
  const pageSize = isLoading ? 10 : table.getState().pagination?.pageSize || 10;
  const rowCount = isLoading ? 0 : table.getFilteredRowModel().rows.length || 0;
  const pageCount = isLoading ? 0 : Math.ceil(rowCount / pageSize);
  const canPreviousPage = isLoading ? false : table.getCanPreviousPage();
  const canNextPage = isLoading
    ? false
    : table.getCanNextPage() || pageIndex === pageCount - 1;

  // Calculate display indices
  const displayIndexStart = rowCount === 0 ? 0 : pageIndex * pageSize + 1;
  const displayIndexEnd = Math.min((pageIndex + 1) * pageSize, rowCount);

  // Enhanced navigation functions with announcements
  const handlePageSizeChange = (value: string) => {
    const newSize = Number(value);
    table.setPageSize(newSize);
    announce(`Showing ${newSize} rows per page`, "polite");
  };

  const handleFirstPage = () => {
    table.setPageIndex(0);
    announce(`Navigated to first page`, "polite");
  };

  const handlePreviousPage = () => {
    table.previousPage();
    announce(`Navigated to page ${pageIndex}`, "polite");
  };

  const handleNextPage = () => {
    table.nextPage();
    announce(`Navigated to page ${pageIndex + 2}`, "polite");
  };

  const handleLastPage = () => {
    table.setPageIndex(pageCount - 1);
    announce(`Navigated to last page, page ${pageCount}`, "polite");
  };

  if (isLoading) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex items-center justify-between px-2 h-14",
        layout === "separated" && "border border-t-2 border-x-0",
        layout === "combined" && "bg-muted/40 rounded-lg p-2",
        className,
      )}>
      <div className="flex items-center space-x-2">
        <p className="text-sm text-foreground">Rows per page</p>
        <Select onValueChange={handlePageSizeChange} value={`${pageSize}`}>
          <SelectTrigger className="h-8 w-[70px]">
            <SelectValue placeholder={pageSize} />
          </SelectTrigger>
          <SelectContent side="top">
            {[10, 20, 30, 40, 50].map((size) => (
              <SelectItem key={size} value={`${size}`}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center justify-center text-sm text-foreground">
          {rowCount > 0 ? (
            <>
              Showing
              <span className="font-medium mx-1">{displayIndexStart}</span>
              to
              <span className="font-medium mx-1">{displayIndexEnd}</span>
              of
              <span className="font-medium mx-1">{rowCount}</span>
            </>
          ) : (
            "No results"
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            aria-label="Go to first page"
            className="hidden h-8 w-8 p-0 lg:flex"
            disabled={!canPreviousPage}
            onClick={handleFirstPage}
            tabIndex={enableKeyboardNavigation ? 0 : undefined}
            variant="outline">
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            aria-label="Go to previous page"
            className="h-8 w-8 p-0"
            disabled={!canPreviousPage}
            onClick={handlePreviousPage}
            tabIndex={enableKeyboardNavigation ? 0 : undefined}
            variant="outline">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            aria-label="Go to next page"
            className="h-8 w-8 p-0"
            disabled={!canNextPage}
            onClick={handleNextPage}
            tabIndex={enableKeyboardNavigation ? 0 : undefined}
            variant="outline">
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            aria-label="Go to last page"
            className="hidden h-8 w-8 p-0 lg:flex"
            disabled={!canNextPage}
            onClick={handleLastPage}
            tabIndex={enableKeyboardNavigation ? 0 : undefined}
            variant="outline">
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
