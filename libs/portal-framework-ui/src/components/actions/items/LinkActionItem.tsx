import { cn } from "@lumeweb/portal-framework-ui-core";
import React from "react";
import { Link as RouterLink } from "react-router";

import { registerActionItemComponent } from "../registry";
import {
  ActionItemProps,
  ActionItemType,
  LinkActionItemConfig,
} from "../types";

export const LinkActionItem: React.FC<
  ActionItemProps<LinkActionItemConfig>
> = ({ config }) => {
  const commonProps = {
    children: config.label || config.children,
    className: cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      "text-primary underline-offset-4 hover:underline",
      config.className,
    ),
    target: config.target,
  };

  if (
    config.target === "_blank" ||
    config.reloadDocument ||
    config.to.startsWith("http")
  ) {
    return (
      <a
        href={config.to}
        {...commonProps}
        rel={config.target === "_blank" ? "noopener noreferrer" : undefined}>
        {commonProps.children}
      </a>
    );
  }

  return (
    <RouterLink to={config.to} {...commonProps}>
      {commonProps.children}
    </RouterLink>
  );
};

export function registerLinkActionItem() {
  registerActionItemComponent(ActionItemType.LINK, LinkActionItem);
}
