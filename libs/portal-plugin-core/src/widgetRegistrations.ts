import {
  CORE_NS,
  createNamespacedId,
  type WidgetAreaDefinition,
} from "@lumeweb/portal-framework-core";

export const widgetAreas: WidgetAreaDefinition[] = [
  {
    id: createNamespacedId(CORE_NS, "desktop-sidebar"),
  },
];
export default {
  areas: widgetAreas,
};
