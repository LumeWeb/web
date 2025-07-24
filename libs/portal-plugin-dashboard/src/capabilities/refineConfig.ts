import type { RefineProps } from "@refinedev/core";

import {
  env,
  Framework,
  getApiBaseUrl,
  getPluginMeta,
  RefineConfigCapability,
} from "@lumeweb/portal-framework-core";
import dataProvider from "@lumeweb/advanced-rest-provider";

export class Capability implements RefineConfigCapability {
  readonly id: string = "core:dashboard:refine-config";
  status;
  readonly type = "core:refine-config";
  version: string;
  #apiUrl: string;

  async destroy() {}

  getConfig(existing?: Partial<RefineProps>) {
    const token = localStorage.getItem("jwt");

    const acctProvider = dataProvider(this.#apiUrl);

    if (token) {
      acctProvider.setAuthToken(token);
    }

    const mergedConfig = {
      ...existing,
      options: {},
      resources: [
        {
          name: "account",
          meta: {
            template: "/account",
            dataProviderName: "account",
          },
        },
      ],
      // @ts-ignore
      dataProvider: {
        ...existing?.dataProvider,
        account: acctProvider,
      },
    };
    return {
      options: {
        ...mergedConfig?.options,
        syncWithLocation: true,
        warnWhenUnsavedChanges: true,
      },
      resources: [...(mergedConfig.resources || [])],
      // @ts-ignore
      dataProvider: { ...(mergedConfig.dataProvider || {}) },
    } satisfies Partial<RefineProps>;
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
      const apiDomain = new URL(apiUrl as string);
      this.#apiUrl = `${apiDomain.protocol}//${subdomain}.${apiDomain.hostname}/api`;
    } catch (error) {
      throw new Error(`Failed to construct API URL: ${error.message}`);
    }
  }
}
