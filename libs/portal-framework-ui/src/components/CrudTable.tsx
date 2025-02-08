import type { OpenNotificationParams } from "@refinedev/core";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
} from "@lumeweb/portal-framework-ui-core";
import {
  type BaseRecord,
  type SuccessErrorNotification,
  useDeleteMany,
  useModal,
} from "@refinedev/core";
import { SortingState } from "@tanstack/react-table";
import { Eye, Pencil, Trash2 } from "lucide-react";
import React from "react";

import type { DataTableProps } from "./DataTable";

import { useTableActions } from "./data-table/hooks/useTableActions";
import { DataTable } from "./DataTable";
import { TableActionsDropdown } from "./TableActionsDropdown";

export interface CrudTableProps<TData extends BaseRecord>
  extends DataTableProps<TData> {
  /**
   * aria-label for accessibility
   */
  ariaLabel?: string;
  /**
   * Bulk actions available for selected rows
   */
  bulkActions?: {
    icon: React.ReactNode;
    label: string;
    onClick: (selectedRows: TData[]) => Promise<void>;
    render?: (label: string, count: number) => React.ReactNode;
  }[];
  /**
   * Confirmation dialogs configuration
   */
  confirmations?: {
    bulkDelete?: {
      description: string;
      title: string;
    };
    delete?: {
      description: string;
      title: string;
    };
  };
  /**
   * Default sorting state
   */
  defaultSort?: SortingState;
  /**
   * Custom delete mutation function
   */
  deleteMutation?: (id: string) => Promise<void>;
  /**
   * Path for editing individual items
   */
  editPath?: string;
  /**
   * Custom error message component
   */
  errorComponent?: React.ReactNode;
  /**
   * Custom error notification for delete operations
   */
  errorNotification?: SuccessErrorNotification;
  /**
   * Callback for failed operations
   */
  onError?: (error: Error) => void;
  /**
   * Persist table state in localStorage
   */
  persistState?: boolean;
  /**
   * Whether to show delete action
   */
  showDelete?: boolean;
  /**
   * Custom success/error notifications for delete operations
   */
  successNotification?: SuccessErrorNotification;
}

export function CrudTable<TData extends BaseRecord>({
  bulkActions = [],
  deleteMutation,
  editPath,
  showDelete = true,
  ...props
}: CrudTableProps<TData>) {
  const { mutate: deleteManyItems } = useDeleteMany();
  const {
    close: closeBulkDeleteConfirm,
    show: showBulkDeleteConfirm,
    visible: bulkDeleteConfirmVisible,
  } = useModal();
  const [selectedRowsForDelete, setSelectedRowsForDelete] = React.useState<
    TData[]
  >([]);
  const { handleDelete, handleEdit, handleView } = useTableActions({
    // Only pass path fallbacks if no resource name is provided
    editPath: props.resourceName ? undefined : editPath,
    resourceName: props.resourceName,
  });

  // Merge default delete action with custom bulk actions
  const allBulkActions = [
    ...bulkActions,
    ...(showDelete
      ? [
          {
            icon: <Trash2 className="h-4 w-4" />,
            label: "Delete",
            onClick: async (selectedRows: TData[]) => {
              setSelectedRowsForDelete(selectedRows);
              showBulkDeleteConfirm();
            },
            render: (label, count) => (
              <Button className="h-8" size="sm" variant="destructive">
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                {label} ({count})
              </Button>
            ),
          },
        ]
      : []),
  ];

  return (
    <>
      <DataTable<TData>
        {...props}
        bulkActions={allBulkActions}
        columns={[
          ...props.columns.filter((col) => col.id !== "actions"),
          {
            cell: ({ row }) => (
              <TableActionsDropdown
                actions={[
                  {
                    icon: <Eye className="h-4 w-4" />,
                    label: "View",
                    onClick: () => handleView(String(row.original.id)),
                  },
                  {
                    icon: <Pencil className="h-4 w-4" />,
                    label: "Edit",
                    onClick: () => handleEdit(String(row.original.id)),
                  },
                  ...(showDelete
                    ? [
                        {
                          destructive: true,
                          icon: <Trash2 className="h-4 w-4 text-destructive" />,
                          label: "Delete",
                          onClick: () => handleDelete(String(row.original.id)),
                        },
                      ]
                    : []),
                ]}
              />
            ),
            header: "Actions",
            id: "actions",
          },
        ]}
        enableRowSelection={props.enableRowSelection ?? true}
      />

      <AlertDialog
        onOpenChange={closeBulkDeleteConfirm}
        open={bulkDeleteConfirmVisible}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {props.confirmations?.bulkDelete?.title ||
                "Delete selected items?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {props.confirmations?.bulkDelete?.description ||
                `This will permanently delete ${selectedRowsForDelete.length} items. This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={async () => {
                try {
                  if (deleteMutation) {
                    await Promise.all(
                      selectedRowsForDelete.map((row) =>
                        deleteMutation(String(row.id)),
                      ),
                    );
                  } else {
                    await deleteManyItems({
                      errorNotification: () =>
                        props.errorNotification as
                          | false
                          | OpenNotificationParams,
                      ids: selectedRowsForDelete.map((row) => String(row.id)),
                      resource: props.resourceName,
                      successNotification: () =>
                        props.successNotification as
                          | false
                          | OpenNotificationParams,
                    });
                  }
                } catch (error) {
                  props.onError?.(error as Error);
                }
                closeBulkDeleteConfirm();
              }}>
              Delete {selectedRowsForDelete.length} items
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
