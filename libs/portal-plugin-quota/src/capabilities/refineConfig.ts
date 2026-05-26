import type { RefineProps } from "@refinedev/core";
import {
  Framework,
  RefineConfigCapability,
  type CapabilityStatus,
  mergeRefineConfig,
  syncAuthProviderWithDataProvider,
} from "@lumeweb/portal-framework-core";
import dataProvider from "@lumeweb/advanced-rest-provider";
import { DATA_PROVIDER_NAME } from "@lumeweb/portal-framework-auth";
import { createNanoEvents, Emitter } from "nanoevents";

export class Capability implements RefineConfigCapability {
  readonly id: string = "quota:refine-config";
  status: CapabilityStatus = "active";
  readonly type = "core:refine-config";
  version!: string;
  #apiUrl!: string;
  #authToken: string | null = null;
  #emitter!: Emitter;
  #authUnbind: (() => void) | null = null;
  dependencies = ["dashboard:refine-config"];

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
    const quotaResources = [
      {
        meta: {
          dataProviderName: DATA_PROVIDER_NAME,
          template: "/account/quota",
        },
        name: "account-quota",
      },
      {
        meta: {
          dataProviderName: DATA_PROVIDER_NAME,
          template: "/account/quota/history",
        },
        name: "account-quota-history",
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

    return mergeRefineConfig(existing, { [DATA_PROVIDER_NAME]: acctProvider }, quotaResources);
  }

  async initialize(framework: Framework) {
    this.#emitter = createNanoEvents();

    const dashboardCapability = await framework.getCapability<
      RefineConfigCapability & { apiUrl: string }
    >("dashboard:refine-config");

    if (!dashboardCapability) {
      throw new Error("Dashboard refine capability not found");
    }

    this.#apiUrl = dashboardCapability.apiUrl;

    if (!this.#apiUrl) {
      throw new Error("API URL not found in dashboard capability");
    }
  }
}
