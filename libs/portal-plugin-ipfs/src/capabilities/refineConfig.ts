import type { RefineProps } from "@refinedev/core";

import dataProvider from "@lumeweb/advanced-rest-provider";
import {
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
  readonly id: string = "ipfs:refine-config";
  status;
  readonly type = "core:refine-config";
  version: string;
  #apiUrl: string;
  #authToken: string | null = null;
  #emitter: Emitter;
  #authUnbind: (() => void) | null = null;

  /**
   * Gets the API URL for this capability
   */
  getApiUrl(): string {
    return this.#apiUrl;
  }

  /**
   * Gets the current auth token
   */
  getAuthToken(): string | null {
    return this.#authToken;
  }

  /**
   * Gets the event emitter for this capability
   */
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

    const providers = { [DATA_PROVIDER_NAME]: acctProvider };
    const resources = [
      {
        meta: {
          dataProviderName: DATA_PROVIDER_NAME,
          template: "/files",
        },
        name: "ipfs/files",
      },
      {
        meta: {
          dataProviderName: DATA_PROVIDER_NAME,
          template: "/files/directory",
        },
        name: "ipfs/files/directory",
      },
      {
        meta: {
          dataProviderName: DATA_PROVIDER_NAME,
          template: "/files/breadcrumbs",
        },
        name: "ipfs/files/breadcrumbs",
      },
    ];

    return mergeRefineConfig(existing, providers, resources);
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
      throw new Error(`Failed to construct API URL: ${error.message}`);
    }

    // Initialize the nanoevents emitter
    this.#emitter = createNanoEvents();
  }
}
