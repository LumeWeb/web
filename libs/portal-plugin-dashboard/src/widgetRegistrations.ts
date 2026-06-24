import { Identity } from "@lumeweb/portal-framework-core";
import {
  CORE_NS,
  createNamespacedId,
  type WidgetAreaDefinition,
  type WidgetRegistration,
} from "@lumeweb/portal-framework-core";
import { useGetIdentity } from "@refinedev/core";

export const widgetAreas: WidgetAreaDefinition[] = [
  {
    grid: {
      columns: 12,
      gap: 16,
      rowHeight: "auto",
    },
    id: createNamespacedId("dashboard", "header"),
  },
  {
    grid: {
      columns: 12,
      gap: 16,
      rowHeight: "auto",
    },
    id: createNamespacedId("dashboard", "profile"),
  },
  {
    grid: {
      columns: 12,
      gap: 16,
      rowHeight: "auto",
    },
    id: createNamespacedId("dashboard", "security"),
  },
];

export const widgetRegistrations: WidgetRegistration[] = [
  {
    areaId: createNamespacedId("dashboard", "header"),
    componentName: "widgets/account/emailVerificationBanner",
    id: createNamespacedId("dashboard", "email-verification"),
    position: {
      size: {
        height: 1,
        width: 12,
      },
    },
    visibilityHook() {
      const { data: identity } = useGetIdentity<Identity>();
      if (!identity) {
        return false;
      }

      return !identity?.verified;
    },
  },
  {
    areaId: createNamespacedId("dashboard", "profile"),
    componentName: "widgets/account/bio",
    id: createNamespacedId("dashboard", "bio"),
    order: 0,
    position: {
      size: {
        height: 1,
        width: 4,
      },
    },
  },
  {
    areaId: createNamespacedId("dashboard", "profile"),
    componentName: "widgets/account/profile",
    id: createNamespacedId("dashboard", "profile"),
    order: 1,
    position: {
      size: {
        height: 1,
        width: 8,
      },
    },
  },
  {
    areaId: createNamespacedId("dashboard", "profile"),
    componentName: "widgets/account/delete",
    id: createNamespacedId("dashboard", "delete"),
    order: 2,
    position: {
      size: {
        height: 1,
        width: 4,
      },
    },
  },
  {
    areaId: createNamespacedId("dashboard", "security"),
    componentName: "widgets/account/password",
    id: createNamespacedId("dashboard", "password"),
    position: {
      size: {
        height: 2,
        width: 6,
      },
    },
  },
  {
    areaId: createNamespacedId("dashboard", "security"),
    componentName: "widgets/account/2fa",
    id: createNamespacedId("dashboard", "2fa"),
    position: {
      size: {
        height: 2,
        width: 6,
      },
    },
  },
  {
    areaId: createNamespacedId(CORE_NS, "desktop-sidebar"),
    componentName: "widgets/upload/button",
    id: createNamespacedId("dashboard", "upload-button"),
    position: {
      size: {
        height: 2,
        width: 6,
      },
    },
  },
];

export default {
  areas: widgetAreas,
  widgets: widgetRegistrations,
};
