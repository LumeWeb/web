import { cn } from "@lumeweb/portal-framework-ui-core";
import React from "react";

import { ActionListRenderer } from "../../actions";
import { ActionItemType } from "../../actions/types";
import { useFooterContext } from "../context/FooterContext";
import { BaseFooterProps } from "../types/footer";

export function WizardFooter<T = any>({
  actionButtons,
  className,
  isSubmitting,
  onClose,
}: Pick<BaseFooterProps<T>, "actionButtons" | "className" | "isSubmitting" | "onClose">) {
  const context = useFooterContext<T>();

  // Wizard footer requires step context
  if (!context.step) {
    console.warn("WizardFooter rendered without step context");
    return null;
  }

  const { current, total } = context.step;
  const progressPercentage = Math.round((current / total) * 100);

  // Apply specific styling to buttons
  const styledActions = actionButtons.map((action) => {
    if (action.type === ActionItemType.SUBMIT && action.label === "Back") {
      return {
        ...action,
        variant: "outline",
      };
    }
    if (action.type === ActionItemType.SUBMIT && action.label !== "Back") {
      return {
        ...action,
        variant: "default",
      };
    }
    return action;
  });

  return (
    <div className={cn("mt-4 border-t pt-4", className)}>
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-6">
            <div className="text-muted-foreground flex-shrink-0 text-sm">
              Step {current} of {total}
            </div>
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="bg-muted h-2 w-32 flex-1 overflow-hidden rounded-full">
                <div
                  className="bg-primary h-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <span className="text-muted-foreground whitespace-nowrap text-xs">
                {progressPercentage}% complete
              </span>
            </div>
          </div>

          <ActionListRenderer
            actions={styledActions}
            className="flex items-center gap-3"
            closeDialog={onClose}
            isSubmitting={isSubmitting}
            layout="horizontal"
          />
        </div>
      </div>
    </div>
  );
}
