import type { RefineProps } from "@refinedev/core";
import {
  Framework,
  RefineConfigCapability,
} from "@lumeweb/portal-framework-core";
import { resolveDashboardApiUrl, setupDataProvider } from "@lib/util";
import { DATA_PROVIDER_NAME } from "@lumeweb/portal-framework-auth";

export class Capability implements RefineConfigCapability {
  readonly id: string = "dashboard:refine-config";
  status;
  readonly type = "core:refine-config";
  version: string;
  #apiUrl: string;

  async destroy() {}

  /**
   * Gets the resolved API URL for the dashboard
   */
  get apiUrl(): string {
    return this.#apiUrl;
  }

  getConfig(existing?: Partial<RefineProps>) {
    const dashboardResources = [
      {
        meta: { template: "/account" },
        name: DATA_PROVIDER_NAME,
      },
      {
        meta: {
          dataProviderName: DATA_PROVIDER_NAME,
          template: "/account/keys",
        },
        name: "api-keys",
      },
      {
        meta: {
          dataProviderName: DATA_PROVIDER_NAME,
          template: "/operations",
        },
        name: "operations",
      },
      {
        meta: {
          dataProviderName: DATA_PROVIDER_NAME,
          template: "operations/filters",
        },
        name: "operations.filters",
      },
    ];

    return setupDataProvider(this.#apiUrl, existing, dashboardResources);
  }

  async initialize(framework: Framework) {
    this.#apiUrl = resolveDashboardApiUrl(framework);
  }
}
