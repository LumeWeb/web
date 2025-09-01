import type {
  WidgetAreaDefinition,
  WidgetRegistration,
} from "@lumeweb/portal-framework-core";

import { Identity, useFramework } from "@lumeweb/portal-framework-core";
import { useGetIdentity } from "@refinedev/core";

export const widgetAreas: WidgetAreaDefinition[] = [
  {
    grid: {
      columns: 12,
      gap: 16,
      rowHeight: "auto",
    },
    id: "core:dashboard:header",
  },
  {
    grid: {
      columns: 12,
      gap: 16,
      rowHeight: "auto",
    },
    id: "core:dashboard:profile",
  },
  {
    grid: {
      columns: 12,
      gap: 16,
      rowHeight: "auto",
    },
    id: "core:dashboard:security",
  },
];

export const widgetRegistrations: WidgetRegistration[] = [
  {
    areaId: "core:dashboard:header",
    componentName: "widgets/account/emailVerificationBanner",
    id: "core:dashboard:email-verification",
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
    areaId: "core:dashboard:profile",
    componentName: "widgets/account/bio",
    id: "core:dashboard:bio",
    order: 0,
    position: {
      size: {
        height: 1,
        width: 4,
      },
    },
  },
  {
    areaId: "core:dashboard:profile",
    componentName: "widgets/account/profile",
    id: "core:dashboard:profile",
    order: 1,
    position: {
      size: {
        height: 1,
        width: 8,
      },
    },
  },
  {
    areaId: "core:dashboard:profile",
    componentName: "widgets/account/delete",
    id: "core:dashboard:delete",
    order: 2,
    position: {
      size: {
        height: 1,
        width: 4,
      },
    },
  },
  {
    areaId: "core:dashboard:security",
    componentName: "widgets/account/password",
    id: "core:dashboard:password",
    position: {
      size: {
        height: 2,
        width: 6,
      },
    },
  },
  {
    areaId: "core:dashboard:security",
    componentName: "widgets/account/2fa",
    id: "core:dashboard:2fa",
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
