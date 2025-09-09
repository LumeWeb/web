import { cn } from "@lumeweb/portal-framework-ui-core";
import React from "react";

import { useWidgetArea } from "../hooks/useWidgetArea";
import {
  getGridAutoRows,
  getGridGap,
  getGridRowSpanClass,
  getGridStyles,
  getMaxHeightClass,
  getMaxWidthClass,
  getMinHeightClass,
  getMinWidthClass,
  getResponsiveGridColumnSpanClass,
  getResponsiveGridTemplateColumnsClass,
} from "../util/grid";

export interface GridWidgetAreaProps {
  id: string;
}

export function GridWidgetArea({ id }: GridWidgetAreaProps) {
  const { area, isVisible, widgets } = useWidgetArea(id);

  // If no widgets are visible, return null
  if (!isVisible) {
    return null;
  }

  const gridAutoRowsClass = getGridAutoRows(area.grid.rowHeight);
  const gridGapClass = getGridGap(area.grid.gap);

  return (
    <div
      className={cn(
        "grid",
        gridGapClass || "gap-5",
        getResponsiveGridTemplateColumnsClass(area.grid.columns),
        gridAutoRowsClass,
      )}
      style={getGridStyles(area)}>
      {widgets.map((widget) => {
        // Since we're filtering in the hook, we can assume visibility here
        const Widget = widget.component;
        const columnSpanClass = getResponsiveGridColumnSpanClass(
          widget.position.location?.column,
          widget.position.size.width,
        );
        const rowSpanClass = getGridRowSpanClass(
          widget.position.size.height,
        );

        // Get min/max width/height classes and fallback to inline styles
        const minWidthClass = widget.minWidth
          ? getMinWidthClass(widget.minWidth as number)
          : "";
        const minHeightClass = widget.minHeight
          ? getMinHeightClass(widget.minHeight as number)
          : "";
        const maxWidthClass = widget.maxWidth
          ? getMaxWidthClass(widget.maxWidth as number)
          : "";
        const maxHeightClass = widget.maxHeight
          ? getMaxHeightClass(widget.maxHeight as number)
          : "";

        // Build inline styles for fallback when classes don't exist
        const widgetStyles: React.CSSProperties = {};
        if (widget.minWidth && !minWidthClass) {
          widgetStyles.minWidth = `${widget.minWidth}px`;
        }
        if (widget.minHeight && !minHeightClass) {
          widgetStyles.minHeight = `${widget.minHeight}px`;
        }
        if (widget.maxWidth && !maxWidthClass) {
          widgetStyles.maxWidth = `${widget.maxWidth}px`;
        }
        if (widget.maxHeight && !maxHeightClass) {
          widgetStyles.maxHeight = `${widget.maxHeight}px`;
        }

        return (
          <div
            className={cn(
              "bg-background rounded-md border p-4",
              columnSpanClass,
              rowSpanClass,
              minWidthClass,
              minHeightClass,
              maxWidthClass,
              maxHeightClass,
            )}
            key={widget.id}
            style={widgetStyles}>
            <Widget />
          </div>
        );
      })}
    </div>
  );
}
