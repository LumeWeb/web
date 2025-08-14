import { BaseRecord } from "@refinedev/core";
import React from "react";
import { FieldValues, UseFormReturn } from "react-hook-form";

import { ActionListRenderer } from "../../actions";
import { ActionItemType } from "../../actions/types";
import { DialogBaseConfig } from "../Dialog.types";
import { getDefaultDialogActions } from "../utils/dialogActions";

export type DialogCloseSource = "programmatic" | "user";

export interface DialogFooterProps<T extends BaseRecord = any> {
  /** Function to close the dialog */
  closeDialog: (source?: DialogCloseSource) => void;
  /** Current dialog configuration */
  currentDialog: DialogBaseConfig<T>;
  /** Form methods from react-hook-form */
  formMethods?: UseFormReturn<FieldValues>;
  /** Confirm button click handler */
  onConfirm?: () => void;
}

export function DefaultDialogFooter<T extends BaseRecord = any>({
  closeDialog,
  currentDialog,
  onConfirm,
}: DialogFooterProps<T>) {
  const actions = getDefaultDialogActions(currentDialog);

  // Map the actions to include onConfirm for submit/button actions
  const mappedActions = actions.map((action) => {
    if (
      action.type === ActionItemType.SUBMIT ||
      action.type === ActionItemType.BUTTON
    ) {
      return {
        ...action,
        onClick: onConfirm,
      };
    }
    return action;
  });

  return (
    <ActionListRenderer
      actions={mappedActions}
      closeDialog={closeDialog}
      isSubmitting={currentDialog.showSpinner}
      layout={currentDialog.actionButtonsLayout}
    />
  );
}
