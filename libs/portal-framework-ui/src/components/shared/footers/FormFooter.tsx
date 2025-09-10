import { cn } from "@lumeweb/portal-framework-ui-core";
import React from "react";

import { ActionListRenderer } from "../../actions";
import { createFormActions } from "../../actions/actionHelpers";
import { BaseFooterProps } from "../types/footer";

export function FormFooter<T = any>({
  actionButtons,
  className,
  environment,
  isSubmitting,
  onClose,
  onConfirm,
  submitLabel = "Submit",
}: BaseFooterProps<T>) {
  const formActions = createFormActions({
    isSubmitting,
    onCancel: onClose,
    onSubmit: onConfirm,
    showCancel: !!onClose,
    submitLabel,
  });

  const finalActions = actionButtons || formActions;

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
