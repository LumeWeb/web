import type { RefineProps } from "@refinedev/core";
import {
  Framework,
  type CapabilityStatus,
  createNamespacedId,
  type NamespacedId,
  RefineConfigCapability,
  mergeRefineConfig,
  syncAuthProviderWithDataProvider,
} from "@lumeweb/portal-framework-core";
import dataProvider from "@lumeweb/advanced-rest-provider";
import { DATA_PROVIDER_NAME } from "@lumeweb/portal-framework-auth";
import { createNanoEvents, Emitter } from "nanoevents";

export class Capability implements RefineConfigCapability {
  readonly id = createNamespacedId("billing", "refine-config");
  status: CapabilityStatus = "active";
  readonly type = "framework:refine-config";
  version!: string;
  #apiUrl!: string;
  #authToken: string | null = null;
  #emitter!: Emitter;
  #authUnbind: (() => void) | null = null;
  dependencies = [createNamespacedId("dashboard", "refine-config")];

  getApiUrl(): string {
    return this.#apiUrl;
  }

  getAuthToken(): string | null {
    return this.#authToken;
  }

  getEmitter(): Emitter {
    return this.#emitter;
  }

  async destroy() {
    if (this.#authUnbind) {
      this.#authUnbind();
      this.#authUnbind = null;
    }
  }

  getConfig(existing?: Partial<RefineProps>) {
    const billingResources = [
      {
        meta: {
          dataProviderName: DATA_PROVIDER_NAME,
          template: "/account/billing/subscription",
        },
        name: "billing-subscription",
      },
      {
        meta: {
          dataProviderName: DATA_PROVIDER_NAME,
          template: "/account/billing/plans",
        },
        name: "billing-plans",
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
          template: "/account/billing/management",
        },
        name: "billing-management",
      },
    ];

    const acctProvider = dataProvider(this.#apiUrl, true);

    this.#authUnbind = syncAuthProviderWithDataProvider(
      acctProvider,
      existing?.authProvider,
      {
        onTokenChange: (token) => {
          this.#authToken = token;
          this.#emitter.emit("authTokenChanged", token);
        },
      },
    );

    return mergeRefineConfig(existing, { [DATA_PROVIDER_NAME]: acctProvider }, billingResources);
  }

  async initialize(framework: Framework) {
    this.#emitter = createNanoEvents();

    // Get the dashboard refine capability
    const dashboardCapability = await framework.getCapability<
      RefineConfigCapability & { apiUrl: string }
    >(createNamespacedId("dashboard", "refine-config"));

    if (!dashboardCapability) {
      throw new Error("Dashboard refine capability not found");
    }

    // Get the API URL from the dashboard capability
    this.#apiUrl = dashboardCapability.apiUrl;

    if (!this.#apiUrl) {
      throw new Error("API URL not found in dashboard capability");
    }
  }
}
