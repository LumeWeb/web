import { Button, Spinner } from "@lumeweb/portal-framework-ui-core";
import React from "react";

import { registerActionItemComponent } from "../registry";
import {
  ActionItemProps,
  ActionItemType,
  SubmitActionItemConfig,
} from "../types";

export const SubmitActionItem: React.FC<
  ActionItemProps<SubmitActionItemConfig>
> = ({ config, isSubmitting }) => {
  return (
    <Button
      className={config.className}
      disabled={isSubmitting || config.disabled}
      type="submit">
      {isSubmitting && <Spinner className="mr-2" size="small" />}
      {config.label ?? config.children ?? "Submit"}
    </Button>
  );
};

export function registerSubmitActionItem() {
  registerActionItemComponent(ActionItemType.SUBMIT, SubmitActionItem);
}
