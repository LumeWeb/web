import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from "@radix-ui/react-icons";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UseTableReturnType } from "@refinedev/react-table";
import { BaseRecord, type HttpError } from "@refinedev/core";

interface DataTablePaginationProps<
  TData extends BaseRecord = BaseRecord,
  TError extends HttpError = HttpError,
> {
  table: UseTableReturnType<TData, TError>;
}

export function DataTablePagination({ table }: DataTablePaginationProps) {
  const rowCount = table.refineCore.tableQueryResult?.data?.total || 0;
  const pageCount = table.getPageCount();
  const { pageIndex, pageSize } = table.getState().pagination;

  const displayIndexStart = rowCount === 0 ? 0 : pageIndex * pageSize + 1;
  const displayIndexEnd = Math.min((pageIndex + 1) * pageSize, rowCount);

  return (
    <div className="flex items-center justify-between px-2 border border-t-2 border-x-0 h-14">
      <div className="flex items-center space-x-2">
        <p className="text-sm text-foreground">Rows per page</p>
        <Select
          value={`${pageSize}`}
          onValueChange={(value) => {
            table.setPageSize(Number(value));
          }}>
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
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}>
            <span className="sr-only">Go to first page</span>
            <DoubleArrowLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}>
            <span className="sr-only">Go to previous page</span>
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage() || pageIndex === pageCount - 1}>
            <span className="sr-only">Go to next page</span>
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(pageCount - 1)}
            disabled={!table.getCanNextPage() || pageIndex === pageCount - 1}>
            <span className="sr-only">Go to last page</span>
            <DoubleArrowRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
