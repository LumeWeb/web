import { Button } from "@lumeweb/portal-framework-ui-core";
import React from "react";

import { registerActionItemComponent } from "../registry";
import {
  ActionItemProps,
  ActionItemType,
  CancelActionItemConfig,
} from "../types";

export const CancelActionItem: React.FC<
  ActionItemProps<CancelActionItemConfig>
> = ({ closeDialog, config, isSubmitting }) => {
  const handleClick = () => {
    if (closeDialog) {
      closeDialog();
    }
    if (config.onClick) {
      config.onClick?.();
    }
  };

  return (
    <Button
      className={config.className}
      disabled={isSubmitting ?? config.disabled}
      onClick={handleClick}
      type="button"
      variant="outline">
      {config.label ?? config.children ?? "Cancel"}
    </Button>
  );
};

export function registerCancelActionItem() {
  registerActionItemComponent(ActionItemType.CANCEL, CancelActionItem);
}
