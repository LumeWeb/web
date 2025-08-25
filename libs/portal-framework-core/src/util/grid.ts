import type { CSSProperties } from "react";

import { DEFAULT_WIDGET_AREA_DEFINITION } from "../types/widget";

// Helper function to generate min/max width/height classes
function generateDimensionClasses(prefix: string): Record<number, string> {
  const classes: Record<number, string> = {};
  for (let i = 1; i <= 12; i++) {
    classes[i] = `${prefix}-${i}`;
  }
  return classes;
}

// Helper function to generate grid column classes
function generateGridColumnClasses(prefix: string): Record<number, string> {
  const classes: Record<number, string> = {};
  for (let i = 1; i <= 12; i++) {
    classes[i] = `${prefix}-${i}`;
  }
  return classes;
}

// Helper function to generate gap classes
function generateGridGapClasses(): Record<number, string> {


  return {
    0: "gap-0",
    1: "gap-px",
    2: "gap-0.5",
    4: "gap-1",
    6: "gap-1.5",
    8: "gap-2",
    10: "gap-2.5",
    12: "gap-3",
    14: "gap-3.5",
    16: "gap-4",
    20: "gap-5",
    24: "gap-6",
    28: "gap-7",
    32: "gap-8",
    36: "gap-9",
    40: "gap-10",
    44: "gap-11",
    48: "gap-12",
    56: "gap-14",
    64: "gap-16",
    80: "gap-20",
    96: "gap-24",
    112: "gap-28",
    128: "gap-32",
    144: "gap-36",
    160: "gap-40",
    176: "gap-44",
    192: "gap-48",
    208: "gap-52",
    224: "gap-56",
    240: "gap-60",
    256: "gap-64",
    288: "gap-72",
    320: "gap-80",
    384: "gap-96",
  };
}

// Helper function to generate grid span classes
function generateGridSpanClasses(type: "col" | "row"): Record<string, string> {
  const classes: Record<string, string> = {};

  // Simple spans
  for (let i = 1; i <= 12; i++) {
    classes[`span_${i}`] = `${type}-span-${i}`;
  }

  // Column start/end combinations (only for col type)
  if (type === "col") {
    // Auto start with span
    for (let span = 1; span <= 12; span++) {
      classes[`auto_span_${span}`] =
        `col-start-auto col-end-[span_${span}]`;
    }

    for (let start = 1; start <= 12; start++) {
      for (let end = start + 1; end <= 13; end++) {
        classes[`start_${start}_end_${end}`] =
          `col-start-${start} col-end-${end}`;
      }
    }

    // Column start/span combinations
    for (let start = 1; start <= 12; start++) {
      for (let span = 1; span <= 12; span++) {
        classes[`start_${start}_span_${span}`] =
          `col-start-${start} col-end-[span_${span}]`;
      }
    }
  }

  return classes;
}

// Helper functions for composing grid classes
function getColumnStartClass(start: number | "auto"): string {
  return `col-start-${start}`;
}

function getColumnEndClass(end: number): string {
  return `col-end-${end}`;
}

function getColumnSpanClass(span: number): string {
  return `col-span-${span}`;
}

function getColumnEndSpanClass(span: number): string {
  return `col-end-[span_${span}]`;
}

function getMobileSpanClass(): string {
  return "col-span-1";
}

function getResponsiveClass(baseClass: string, breakpoint: string = "sm"): string {
  return `${breakpoint}:${baseClass}`;
}

// Higher-order functions for composing responsive grid classes
function getResponsiveColumnStartClass(start: number | "auto"): string {
  return getResponsiveClass(getColumnStartClass(start));
}

function getResponsiveColumnEndClass(end: number): string {
  return getResponsiveClass(getColumnEndClass(end));
}

function getResponsiveColumnSpanClass(span: number): string {
  return getResponsiveClass(getColumnSpanClass(span));
}

function getResponsiveColumnEndSpanClass(span: number): string {
  return getResponsiveClass(getColumnEndSpanClass(span));
}

// Helper function to generate responsive grid span classes
function generateResponsiveGridSpanClasses(): Record<string, string> {
  const classes: Record<string, string> = {};

  // Auto start with span (responsive version)
  for (let span = 1; span <= 12; span++) {
    classes[`auto_span_${span}`] = 
      `${getMobileSpanClass()} ${getColumnStartClass("auto")} ${getResponsiveColumnEndSpanClass(span)}`;
  }

  // Column start/end combinations (responsive version)
  for (let start = 1; start <= 12; start++) {
    for (let end = start + 1; end <= 13; end++) {
      classes[`start_${start}_end_${end}`] = 
        `${getMobileSpanClass()} ${getResponsiveColumnStartClass(start)} ${getResponsiveColumnEndClass(end)}`;
    }
  }

  // Column start/span combinations (responsive version)
  for (let start = 1; start <= 12; start++) {
    for (let span = 1; span <= 12; span++) {
      classes[`start_${start}_span_${span}`] = 
        `${getMobileSpanClass()} ${getResponsiveColumnStartClass(start)} ${getResponsiveColumnEndSpanClass(span)}`;
    }
  }

  return classes;
}

