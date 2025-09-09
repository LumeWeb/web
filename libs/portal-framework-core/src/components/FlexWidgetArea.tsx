import { cn } from "@lumeweb/portal-framework-ui-core";
import React from "react";

import { useWidgetArea } from "../hooks/useWidgetArea";

export interface FlexWidgetAreaProps {
  className?: string;
  id: string;
  tag?: keyof React.IntrinsicElements;
}

export function FlexWidgetArea({
  className,
  id,
  tag = "div",
}: FlexWidgetAreaProps) {
  const { isVisible, widgets } = useWidgetArea(id);

  // If no widgets are visible, return null
  if (!isVisible) {
    return null;
  }

  const ContainerTag = tag;

  return (
    <ContainerTag className={cn("flex flex-col", className)}>
      {widgets.map((widget) => {
        const Widget = widget.component;
        return (
          <div key={widget.id}>
            <Widget />
          </div>
        );
      })}
    </ContainerTag>
  );
}
