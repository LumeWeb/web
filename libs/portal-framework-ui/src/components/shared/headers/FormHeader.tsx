import { cn } from "@lumeweb/portal-framework-ui-core";
import React from "react";

import { ActionListRenderer } from "../../actions";
import { BaseHeaderProps } from "../types/header";

export function FormHeader<T = any>({
  actionButtons,
  className,
  description,
  title,
}: BaseHeaderProps<T>) {
  // Return null if all content fields are not passed
  if (
    !title &&
    !description &&
    (!actionButtons || actionButtons.length === 0)
  ) {
    return null;
  }

  return (
    <div className={cn("space-y-4", className)}>
      {(title || description) && (
        <div className="space-y-2">
          {title && (
            <h2 className="text-xl font-semibold leading-none tracking-tight">
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
