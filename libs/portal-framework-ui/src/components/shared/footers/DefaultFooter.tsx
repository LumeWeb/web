import { cn } from "@lumeweb/portal-framework-ui-core";
import React from "react";

import { ActionListRenderer } from "../../actions";
import type { BaseFooterProps, FooterEnvironment } from "../types/footer";

export function DefaultFooter<T = any>({
  actionButtons,
  className,
  environment,
  isSubmitting,
  onClose,
}: Pick<BaseFooterProps<T>, "actionButtons" | "className" | "environment" | "isSubmitting" | "onClose">) {
  return (
    <ActionListRenderer
      actions={actionButtons || []}
      className={cn("flex justify-end gap-2", className)}
      closeDialog={onClose}
      isSubmitting={isSubmitting}
      layout="horizontal"
    />
  );
}
