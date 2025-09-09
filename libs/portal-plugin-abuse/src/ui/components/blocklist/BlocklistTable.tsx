import type { BlockedContent } from "@/types/blocklist";

import {
  ACTION_BADGE_CONFIG,
  REASON_BADGE_CONFIG,
  SEVERITY_BADGE_CONFIG,
  SOURCE_BADGE_CONFIG,
} from "@/types/badge-configs";
import { RefineResource } from "@/types/resources";
import { formatFileSize } from "@/ui/util";
import {
  ThemedBadge,
  CrudTable,
  useDialog,
} from "@lumeweb/portal-framework-ui";
import { Button } from "@lumeweb/portal-framework-ui-core";

import { useDeleteMany, useNotification } from "@refinedev/core";
import { createColumnHelper } from "@tanstack/react-table";
import { format } from "date-fns";
import { Eye, Trash2 } from "lucide-react";
import React from "react";

import { AddBlockConfig } from "./AddBlockDialog.config";
import { BlockDetailsContent } from "./BlockDetailsContent";

export function BlocklistTable() {
  const { openDialog } = useDialog();
  const { open: openNotification } = useNotification();
  const { mutate: deleteMany } = useDeleteMany();
  const columnHelper = createColumnHelper<BlockedContent>();

  const columns = [
    columnHelper.accessor("fileName", {
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate font-medium">
          {row.original.fileName}
        </div>
      ),
      header: "File Name",
    }),
    columnHelper.accessor("hash", {
      cell: ({ row }) => (
        <div className="max-w-[120px] truncate font-mono text-xs">
          {row.original.hash}
        </div>
      ),
      header: "Hash",
    }),
    columnHelper.accessor("mimeType", {
      cell: ({ row }) => (
        <div className="font-mono text-xs">{row.original.mimeType}</div>
      ),
      header: "MIME Type",
    }),
    columnHelper.accessor("reason", {
      cell: ({ row }) => (
        <ThemedBadge config={REASON_BADGE_CONFIG} value={row.original.reason} />
      ),
      header: "Reason",
    }),
    columnHelper.accessor("severity", {
      cell: ({ row }) => (
        <ThemedBadge
          config={SEVERITY_BADGE_CONFIG}
          value={row.original.severity}
        />
      ),
      header: "Severity",
    }),
    columnHelper.accessor("action", {
      cell: ({ row }) => (
        <ThemedBadge config={ACTION_BADGE_CONFIG} value={row.original.action} />
      ),
      header: "Action",
    }),
    columnHelper.accessor("source", {
      cell: ({ row }) => (
        <ThemedBadge config={SOURCE_BADGE_CONFIG} value={row.original.source} />
      ),
      header: "Source",
    }),
    columnHelper.accessor("size", {
      cell: ({ row }) => <div>{formatFileSize(row.original.size)}</div>,
      header: "Size",
    }),
    columnHelper.accessor("created_at", {
      cell: ({ row }) => (
        <div>{format(new Date(row.original.created_at), "MMM d, yyyy")}</div>
      ),
      header: "Created At",
    }),
  ];

  const handleBulkDelete = async (selectedRows: BlockedContent[]) => {
    const selectedIds = selectedRows.map((row) => row.id);

    deleteMany(
      {
        ids: selectedIds,
        resource: RefineResource.Blocklist,
      },
      {
        onError: () => {
          openNotification?.({
            description:
              "There was an error removing the content from the blocklist.",
            message: "Delete failed",
            type: "error",
          });
        },
        onSuccess: () => {
          openNotification?.({
            description: `${selectedIds.length} items have been successfully removed from the blocklist.`,
            message: "Blocks deleted",
            type: "success",
          });
        },
      },
    );
  };

  return (
    <>
      <CrudTable<BlockedContent>
        addButtonProps={{
          label: "Add to Blocklist",
          onClick: () =>
            openDialog({
              ...AddBlockConfig,
            }),
        }}
        // displayConfig removed since it's not implemented in dialog
        ariaLabel="Blocklist table"
        bulkActions={[
          {
            icon: <Trash2 className="h-4 w-4" />,
            label: "Delete",
            onClick: handleBulkDelete,
            render: (label, count) => (
              <Button className="h-8" size="sm" variant="destructive">
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                {label} ({count})
              </Button>
            ),
          },
        ]}
        columns={columns}
        defaultSort={[{ desc: true, id: "createdAt" }]}
        enableAdvancedFilters
        enableExport
        enableRowSelection
        resourceName={RefineResource.Blocklist}
        rowActions={[
          {
            icon: <Eye className="h-4 w-4" />,
            label: "View Details",
            onClick: (row) => {
              openDialog({
                content: <BlockDetailsContent block={row.original} />,
                size: "2xl",
                title: "Block Details",
                type: "custom",
              });
              return false; // Prevent CrudTable from handling
            },
          },
          {
            destructive: true,
            icon: <Trash2 className="h-4 w-4 text-destructive" />,
            label: "Delete",
            onClick: (row) => handleBulkDelete([row.original]),
          },
        ]}
      />
    </>
  );
}
