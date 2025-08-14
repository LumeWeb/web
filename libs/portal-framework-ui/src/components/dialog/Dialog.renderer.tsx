import {
  Dialog,
  DialogContent,
  DialogFooter,
} from "@lumeweb/portal-framework-ui-core";
import { BaseRecord, useNotification } from "@refinedev/core";
import React from "react";

import type { DialogConfig } from "./Dialog.types";

import { useDialogActions, useDialogState } from "./Dialog.context";
import { getDialogComponent, isRegisteredDialogType } from "./Dialog.registry";
import {
  getFooterComponent,
  getFooterTypeForDialog,
} from "./footer/DialogFooter.registry";
import { getDialogContentClasses } from "./utils/dialogClasses";
import { handleConfirm as handleConfirmUtil } from "./utils/handleConfirm";

interface DialogFooterContentProps<T extends BaseRecord = any> {
  closeDialog: (source?: "programmatic" | "user") => void; // Allow source parameter
  currentDialog: DialogConfig<T>;
  formMethods?: any;
  onConfirm: () => void;
}

const DialogFooterContent = <T extends BaseRecord>({
  closeDialog,
  currentDialog,
  formMethods,
  onConfirm,
}: DialogFooterContentProps<T>) => {
  if (currentDialog.footer) {
    return (
      <DialogFooter className={currentDialog.classNames?.footer}>
        {currentDialog.footer}
      </DialogFooter>
    );
  }

  if (currentDialog.type === "form") {
    return null; // Form footer handled within form component
  }

  const footerType = getFooterTypeForDialog(currentDialog);
  const FooterComponent = getFooterComponent<T>(footerType);

  return (
    <DialogFooter className={currentDialog.classNames?.footer}>
      <FooterComponent
        closeDialog={closeDialog}
        currentDialog={currentDialog}
        formMethods={formMethods}
        onConfirm={onConfirm}
      />
    </DialogFooter>
  );
};

export function DialogRenderer() {
  const { currentDialog, formMethods } = useDialogState();
  const DialogComponent = currentDialog 
    ? getDialogComponent(currentDialog.type)
    : null;
  const { closeDialog } = useDialogActions();
  const { open: openNotification } = useNotification();

  if (!currentDialog) return null;

  const handleConfirm = async () => {
    await handleConfirmUtil(currentDialog, closeDialog);
  };

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
        data-has-title={!!currentDialog.title} // Add data attribute for testing
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
          // Note: The actual Dialog component triggers onOpenChange(false)
          // when onInteractOutside is not prevented. This is handled by the mock Dialog.
        }}>
        {isRegisteredDialogType(currentDialog) ? (
          <DialogComponent
            {...currentDialog}
            onClose={() => closeDialog("user")}
          />
        ) : (
          console.warn(`No component registered for dialog type: ${currentDialog.type}`)
        )}

        <DialogFooterContent
          closeDialog={closeDialog}
          currentDialog={currentDialog}
          formMethods={formMethods}
          onConfirm={handleConfirm}
        />
      </DialogContent>
    </Dialog>
  );
}
