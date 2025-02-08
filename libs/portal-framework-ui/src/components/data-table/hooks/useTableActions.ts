import { useGo, useNavigation, useNotification } from "@refinedev/core";
import { useCallback } from "react";

export const useTableActions = (options: {
  editPath?: string;
  resourceName?: string;
  viewPath?: string;
}) => {
  const { open: openNotification } = useNotification();
  const go = useGo();
  const { push } = useNavigation();

  const handleView = useCallback(
    (id: string) => {
      if (options.resourceName) {
        go({
          to: {
            action: "show",
            id,
            resource: options.resourceName,
          },
        });
      } else if (options.viewPath) {
        push(`${options.viewPath}/${id}`);
      }
    },
    [options.resourceName, options.viewPath, go, push],
  );

  const handleEdit = useCallback(
    (id: string) => {
      if (options.resourceName) {
        go({
          to: {
            action: "edit",
            id,
            resource: options.resourceName,
          },
        });
      } else if (options.editPath) {
        push(`${options.editPath}/${id}`);
      }
    },
    [options.resourceName, options.editPath, go, push],
  );

  const handleDelete = useCallback(
    async (_id: string) => {
      try {
        // Delete logic would be implemented here
        openNotification?.({
          message: "Item deleted successfully",
          type: "success",
        });
      } catch (error: any) {
        console.error("Delete failed for id:", _id, error);
        openNotification?.({
          description: error.message,
          message: "Delete failed",
          type: "error",
        });
      }
    },
    [openNotification],
  );

  const handleBulkAction = useCallback(
    async (
      action: (selectedIds: string[]) => Promise<void>,
      selectedIds: string[],
    ) => {
      try {
        await action(selectedIds);
        openNotification?.({
          message: "Bulk action completed successfully",
          type: "success",
        });
      } catch (error: any) {
        console.error("Bulk action failed:", error);
        openNotification?.({
          description: error.message,
          message: "Bulk action failed",
          type: "error",
        });
      }
    },
    [openNotification],
  );

  return {
    handleBulkAction,
    handleDelete,
    handleEdit,
    handleView,
  };
};
