import {
  createNamespacedId,
  type WidgetRegistration,
} from "@lumeweb/portal-framework-core";

export const widgetRegistrations: WidgetRegistration[] = [
  {
    areaId: createNamespacedId("dashboard", "header"),
    componentName: "widgets/quota",
    id: createNamespacedId("quota", "usage"),
    position: {
      size: {
        height: 1,
        width: 12,
      },
    },
  },
];

export default {
  areas: [],
  widgets: widgetRegistrations,
};
