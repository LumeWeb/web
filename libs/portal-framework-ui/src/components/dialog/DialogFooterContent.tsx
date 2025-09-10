import { DialogFooter } from "@lumeweb/portal-framework-ui-core";
import React from "react";

import { ActionListRenderer } from "../actions";
import { createDialogActions } from "../actions/actionHelpers";
import { renderFooter } from "../shared";
import { useDialog } from "./Dialog.context";
import { DialogConfig, DialogType } from "./Dialog.types";
import { useDialogType } from "./utils/dialogDetection";

interface DialogFooterContentProps<T = any> {
  currentDialog: DialogConfig<T>;
}

export function DialogFooterContent<T = any>({
  currentDialog,
}: DialogFooterContentProps<T>) {
  const { closeDialog } = useDialog();
  const dialogType = useDialogType();

  // If this is a form dialog, don't render actions here - let the form handle them
  if (currentDialog.formConfig) {
    return null;
  }

  // For non-form dialogs, generate and render actions
  const defaultActions = createDialogActions({
    cancelLabel: currentDialog.cancelText,
    confirmLabel: currentDialog.confirmText,
    onCancel: currentDialog.onCancel || (() => closeDialog("user")),
    onConfirm: currentDialog.onConfirm,
    type:
      dialogType === DialogType.ALERT
        ? DialogType.ALERT
        : dialogType === DialogType.CONFIRM
          ? DialogType.CONFIRM
          : undefined,
  });

  const finalActions = currentDialog.actions || defaultActions;

  return (
    <DialogFooter className={currentDialog.classNames?.footer}>
      {renderFooter(
        {
          actions: finalActions,
          className: currentDialog.classNames?.footer,
          description: currentDialog.description,
          footer: currentDialog.footer,
          title: currentDialog.title,
        },
        {
          closeDialog: () => closeDialog("user"),
          config: currentDialog,
        },
      )}
      {!currentDialog.footer && (
        <ActionListRenderer
          actions={finalActions}
          closeDialog={() => closeDialog("user")}
          layout={currentDialog.actionButtonsLayout || "horizontal"}
        />
      )}
    </DialogFooter>
  );
}
