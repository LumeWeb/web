import { cn } from "@lumeweb/portal-framework-ui-core";
import React from "react";

import { ActionListRenderer } from "../../actions";
import { BaseFooterProps } from "../types/footer";

export function DefaultFooter<T = any>({
  actionButtons,
  className,
  isSubmitting,
  onClose,
}: BaseFooterProps<T>) {
  return (
    <ActionListRenderer
      actions={actionButtons}
      className={cn("flex justify-end gap-2", className)}
      closeDialog={onClose}
      isSubmitting={isSubmitting}
      layout="horizontal"
    />
  );
}
