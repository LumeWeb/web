import * as React from "react";

import { NamespacedId } from "./namespace";

export interface WidgetAreaDefinition {
  grid?: {
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
  id: NamespacedId;
}

export const DEFAULT_WIDGET_AREA_DEFINITION: Required<
  Pick<NonNullable<WidgetAreaDefinition["grid"]>, "gap" | "rowHeight">
> = {
  gap: 16,
  rowHeight: 50,
};

export interface PluginWidgets {
  areas?: WidgetAreaDefinition[];
  widgets?: WidgetRegistration[];
}

export interface WidgetDefinition
  extends Omit<WidgetRegistration, "componentName"> {
  component: React.ComponentType;
}

export interface WidgetRegistration {
  areaId: NamespacedId;
  componentName: string;
  id: NamespacedId;
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
  /**
   * Optional visibility hook that returns a boolean indicating whether the widget should be visible
   */
  visibilityHook?: () => boolean;
}

export interface WidgetRegistrationWithComponent extends WidgetRegistration {
  pluginId: NamespacedId;
}
