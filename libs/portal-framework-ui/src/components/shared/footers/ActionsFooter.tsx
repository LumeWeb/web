import { cn } from "@lumeweb/portal-framework-ui-core";
import React from "react";

import { ActionListRenderer } from "../../actions";
import { BaseFooterProps } from "../types/footer";

export function ActionsFooter<T = any>({
  actionButtons,
  className,
  environment,
}: BaseFooterProps<T>) {
  if (!actionButtons || actionButtons.length === 0) {
    return null;
  }

  return (
    <ActionListRenderer
      actions={actionButtons}
      className={cn("flex justify-end gap-2", className)}
      layout="horizontal"
    />
  );
}
