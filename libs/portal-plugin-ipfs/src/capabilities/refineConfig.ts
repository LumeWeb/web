import type { RefineProps } from "@refinedev/core";

import dataProvider from "@lumeweb/advanced-rest-provider";
import {
  createNamespacedId,
  env,
  Framework,
  getApiBaseUrl,
  mergeRefineConfig,
  RefineConfigCapability,
  syncAuthProviderWithDataProvider,
} from "@lumeweb/portal-framework-core";
import { createNanoEvents, Emitter } from "nanoevents";

const SUBDOMAIN = "ipfs";
const DATA_PROVIDER_NAME = "ipfs";

export class Capability implements RefineConfigCapability {
  readonly id = createNamespacedId("ipfs", "refine-config");
  status: "active" | "error" | "inactive" = "active";
  readonly type = "framework:refine-config";
  version = "0.1.0";
  #apiUrl!: string;
  #authToken: null | string = null;
  #authUnbind: (() => void) | null = null;
  #emitter!: Emitter;

  async destroy() {
    if (this.#authUnbind) {
      this.#authUnbind();
      this.#authUnbind = null;
    }
  }

  /**
   * Gets the API URL for this capability
   */
  getApiUrl(): string {
    return this.#apiUrl;
  }

  /**
   * Gets the current auth token
   */
  getAuthToken(): null | string {
    return this.#authToken;
  }

  getConfig(existing?: Partial<RefineProps>) {
    const acctProvider = dataProvider(this.#apiUrl, true);

    this.#authUnbind = syncAuthProviderWithDataProvider(
      acctProvider,
      existing?.authProvider as any,
      {
        onTokenChange: (token) => {
          this.#authToken = token;
          this.#emitter.emit("authTokenChanged", token);
        },
      },
    );

    const providers = { [DATA_PROVIDER_NAME]: acctProvider };
    // The deployed IPFS Plugin API serves all routes under the `/api` prefix
    // (see libs/pinner/src/api/swagger.yaml), so resource templates keep that
    // prefix to match the backend contract.
    const resources = [
      {
        meta: {
          dataProviderName: DATA_PROVIDER_NAME,
          template: "/api/websites",
        },
        name: "ipfs/websites",
      },
      {
        meta: {
          dataProviderName: DATA_PROVIDER_NAME,
          template: "/api/workspaces",
        },
        name: "ipfs/workspaces",
      },
    ];

    return mergeRefineConfig(existing, providers, resources);
  }

  /**
   * Gets the event emitter for this capability
   */
  getEmitter(): Emitter {
    return this.#emitter;
  }

  async initialize(framework: Framework) {
    const apiUrl = getApiBaseUrl({
      currentUrl: framework.portalUrl,
      preserveSubdomain: !env.VITE_PORTAL_DOMAIN_IS_ROOT,
    });

    if (!apiUrl) {
      throw new Error("Failed to get API base URL");
    }

    try {
      const apiDomain = new URL(apiUrl);
      const hostWithPort = apiDomain.port
        ? `${apiDomain.hostname}:${apiDomain.port}`
        : apiDomain.hostname;
      this.#apiUrl = `${apiDomain.protocol}//${SUBDOMAIN}.${hostWithPort}`;
    } catch (error) {
      throw new Error(`Failed to construct API URL: ${error instanceof Error ? error.message : String(error)}`, { cause: error });
    }

    // Initialize the nanoevents emitter
    this.#emitter = createNanoEvents();
  }
}
