import { Button } from "@lumeweb/portal-framework-ui-core";
import React from "react";

import { registerActionItemComponent } from "../registry";
import {
  ActionItemProps,
  ActionItemType,
  CustomActionItemConfig,
} from "../types";

export const CustomActionItem: React.FC<
  ActionItemProps<CustomActionItemConfig>
> = ({ config, isSubmitting }) => {
  if (!config.onClick) {
    console.error(
      "CustomActionItem requires an onClick handler in its config.",
      config,
    );
    return null;
  }
  return (
    <Button
      className={config.className}
      disabled={isSubmitting || config.disabled}
      onClick={config.onClick}
      type="button">
      {config.label ?? config.children}
    </Button>
  );
};

export function registerCustomActionItem() {
  registerActionItemComponent(ActionItemType.CUSTOM, CustomActionItem);
}
