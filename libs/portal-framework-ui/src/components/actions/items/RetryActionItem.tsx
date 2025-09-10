import { Button } from "@lumeweb/portal-framework-ui-core";
import React from "react";

import { registerActionItemComponent } from "../registry";
import {
  ActionItemProps,
  ActionItemType,
  RetryActionItemConfig,
} from "../types";

export const RetryActionItem: React.FC<
  ActionItemProps<RetryActionItemConfig>
> = ({ config }) => {
  return (
    <Button
      className={config.className}
      disabled={config.disabled}
      onClick={config.onClick}
      type="button">
      {config.label ?? config.children ?? "Retry"}
    </Button>
  );
};

export function registerRetryActionItem() {
  registerActionItemComponent(ActionItemType.RETRY, RetryActionItem);
}
