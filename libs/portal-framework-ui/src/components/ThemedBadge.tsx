import { BadgeConfig } from "@/types";
import {
  Badge,
  type BadgeVariant,
  cn,
} from "@lumeweb/portal-framework-ui-core";
import React, { type ReactNode } from "react";

interface ThemedBadgeProps<T extends string> {
  children?: ReactNode;
  className?: string;
  config: BadgeConfig<T>;
  value: T;
  variant?: BadgeVariant;
}

export function ThemedBadge<T extends string>({
  children,
  className,
  config,
  value,
  variant,
  ...restCoreProps
}: ThemedBadgeProps<T>) {
  const { base = "", dark = "", hover = "", label } = config[value] || {};

  const wrapperClassName = cn(
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
    base,
    hover,
    dark,
    className,
  );

  return (
    <span className={wrapperClassName}>
      {children ? (
        children
      ) : (
        <Badge variant={variant} {...restCoreProps}>
          {label || value.replace(/_/g, " ")}
        </Badge>
      )}
    </span>
  );
}
