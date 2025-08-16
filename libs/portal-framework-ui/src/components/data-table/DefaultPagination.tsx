import { Button } from "@lumeweb/portal-framework-ui-core";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import React from "react";

import { useTable } from "./Table.context";

function DefaultPagination<TData>() {
  const { table } = useTable<TData>();
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
        Page {pageIndex + 1} of {pageCount}
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
          onClick={() => table.setPageIndex(pageCount - 1)}
          size="sm"
          variant="outline">
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export { DefaultPagination };
