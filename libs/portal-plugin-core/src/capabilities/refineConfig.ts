import dataProvider from "@lumeweb/advanced-rest-provider";
import {
  CapabilityStatus,
  createNamespacedId,
  env,
  type Framework,
  getApiBaseUrl,
  RefineConfigCapability,
} from "@lumeweb/portal-framework-core";
import { RefineProps } from "@refinedev/core";

import { notificationProvider } from "@/dataProviders/notificationProvider";

export class Capability implements RefineConfigCapability {
  dependencies?: string[] | undefined;
  id = createNamespacedId("core", "refine-config");
  status: CapabilityStatus;
  readonly type: "core:refine-config" = "core:refine-config";
  version = "0.1.0";
  #apiUrl: string;

  async destroy() {
    // No cleanup needed
  }

  getConfig(existing?: Partial<RefineProps>): Partial<RefineProps> {
    if (!this.#apiUrl) {
      throw new Error("RefineConfigCapability must be initialized before use");
    }

    existing = {
      options: {},
      resources: [],
      ...existing,
    };
    return {
      dataProvider: {
        ...existing?.dataProvider,
        default: dataProvider(this.#apiUrl),
      },
      notificationProvider: notificationProvider(),
    };
  }

  async initialize(framework: Framework) {
    const apiUrl = getApiBaseUrl({
      currentUrl: framework.portalUrl,
      preserveSubdomain: !env.VITE_PORTAL_DOMAIN_IS_ROOT,
    });

    if (!apiUrl) {
      throw new Error("Failed to get API base URL");
    }

    this.#apiUrl = apiUrl;
  }
}
