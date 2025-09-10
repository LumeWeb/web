import { Button } from "@lumeweb/portal-framework-ui-core";
import React from "react";

import { registerActionItemComponent } from "../registry";
import {
  ActionItemProps,
  ActionItemType,
  ButtonActionItemConfig,
} from "../types";

export const ButtonActionItem: React.FC<
  ActionItemProps<ButtonActionItemConfig>
> = ({ config, isSubmitting }) => {
  return (
    <Button
      className={config.className}
      disabled={isSubmitting || config.disabled}
      onClick={config.onClick}
      type="button">
      {config.label ?? config.children ?? "Button"}
    </Button>
  );
};

export function registerButtonActionItem() {
  registerActionItemComponent(ActionItemType.BUTTON, ButtonActionItem);
}