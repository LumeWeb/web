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

const SUBDOMAIN = "sia";
export const DATA_PROVIDER_NAME = "sia";

export class RefineConfig implements RefineConfigCapability {
  readonly id = "sia:refine-config";
  readonly status = "inactive";
  readonly type = "core:refine-config" as const;
  #apiUrl: string;

  async destroy() {}

  getConfig(existing?: Partial<RefineProps>) {
    const siaProvider = dataProvider(this.#apiUrl, true);

    syncAuthProviderWithDataProvider(siaProvider, existing?.authProvider);

    const providers = { [DATA_PROVIDER_NAME]: siaProvider };
    const resources = [
      {
        meta: {
          dataProviderName: DATA_PROVIDER_NAME,
          template: "/apps",
        },
        name: "sia/apps",
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
      this.#apiUrl = `${apiDomain.protocol}//${SUBDOMAIN}.${hostWithPort}/api`;
    } catch (error) {
      throw new Error(`Failed to construct API URL: ${error.message}`);
    }
  }
}