// Helper function to generate responsive grid column classes
function generateResponsiveGridColumnClasses(): Record<number, string> {
  const classes: Record<number, string> = {};
  for (let i = 1; i <= 12; i++) {
    classes[i] = `grid-cols-1 tablet:grid-cols-${i}`;
  }
  return classes;
}

// Dynamically generated class mappings
const GRID_COLUMN_CLASSES = generateGridColumnClasses("grid-cols");
const RESPONSIVE_GRID_COLUMN_CLASSES = generateResponsiveGridColumnClasses();
const GRID_ROW_SPAN_CLASSES = generateGridSpanClasses("row");
const RESPONSIVE_GRID_COLUMN_SPAN_CLASSES = generateResponsiveGridSpanClasses();
const GRID_GAP_CLASSES = generateGridGapClasses();
const MIN_WIDTH_CLASSES = generateDimensionClasses("min-w");
const MIN_HEIGHT_CLASSES = generateDimensionClasses("min-h");
const MAX_WIDTH_CLASSES = generateDimensionClasses("max-w");
const MAX_HEIGHT_CLASSES = generateDimensionClasses("max-h");

export function getGridAutoRows(
  rowHeight:
    | "auto"
    | number
    | undefined = DEFAULT_WIDGET_AREA_DEFINITION.rowHeight,
): string {
  const resolved = rowHeight ?? DEFAULT_WIDGET_AREA_DEFINITION.rowHeight;
  if (resolved === "auto") {
    return "auto-rows-auto";
  }
  // For numeric values, we'll need to use inline styles since Tailwind doesn't have classes for specific px values
  return "";
}


export function getGridGap(
  gap: number | undefined = DEFAULT_WIDGET_AREA_DEFINITION.gap,
): string {
  const resolved = gap ?? DEFAULT_WIDGET_AREA_DEFINITION.gap;
  return GRID_GAP_CLASSES[resolved] || "";
}

export function getGridRowSpanClass(height: number): string {
  const key = `span_${height}`;
  return GRID_ROW_SPAN_CLASSES[key] || "";
}

export function getGridStyles(area: {
  grid: {
    columns: number;
    gap?: number;
    rowHeight?: "auto" | number;
  };
}): CSSProperties {
  const gapClass = getGridGap(area.grid.gap);
  // Only add gap to style if no matching Tailwind class exists
  const gapStyle = gapClass
    ? undefined
    : area.grid.gap
      ? `${area.grid.gap}px`
      : undefined;

  const autoRowsClass = getGridAutoRows(area.grid.rowHeight);
  let autoRowsStyle: string | undefined;

  if (
    !autoRowsClass &&
    area.grid.rowHeight &&
    typeof area.grid.rowHeight === "number"
  ) {
    autoRowsStyle = `${area.grid.rowHeight}px`;
  } else {
    autoRowsStyle = undefined;
  }

  const styles: CSSProperties = {};

  if (gapStyle) {
    styles.gap = gapStyle;
  }

  if (autoRowsStyle) {
    styles.gridAutoRows = autoRowsStyle;
  }

  return styles;
}

export function getGridTemplateColumnsClass(columns: number): string {
  // Return the Tailwind class if it exists in our mapping, otherwise fall back to inline style
  return GRID_COLUMN_CLASSES[columns] || "";
}

export function getMaxHeightClass(height: number): string {
  return MAX_HEIGHT_CLASSES[height] || "";
}

export function getMaxWidthClass(width: number): string {
  return MAX_WIDTH_CLASSES[width] || "";
}

export function getMinHeightClass(height: number): string {
  return MIN_HEIGHT_CLASSES[height] || "";
}

export function getMinWidthClass(width: number): string {
  return MIN_WIDTH_CLASSES[width] || "";
}

export function getResponsiveGridColumnSpanClass(
  column?: number,
  span?: number,
): string {
  const spanValue = span || 1;
  if (column !== undefined && span !== undefined) {
    const key = `start_${column}_span_${span}`;
    return RESPONSIVE_GRID_COLUMN_SPAN_CLASSES[key] || "";
  } else if (column !== undefined) {
    const key = `start_${column}_span_1`;
    return RESPONSIVE_GRID_COLUMN_SPAN_CLASSES[key] || "";
  } else {
    const key = `auto_span_${spanValue}`;
    if (RESPONSIVE_GRID_COLUMN_SPAN_CLASSES[key]) {
      return RESPONSIVE_GRID_COLUMN_SPAN_CLASSES[key];
    }
    
    // Fallback to mobile span class with responsive column span
    return `${getMobileSpanClass()} ${getResponsiveColumnSpanClass(spanValue)}`;
  }
}

export function getResponsiveGridTemplateColumnsClass(columns: number): string {
  // Always default to 1 column on mobile, expand on sm and up
  return (
    RESPONSIVE_GRID_COLUMN_CLASSES[columns] || "grid-cols-1 sm:grid-cols-1"
  );
}
