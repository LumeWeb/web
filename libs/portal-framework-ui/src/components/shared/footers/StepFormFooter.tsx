import { cn } from "@lumeweb/portal-framework-ui-core";
import React from "react";

import { ActionListRenderer } from "../../actions";
import { createFormActions } from "../../actions/actionHelpers";
import { BaseFooterProps } from "../types/footer";

export function StepFormFooter<T = any>({
  actionButtons,
  className,
  environment,
  isSubmitting,
  onClose,
  onConfirm,
  submitLabel = "Next",
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
      className={cn("flex justify-between gap-2", className)}
      closeDialog={onClose}
      isSubmitting={isSubmitting}
      layout="horizontal"
    />
  );
}
