import {
  env,
  Framework,
  getApiBaseUrl,
  SdkCapability,
} from "@lumeweb/portal-framework-core";
import { Sdk } from "@lumeweb/portal-sdk";

export class Capability implements SdkCapability {
  readonly id: string = "core:sdk-auth";
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
      const apiUrl = getApiBaseUrl({
        currentUrl: framework.portalUrl,
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
