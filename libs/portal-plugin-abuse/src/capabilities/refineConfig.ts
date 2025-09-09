import type { RefineProps } from "@refinedev/core";

import {
  Framework,
  RefineConfigCapability,
} from "@lumeweb/portal-framework-core";
import { RefineResource } from "@/types/resources";

export class Capability implements RefineConfigCapability {
  dependencies = ["core:sdk"];
  readonly id: string = "abuse:refine-config";
  metadata: { description: string; name: string; provider: string };
  status: "active" | "error" | "inactive";
  readonly type = "core:refine-config";
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
            template: "/abuse/cases/:caseId/communications",
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
