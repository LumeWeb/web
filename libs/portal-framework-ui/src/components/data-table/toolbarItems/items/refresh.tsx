import { Button } from "@lumeweb/portal-framework-ui-core";
import { RefreshCw } from "lucide-react";
import React from "react";
import { BaseRecord } from "@refinedev/core";

import { registerAction, ToolbarItemType } from "@/components/data-table";
import type {
  ToolbarActionItem,
  ToolbarItemComponentProps,
} from "@/components/data-table/DataTable.types";

function RefreshToolbarItem<TData extends BaseRecord>({
  refineContext,
  table,
}: ToolbarItemComponentProps<TData>) {
  const handleRefresh = () => {
    // First try to refresh through Refine if available
    if (refineContext) {
      refineContext.refetch();
      return;
    }

    // Fallback to React Table refresh if no Refine contexts
    table.options.onStateChange?.({
      ...table.getState(),
      pagination: {
        ...table.getState().pagination,
        pageIndex: 0,
      },
    });
  };

  const isLoading = refineContext?.isLoading || false;

  return (
    <Button
      aria-label="Refresh"
      disabled={isLoading}
      onClick={handleRefresh}
      size="sm"
      variant="outline"
      title="Refresh data">
      <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
    </Button>
  );
}

function registerRefreshToolbarItem<TData extends BaseRecord>() {
  const item: ToolbarActionItem<TData> = {
    type: ToolbarItemType.ACTION,
    id: "refresh",
    label: "Refresh",
    icon: <RefreshCw className="h-4 w-4" />,
    onClick: (ctx, table) => {
      // First try to refresh through Refine if available
      if (ctx) {
        ctx.refineContext?.refetch();
        return;
      }

      // Fallback to React Table refresh if no Refine contexts
      table.options.onStateChange?.({
        ...table.getState(),
        pagination: {
          ...table.getState().pagination,
          pageIndex: 0,
        },
      });
    },
    tooltip: "Refresh data",
    variant: "outline",
    size: "sm",
  };

  registerAction<TData>("refresh", item);
}

export { registerRefreshToolbarItem };
