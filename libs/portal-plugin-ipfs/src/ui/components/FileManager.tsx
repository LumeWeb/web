import React, { useEffect, useRef } from "react";

// Helper function to generate filters based on currentPath
const generateInitialFilters = (path: string | null) => {
  if (!path) {
    return [];
  }

  return [
    {
      field: "parent_path",
      operator: "eq",
      value: path,
    },
  ];
};
import {
  type ColumnDef,
  Copyable,
  DataTable,
  DataTableController,
  formatFileSize,
  SkeletonLoader,
  type TableActionItem,
  type TableControls,
  type ToolbarConfig,
  ToolbarItemAlignment,
  useDialog,
} from "@lumeweb/portal-framework-ui";
import { Breadcrumbs } from "./Breadcrumbs";
import { PinItem } from "./toolbar/PinItem";
import type { FileManagerItem } from "@/client";
import {
  FileManagerProvider,
  useFileManagerContext,
} from "@/ui/context/FileManager";
import { Download, File, Folder, PinOff } from "lucide-react";
import { createUnpinDialogConfig } from "@/ui/dialogs/unpinDialog";
import { useNotification } from "@refinedev/core";

const FileManagerInner: React.FC = () => {
  const {
    currentPath,
    navigateToPath,
    handleUnpin,
    handleDownload,
    isInitialized,
    featureError,
    setRefreshData,
  } = useFileManagerContext();

  const { openDialog } = useDialog();
  const { open } = useNotification();

  const tableControlsRef = useRef<TableControls | null>(null);

  // Sync URL when changes
  useEffect(() => {
    if (tableControlsRef.current && currentPath) {
      tableControlsRef.current.setFilters(generateInitialFilters(currentPath));
    }
  }, [currentPath]);

  const columns: ColumnDef<FileManagerItem>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        const item = row.original;
        const displayText =
          item.name && item.name.trim() !== "" ? item.name : item.cid;
        return (
          <div
            className={`flex items-center gap-2 ${
              item.is_directory ? "hover:text-primary cursor-pointer" : ""
            }`}
            onClick={() => {
              if (item.is_directory) {
                navigateToPath(item.path);
              }
            }}>
            {item.is_directory ? (
              <Folder className="text-primary h-4 w-4" />
            ) : (
              <File className="text-primary h-4 w-4" />
            )}
            <span>{displayText}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "cid",
      header: "CID",
      cell: ({ row }) => {
        const item = row.original;
        return item.cid ? (
          <Copyable text={item.cid} maxLength={15} />
        ) : item.is_directory ? (
          <span>—</span>
        ) : (
          <span></span>
        );
      },
    },
    {
      accessorKey: "size",
      header: "Size",
      cell: ({ row }) => {
        const item = row.original;
        return item.size
          ? formatFileSize(item.size)
          : item.is_directory
            ? "—"
            : "";
      },
    },
    {
      accessorKey: "created",
      header: "Created On",
      cell: ({ row }) => {
        const item = row.original;
        if (!item.created) {
          return "—";
        }
        const date = new Date(item.created);
        return !isNaN(date.getTime()) ? date.toLocaleDateString() : "—";
      },
    },
  ];

  const toolbarConfig: ToolbarConfig<FileManagerItem> = {
    defaultAlignment: ToolbarItemAlignment.RIGHT,
    justifyBetween: true,
    items: [PinItem()],
  };

  // Handle feature error state
  if (featureError) {
    return (
      <div className="flex-1 p-6">
        <div className="border-border bg-background rounded-lg border p-8">
          <div className="text-destructive text-center">
            Failed to initialize: {featureError?.message}
          </div>
        </div>
      </div>
    );
  }

  // Show loading state while initializing
  if (!isInitialized) {
    return (
      <div className="flex-1 p-6">
        <div className="border-border bg-background rounded-lg border p-8">
          <SkeletonLoader rows={5} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6">
      <div className="space-y-4">
        <div>
          <h1 className="text-foreground text-2xl font-semibold">
            IPFS File Manager
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your files stored on IPFS
          </p>
        </div>

        {/* Breadcrumb Navigation */}
        <Breadcrumbs />

        {/* Files Table */}
        <div className="bg-background border-border rounded-lg border">
          <DataTable
            columns={columns}
            toolbar={toolbarConfig}
            refetchInterval={5000}
            resource="ipfs/files/directory"
            emptyStateMessage="No files found in this folder"
            control={
              <DataTableController
                onControlsReady={(controls) => {
                  tableControlsRef.current = controls;
                  // Update the refreshData function in context
                  setRefreshData?.(controls.refetch);
                }}
              />
            }
            actionMenu={{
              items: [
                {
                  icon: <Download className="h-4 w-4" />,
                  label: "Download",
                  onClick: (row) => handleDownload(row.cid),
                  tooltip: "Download file",
                  disabled: (row) => row.is_directory,
                },
                {
                  icon: <PinOff className="h-4 w-4" />,
                  label: "Unpin",
                  onClick: (row) => {
                    const dialogConfig = createUnpinDialogConfig(
                      row.cid,
                      handleUnpin,
                      open,
                    );
                    openDialog(dialogConfig);
                  },
                  tooltip: "Unpin file or directory",
                  disabled: (row) => row?.unpinnable,
                },
              ] as TableActionItem<FileManagerItem>[],
            }}
            refineCoreProps={{
              syncWithLocation: false,
              filters: {
                initial: generateInitialFilters(currentPath),
              },
              pagination: {
                current: 1,
                pageSize: 100,
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export const FileManager: React.FC = (props) => {
  return (
    <FileManagerProvider>
      <FileManagerInner {...props} />
    </FileManagerProvider>
  );
};
