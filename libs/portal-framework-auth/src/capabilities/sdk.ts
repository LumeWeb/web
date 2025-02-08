import {
  env,
  Framework,
  getAccountSubdomain,
  getApiBaseUrl,
  SdkCapability,
  getPluginMeta,
} from "@lumeweb/portal-framework-core";
import { Sdk } from "@lumeweb/portal-sdk";

export class Capability implements SdkCapability {
  readonly id: string = "core:core:sdk-auth";
  status: "active" | "error" | "inactive";
  readonly type: "core:sdk" = "core:sdk";
  #sdk?: Sdk;

  async destroy() {
    this.#sdk = undefined;
    this.status = "inactive";
  }

  getSdk() {
    if (!this.#sdk) throw new Error("SDK not initialized");
    return this.#sdk;
  }

  async initialize(framework: Framework) {
    try {
      /*      // Get account subdomain using the resolved portal URL
      const accountSubdomain = getAccountSubdomain(
        getPluginMeta(framework.meta!, "dashboard", "subdomain"),
        {
          isRootDomain: env.VITE_PORTAL_DOMAIN_IS_ROOT === "true",
        },
      );*/

      const apiUrl = getApiBaseUrl({
        currentUrl: framework.portalUrl,
        allowLocalhost: process.env.NODE_ENV === "development",
        preserveSubdomain: env.VITE_PORTAL_DOMAIN_IS_ROOT !== "true",
      });

      if (apiUrl === false) {
        throw new Error("Invalid API URL configuration");
      }

      this.#sdk = new Sdk(apiUrl);
    } catch (error) {
      throw new Error(
        `SDK initialization failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
