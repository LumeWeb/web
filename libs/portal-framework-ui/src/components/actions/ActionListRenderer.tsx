import { cn } from "@lumeweb/portal-framework-ui-core";
import React from "react";

import { getActionItemComponent } from "./registry";
import { ActionItemConfig, ActionItemType, ActionListLayout } from "./types";

interface ActionListRendererProps {
  actions: ActionItemConfig[];
  className?: string;
  closeDialog?: () => void;
  isSubmitting?: boolean;
  layout?: ActionListLayout;
}

export const ActionListRenderer: React.FC<ActionListRendererProps> = ({
  actions = [],
  className,
  closeDialog,
  isSubmitting,
  layout = "horizontal",
}) => {
  if (!actions || actions.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex w-full",
        layout === "vertical"
          ? "flex-col space-y-3"
          : "flex-row flex-wrap items-center justify-end gap-4",
        className,
      )}>
      {actions.map((action: ActionItemConfig, index) => {
        if (action.type === ActionItemType.CUSTOM_COMPONENT) {
          const CustomComponent = action.component;
          return (
            <CustomComponent
              key={action.key ?? index}
              {...action.props}
              closeDialog={closeDialog}
              isSubmitting={isSubmitting}
            />
          );
        }

        const ActionComponent = getActionItemComponent(action.type);
        if (!ActionComponent) {
          console.warn(
            `No component registered for action type: ${action.type}`,
          );
          return null;
        }

        const key = action.key ?? index;

        return (
          <ActionComponent
            closeDialog={closeDialog}
            config={action}
            isSubmitting={isSubmitting}
            key={key}
          />
        );
      })}
    </div>
  );
};
