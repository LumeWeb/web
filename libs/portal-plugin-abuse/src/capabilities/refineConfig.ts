import type { RefineProps } from "@refinedev/core";

import {
  createNamespacedId,
  type NamespacedId,
  Framework,
  FRAMEWORK_NS,
  RefineConfigCapability,
} from "@lumeweb/portal-framework-core";
import { RefineResource } from "@/types/resources";

export class Capability implements RefineConfigCapability {
  dependencies: NamespacedId[] = [createNamespacedId(FRAMEWORK_NS, "sdk")];
  readonly id = createNamespacedId("abuse", "refine-config");
  metadata: { description: string; name: string; provider: string } = { description: "", name: "", provider: "" };
  status: "active" | "error" | "inactive" = "inactive";
  readonly type = "framework:refine-config";
  version: string;

  async destroy() {}

  getConfig(existing?: Partial<RefineProps>) {
    existing = {
      options: {},
      resources: [
        {
          name: RefineResource.Case,
          meta: {
            template: "/abuse/cases",
          },
          list: "/abuse/cases",
          show: "/abuse/cases/:id",
        },
        {
          name: RefineResource.Blocklist,
          meta: {
            template: "/abuse/blocklist",
          },
          list: "/abuse/blocklist",
          show: "/abuse/blocklist/:id",
        },
        {
          name: RefineResource.Reporter,
          meta: {
            template: "/abuse/reporters",
          },
          list: "/abuse/reporters",
          show: "/abuse/reporters/:id",
        },
        {
          name: RefineResource.Subject,
          meta: {
            template: "/abuse/subjects",
          },
          list: "/abuse/subjects",
          show: "/abuse/subjects/:id",
        },
        {
          name: RefineResource.CaseCommunication,
          meta: {
            template: "/abuse/cases/:caseId/communications",
          },
        },
        {
          name: RefineResource.CaseEvidence,
          meta: {
            template: "/abuse/cases/:caseId/evidence",
          },
        },
      ],
      ...existing,
    };
    return {
      options: {
        ...existing.options,
        syncWithLocation: true,
        warnWhenUnsavedChanges: true,
      },
      resources: [...existing.resources],
    } satisfies Partial<RefineProps>;
  }

  async initialize(_: Framework) {}
}
