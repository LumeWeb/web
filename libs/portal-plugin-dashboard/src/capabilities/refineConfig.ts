import type { RefineProps } from "@refinedev/core";

import dataProvider from "@lumeweb/advanced-rest-provider";
import {
  type AuthProviderWithEmitter,
  DATA_PROVIDER_NAME,
} from "@lumeweb/portal-framework-auth";
import {
  env,
  Framework,
  getApiBaseUrl,
  getPluginMeta,
  mergeRefineConfig,
  RefineConfigCapability,
  syncAuthProviderWithDataProvider,
} from "@lumeweb/portal-framework-core";

export class Capability implements RefineConfigCapability {
  readonly id: string = "dashboard:refine-config";
  status;
  readonly type = "core:refine-config";
  version: string;
  #apiUrl: string;

  async destroy() {}

  getConfig(existing?: Partial<RefineProps>) {
    const token = localStorage.getItem("jwt");
    const acctProvider = dataProvider(this.#apiUrl, true);

    if (token) {
      acctProvider.setAuthToken(token);
    }

    syncAuthProviderWithDataProvider(acctProvider, existing?.authProvider);

    return mergeRefineConfig(existing, { [DATA_PROVIDER_NAME]: acctProvider }, [
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
    ]);
  }

  async initialize(framework: Framework) {
    const apiUrl = getApiBaseUrl({
      currentUrl: framework.portalUrl,
      preserveSubdomain: !env.VITE_PORTAL_DOMAIN_IS_ROOT,
    });

    if (!apiUrl) {
      throw new Error("Failed to get API base URL");
    }

    const subdomain = getPluginMeta(framework.meta!, "dashboard", "subdomain");
    if (!subdomain) {
      throw new Error("Failed to get subdomain from plugin metadata");
    }

    try {
      const apiDomain = new URL(apiUrl);
      this.#apiUrl = `${apiDomain.protocol}//${subdomain}.${apiDomain.hostname}/api`;
    } catch (error) {
      throw new Error(`Failed to construct API URL: ${error.message}`);
    }
  }
}
