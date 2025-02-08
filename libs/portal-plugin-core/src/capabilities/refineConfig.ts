import { notificationProvider } from "@/dataProviders/notificationProvider";
import dataProvider from "@lumeweb/advanced-rest-provider";
import {
  CapabilityStatus,
  RefineConfigCapability,
} from "@lumeweb/portal-framework-core";
import { RefineProps } from "@refinedev/core";

export class Capability implements RefineConfigCapability {
  dependencies?: string[] | undefined;
  id: string;
  status: CapabilityStatus;
  readonly type: "core:refine-config" = "core:refine-config";
  version = "0.1.0";

  async destroy() {
    // No cleanup needed
  }

  getConfig(existing?: Partial<RefineProps>): Partial<RefineProps> {
    existing = {
      options: {},
      resources: [],
      ...existing,
    };
    return {
      dataProvider: {
        ...existing?.dataProvider,
        default: dataProvider("/api"),
      },
      notificationProvider: notificationProvider(),
    };
  }

  async initialize() {
    // No SDK initialization needed
  }
}
