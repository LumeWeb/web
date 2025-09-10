import { cn } from "@lumeweb/portal-framework-ui-core";
import React from "react";

export function TableContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}): React.JSX.Element {
  return (
    <div className={cn("rounded-lg border p-6 shadow-sm", className)}>
      {children}
    </div>
  );
}
