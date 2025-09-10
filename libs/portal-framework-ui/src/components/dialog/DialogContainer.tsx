import { Dialog, DialogContent } from "@lumeweb/portal-framework-ui-core";
import { useNotification } from "@refinedev/core";
import React from "react";

import { useDialogActions } from "./Dialog.context";
import { DialogConfig } from "./Dialog.types";
import { getDialogContentClasses } from "./utils/dialogClasses";

interface DialogContainerProps<T = any> {
  children: React.ReactNode;
  currentDialog: DialogConfig<T>;
}

export function DialogContainer<T = any>({
  children,
  currentDialog,
}: DialogContainerProps<T>) {
  const { closeDialog } = useDialogActions();
  const { open: openNotification } = useNotification();

  return (
    <Dialog
      aria-describedby={
        currentDialog.description ? "dialog-description" : undefined
      }
      aria-labelledby="dialog-title"
      onOpenChange={(open) => !open && closeDialog("user")} // Close with 'user' source on outside/escape close
      open={!!currentDialog}>
      <DialogContent
        className={getDialogContentClasses(currentDialog)}
        onInteractOutside={(e) => {
          if (currentDialog.preventCloseOnOutsideClick === true) {
            e.preventDefault();
          } else if (currentDialog.preventCloseOnOutsideClick === "dirty") {
            e.preventDefault();
            openNotification?.({
              description:
                "You have unsaved changes. Are you sure you want to leave?",
              message: "Unsaved Changes",
              type: "error",
            });
          }
        }}>
        {children}
      </DialogContent>
    </Dialog>
  );
}
