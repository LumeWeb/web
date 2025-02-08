import React, { useCallback } from "react";

import { useScreenReaderAnnouncement } from "../../screen-reader/hooks/useScreenReaderAnnouncement";

export interface UseCellEditingOptions<TData> {
  editedValues: Record<string, Record<string, any>>;
  editingCell: null | {
    columnId: string;
    rowId: string;
    value: any;
  };
  enableDirectCellEdit: boolean;
  enableInlineEdit: boolean;
  getRowModel: () => { rows: any[] };
  onSaveEdit?: (
    rowId: string,
    data: Record<string, any>,
    originalData: TData,
  ) => Promise<void>;
  refetch?: () => Promise<any>;
  setEditedValues: React.Dispatch<
    React.SetStateAction<Record<string, Record<string, any>>>
  >;
  setEditingCell: React.Dispatch<
    React.SetStateAction<null | {
      columnId: string;
      rowId: string;
      value: any;
    }>
  >;
}

export function useCellEditing<TData>({
  editedValues,
  editingCell,
  enableDirectCellEdit,
  enableInlineEdit,
  getRowModel,
  onSaveEdit,
  refetch,
  setEditedValues,
  setEditingCell,
}: UseCellEditingOptions<TData>) {
  const { announce } = useScreenReaderAnnouncement();

  const startEditing = useCallback(
    (rowId: string, columnId: string, value: any) => {
      if (!enableInlineEdit || !enableDirectCellEdit) return;
      setEditingCell({ columnId, rowId, value });
    },
    [enableInlineEdit, enableDirectCellEdit, setEditingCell],
  );

  const updateEditValue = useCallback(
    (value: any) => {
      if (!editingCell) return;
      // Now we can use the functional update pattern since we fixed the type
      setEditingCell((prev) => (prev ? { ...prev, value } : null));
    },
    [editingCell, setEditingCell],
  );

  const saveEdit = useCallback(async () => {
    if (!editingCell) return;

    const { columnId, rowId, value } = editingCell;

    // Update local state first - now with the correct typing
    setEditedValues((prev) => ({
      ...prev,
      [rowId]: {
        ...prev[rowId],
        [columnId]: value,
      },
    }));

    // Find the original row data
    const row = getRowModel().rows.find((r) => r.id === rowId);
    if (!row) return;

    // Create the updated data object
    const originalData = row.original;

    // Use the editedValues to create a complete updated data object
    const updatedData = {
      ...originalData,
      ...editedValues[rowId], // Include any previously edited values
      [columnId]: value, // Add the current edit
    };

    // Call the onSaveEdit callback if provided
    if (onSaveEdit) {
      try {
        // Show a loading state
        announce("Saving changes...", "polite");

        await onSaveEdit(rowId, updatedData, originalData);

        // Success message
        announce("Changes saved successfully", "polite");

        // Optionally trigger a data refetch
        if (refetch) {
          await refetch();
        }
      } catch (error) {
        announce("Error saving changes", "assertive");
        console.error("Error saving edit:", error);
      }
    }

    // Clear editing state
    setEditingCell(null);
  }, [
    editingCell,
    onSaveEdit,
    getRowModel,
    announce,
    refetch,
    setEditingCell,
    setEditedValues,
    editedValues,
  ]);

  const cancelEdit = useCallback(() => {
    setEditingCell(null);
    announce("Edit cancelled", "polite");
  }, [announce, setEditingCell]);

  return {
    cancelEdit,
    saveEdit,
    startEditing,
    updateEditValue,
  };
}
