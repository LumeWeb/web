import type {
  WidgetRegistration,
} from "@lumeweb/portal-framework-core";

export const widgetRegistrations: WidgetRegistration[] = [
  {
    areaId: "dashboard:header",
    componentName: "widgets/quota",
    id: "quota:usage",
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
