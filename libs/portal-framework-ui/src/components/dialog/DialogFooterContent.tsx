import React from "react";
import { renderFooter } from "@/components";
import { DialogConfig } from "./Dialog.types";

interface DialogFooterContentProps<T = any> {
  currentDialog: DialogConfig<T>;
  onCancel?: () => void;
}

export function DialogFooterContent<T = any>({
  currentDialog,
  onCancel,
}: DialogFooterContentProps<T>) {
  // If this is a form dialog, don't render actions here - let the form handle them
  if (currentDialog.formConfig) {
    return null;
  }

  return (
    <>
      {renderFooter({
        className: currentDialog.classNames?.footer,
        dialogConfig: currentDialog,
        footer: currentDialog.footer,
        isDialog: true,
        onCancel,
      })}
    </>
  );
}
