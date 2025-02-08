import type {
  BaseRecord,
  CreateParams,
  CustomParams,
  DataProvider,
  DeleteOneParams,
  GetListParams,
  GetListResponse,
  GetOneParams,
  MetaQuery,
  RefineProps,
  UpdateParams,
} from "@refinedev/core";

const caseJwtKey = "caseJwtKey";

import { RefineResource } from "@/types";
import dataProvider from "@lumeweb/advanced-rest-provider";
import { RefineConfigCapability } from "@lumeweb/portal-framework-core";

import { authProvider } from "../providers/auth-provider";

export class Capability implements RefineConfigCapability {
  dependencies?: string[];
  readonly id: string = "core:abuse-report:refine-config";
  status: "active" | "error" | "inactive";
  readonly type: "core:refine-config" = "core:refine-config";

  async destroy() {
    // No cleanup needed
  }

  getConfig(existing?: Partial<RefineProps>) {
    return {
      authProvider: authProvider,
      dataProvider: {
        default: dataProvider("/api"),
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
