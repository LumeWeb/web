import type { RefineProps } from "@refinedev/core";
import {
  createNamespacedId,
  type CapabilityStatus,
  type Framework,
  type NamespacedId,
  type RefineConfigCapability,
} from "@lumeweb/portal-framework-core";
import { resolveDashboardApiUrl, setupDataProvider } from "@lib/util";
import { DATA_PROVIDER_NAME } from "@lumeweb/portal-framework-auth";

export class Capability implements RefineConfigCapability {
  readonly id: NamespacedId = createNamespacedId(
    "dashboard",
    "refine-config",
  );
  status: CapabilityStatus = "active";
  readonly type = "framework:refine-config";
  version: string = "0.0.1";
  // constructor must set; placeholder avoids definite assignment errors
  #apiUrl: string = "";
  async destroy(_framework?: Framework) {}

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
      {
        meta: {
          dataProviderName: DATA_PROVIDER_NAME,
          template: "/account/billing/balance",
        },
        name: "billing-balance",
      },
      {
        meta: {
          dataProviderName: DATA_PROVIDER_NAME,
          template: "/account/billing/credits",
        },
        name: "billing-credits",
      },
      {
        meta: {
          dataProviderName: DATA_PROVIDER_NAME,
          template: "/account/billing/pricing-plans",
        },
        name: "billing-pricing-plans",
      },
      {
        meta: {
          dataProviderName: DATA_PROVIDER_NAME,
          template: "/account/billing/stripe/customer-portal",
        },
        name: "billing-stripe-customer-portal",
      },
    ];

    return setupDataProvider(this.#apiUrl, existing, dashboardResources);
  }

  async initialize(framework: Framework) {
    this.#apiUrl = resolveDashboardApiUrl(framework);
  }
}
