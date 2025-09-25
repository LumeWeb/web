import React from "react";
import { cn } from "@lumeweb/portal-framework-ui-core";
import type { BaseRecord } from "@refinedev/core";
import type { FilterConfig } from "./types";

export interface BaseFilterProps<TData extends BaseRecord = any> {
  /** Label for the filter */
  label?: string;
  /** Children content */
  children: React.ReactNode;
  /** Additional class names */
  className?: string;
  /** Filter configuration */
  config?: FilterConfig<TData>;
}

/**
 * BaseFilter provides common layout and styling for all filter components
 */
function BaseFilter<TData extends BaseRecord = any>({
  label,
  children,
  className,
  config,
}: BaseFilterProps<TData>) {
  // Use label from config if available, otherwise use the label prop
  const filterLabel = config?.label || label;

  if (filterLabel) {
    return (
      <div className={cn("flex flex-col space-y-2", className)}>
        <label className="text-sm font-medium">{filterLabel}</label>
        <div className="flex items-center space-x-2">{children}</div>
      </div>
    );
  }

  return <div className={cn("flex items-center", className)}>{children}</div>;
}

export { BaseFilter };
