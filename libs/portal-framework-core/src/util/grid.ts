import type { CSSProperties } from "react";

import { DEFAULT_WIDGET_AREA_DEFINITION } from "../types/widget";

export function getGridAutoRows(
  rowHeight:
    | "auto"
    | number
    | undefined = DEFAULT_WIDGET_AREA_DEFINITION.rowHeight,
): string {
  const resolved = rowHeight ?? DEFAULT_WIDGET_AREA_DEFINITION.rowHeight;
  return resolved === "auto" ? "auto" : `${resolved}px`;
}

export function getGridColumnSpan(column?: number, span?: number): string {
  return column !== undefined && span !== undefined
    ? `${column} / span ${span}`
    : `auto / span ${span || 1}`;
}

export function getGridGap(
  gap: number | undefined = DEFAULT_WIDGET_AREA_DEFINITION.gap,
): string {
  const resolved = gap ?? DEFAULT_WIDGET_AREA_DEFINITION.gap;
  return `${resolved}px`;
}

export function getGridStyles(area: {
  grid: {
    columns: number;
    gap?: number;
    rowHeight?: "auto" | number;
  };
}): CSSProperties {
  return {
    gap: getGridGap(area.grid.gap),
    gridAutoRows: getGridAutoRows(area.grid.rowHeight),
    gridTemplateColumns: getGridTemplateColumns(area.grid.columns),
  };
}

export function getGridTemplateColumns(columns: number): string {
  return `repeat(${columns}, minmax(0, 1fr))`;
}

export function getWidgetStyles(widget: {
  minHeight?: number | string;
  minWidth?: number | string;
  position: {
    location?: { column?: number };
    size: { height: number; width: number };
  };
}): CSSProperties {
  return {
    gridColumn: getGridColumnSpan(
      widget.position.location?.column,
      widget.position.size.width,
    ),
    gridRow: `span ${widget.position.size.height}`,
    minHeight: widget.minHeight,
    minWidth: widget.minWidth,
  };
}
