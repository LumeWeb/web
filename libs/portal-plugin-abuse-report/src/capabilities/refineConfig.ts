import type { RefineProps } from "@refinedev/core";

import { RefineResource } from "@/types";
import dataProvider from "@lumeweb/advanced-rest-provider";
import {
  createNamespacedId,
  FRAMEWORK_NS,
  type NamespacedId,
  RefineConfigCapability,
} from "@lumeweb/portal-framework-core";

import { authProvider } from "../providers/auth-provider";

export class Capability implements RefineConfigCapability {
  dependencies?: NamespacedId[];
  readonly id: NamespacedId = createNamespacedId(
    "abuse-report",
    "refine-config",
  );
  status: "active" | "error" | "inactive" = "inactive";
  readonly type: NamespacedId = createNamespacedId(
    FRAMEWORK_NS,
    "refine-config",
  );

  async destroy() {
    // No cleanup needed
  }

  getConfig(existing?: Partial<RefineProps>) {
    return {
      authProvider: authProvider,
      dataProvider: {
        default: dataProvider("/api", false),
      },
      options: {
        disableTelemetry: true,
        syncWithLocation: true,
        warnWhenUnsavedChanges: true,
        ...existing?.options,
      },
      resources: [
        ...(existing?.resources ?? []),
        {
          create: "/report",
          meta: {
            canDelete: false,
          },
          name: RefineResource.AbuseReport,
        },
        {
          meta: {
            canDelete: false,
            template: `${RefineResource.Case}/{case}/communications`,
          },
          name: `${RefineResource.Case}.communications`,
        },
        {
          meta: {
            canDelete: false,
          },
          name: RefineResource.Case,
          show: "/case/:id",
        },
      ],
    } satisfies Partial<RefineProps>;
  }

  async initialize() {
    // No SDK initialization needed
  }
}
