import type {
  WidgetAreaDefinition,
  WidgetRegistration,
} from "@lumeweb/portal-framework-core";

import { Identity } from "@lumeweb/portal-framework-core";
import { useGetIdentity } from "@refinedev/core";

export const widgetAreas: WidgetAreaDefinition[] = [
  {
    grid: {
      columns: 12,
      gap: 16,
      rowHeight: "auto",
    },
    id: "dashboard:header",
  },
  {
    grid: {
      columns: 12,
      gap: 16,
      rowHeight: "auto",
    },
    id: "dashboard:profile",
  },
  {
    grid: {
      columns: 12,
      gap: 16,
      rowHeight: "auto",
    },
    id: "dashboard:security",
  },
];

export const widgetRegistrations: WidgetRegistration[] = [
  {
    areaId: "dashboard:header",
    componentName: "widgets/account/emailVerificationBanner",
    id: "dashboard:email-verification",
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
    areaId: "dashboard:profile",
    componentName: "widgets/account/bio",
    id: "dashboard:bio",
    order: 0,
    position: {
      size: {
        height: 1,
        width: 4,
      },
    },
  },
  {
    areaId: "dashboard:profile",
    componentName: "widgets/account/profile",
    id: "dashboard:profile",
    order: 1,
    position: {
      size: {
        height: 1,
        width: 8,
      },
    },
  },
  {
    areaId: "dashboard:profile",
    componentName: "widgets/account/delete",
    id: "dashboard:delete",
    order: 2,
    position: {
      size: {
        height: 1,
        width: 4,
      },
    },
  },
  {
    areaId: "dashboard:security",
    componentName: "widgets/account/password",
    id: "dashboard:password",
    position: {
      size: {
        height: 2,
        width: 6,
      },
    },
  },
  {
    areaId: "dashboard:security",
    componentName: "widgets/account/2fa",
    id: "dashboard:2fa",
    position: {
      size: {
        height: 2,
        width: 6,
      },
    },
  },
  {
    areaId: "core:desktop-sidebar",
    componentName: "widgets/upload/button",
    id: "dashboard:upload-button",
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
