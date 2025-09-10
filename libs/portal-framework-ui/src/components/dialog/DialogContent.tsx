import React from "react";

import { useDialogActions } from "./Dialog.context";
import { getDialogComponent, isRegisteredDialogType } from "./Dialog.registry";
import { DialogConfig } from "./Dialog.types";

interface DialogContentProps<T = any> {
  currentDialog: DialogConfig<T>;
  dialogWithFormType: DialogConfig<T>;
}

export function DialogContent<T = any>({
  currentDialog,
  dialogWithFormType,
}: DialogContentProps<T>) {
  const { closeDialog } = useDialogActions();
  const DialogComponent = currentDialog
    ? getDialogComponent(currentDialog.type)
    : null;

  return (
    <>
      {isRegisteredDialogType(dialogWithFormType) ? (
        <DialogComponent
          {...dialogWithFormType}
          onClose={() => closeDialog("user")}
        />
      ) : (
        console.warn(
          `No component registered for dialog type: ${currentDialog.type}`,
        )
      )}
    </>
  );
}
