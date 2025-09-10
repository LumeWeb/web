import { cn } from "@lumeweb/portal-framework-ui-core";
import React from "react";

import { ActionListRenderer } from "../../actions";
import { createDialogActions } from "../../actions/actionHelpers";
import { BaseFooterProps } from "../types/footer";

export function DefaultFooter<T = any>({
  actionButtons,
  className,
  isSubmitting,
  onClose,
  onConfirm,
  submitLabel = "Submit",
}: BaseFooterProps<T>) {
  const defaultActions = createDialogActions({
    cancelLabel: "Cancel",
    confirmLabel: submitLabel,
    isSubmitting,
    onCancel: onClose,
    onConfirm,
    type: "confirm",
  });

  const finalActions = actionButtons || defaultActions;

  return (
    <ActionListRenderer
      actions={finalActions}
      className={cn("flex justify-end gap-2", className)}
      closeDialog={onClose}
      isSubmitting={isSubmitting}
      layout="horizontal"
    />
  );
}
