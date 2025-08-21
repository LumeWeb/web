import * as React from "react";

import { NamespacedId } from "./plugin";

export interface WidgetAreaDefinition {
  grid: {
    columns: number; // Fixed column count
    /**
     * Gap between widgets in pixels
     * @default 16
     */
    gap?: number;
    /**
     * Row height in pixels or 'auto' for content-based sizing
     * @default 50
     */
    rowHeight?: "auto" | number;
  };
  id: string;
}

export const DEFAULT_WIDGET_AREA_DEFINITION: Pick<
  WidgetAreaDefinition["grid"],
  "gap" | "rowHeight"
> = {
  gap: 16,
  rowHeight: 50,
};

export interface PluginWidgets {
  areas?: WidgetAreaDefinition[];
  widgets?: WidgetRegistration[];
}

export interface WidgetDefinition {
  areaId: string;
  component: React.ComponentType;
  id: string;
  minHeight?: number; // Minimum height in pixels
  minWidth?: number; // Minimum width in pixels
  order?: number; // Optional order for sorting widgets (lower numbers first)
  position: {
    location?: {
      column?: number; // Optional grid column start (1-based)
    };
    size: {
      height: number; // Rows to span (1-12)
      width: number; // Columns to span (1-12)
    };
  };
}

export interface WidgetRegistration {
  areaId: string;
  componentName: string;
  id: string;
  minHeight?: number;
  minWidth?: number;
  order?: number;
  position: {
    location?: {
      column?: number;
    };
    size: {
      height: number;
      width: number;
    };
  };
}

export interface WidgetRegistrationWithComponent extends WidgetRegistration {
  pluginId: NamespacedId;
}
