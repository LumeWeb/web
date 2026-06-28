import { Button, lazyIcon } from "@lumeweb/portal-framework-ui-core";
import { BaseRecord } from "@refinedev/core";

import React from "react";

import { useTableInstance } from "./contexts";
const ChevronLeft = lazyIcon("ChevronLeft");
const ChevronRight = lazyIcon("ChevronRight");
const ChevronsLeft = lazyIcon("ChevronsLeft");
const ChevronsRight = lazyIcon("ChevronsRight");


function DefaultPagination<TData extends BaseRecord>() {
  const { table } = useTableInstance<TData>();
  const pageIndex = table.getState().pagination.pageIndex;
  const pageCount = table.getPageCount();

  return (
    <div className="flex items-center justify-center gap-4">
      <div className="flex items-center gap-2">
        <Button
          aria-label="First page"
          disabled={!table.getCanPreviousPage()}
          onClick={() => table.setPageIndex(0)}
          size="sm"
          variant="outline">
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          aria-label="Previous page"
          disabled={!table.getCanPreviousPage()}
          onClick={() => table.previousPage()}
          size="sm"
          variant="outline">
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>

      <span className="text-sm font-medium">
        {pageCount > 0 ? `Page ${pageIndex + 1} of ${pageCount}` : "No pages"}
      </span>

      <div className="flex items-center gap-2">
        <Button
          aria-label="Next page"
          disabled={!table.getCanNextPage()}
          onClick={() => table.nextPage()}
          size="sm"
          variant="outline">
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          aria-label="Last page"
          disabled={!table.getCanNextPage()}
          onClick={() => table.setPageIndex(Math.max(0, pageCount - 1))}
          size="sm"
          variant="outline">
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export { DefaultPagination };
