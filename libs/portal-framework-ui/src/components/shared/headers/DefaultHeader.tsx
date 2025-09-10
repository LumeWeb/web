import { cn } from "@lumeweb/portal-framework-ui-core";
import React from "react";

import { ActionListRenderer } from "../../actions";
import { BaseHeaderProps } from "../types/header";

export function DefaultHeader<T = any>({
  actionButtons,
  className,
  description,
  environment,
  title,
}: BaseHeaderProps<T>) {
  return (
    <div className={cn("space-y-2", className)}>
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h2 className="text-lg font-semibold leading-none tracking-tight">
              {title}
            </h2>
          )}
          {description && (
            <p className="text-muted-foreground text-sm">{description}</p>
          )}
        </div>
      )}
      {actionButtons && actionButtons.length > 0 && (
        <ActionListRenderer
          actions={actionButtons}
          className="flex justify-end gap-2"
          layout="horizontal"
        />
      )}
    </div>
  );
}
