import {
  CapabilityStatus,
  Framework,
  RefineConfigCapability,
  SdkCapability,
} from "@lumeweb/portal-framework-core";
import { AuthProvider } from "@refinedev/core";

import { createAuthProvider } from "../dataProviders/auth";

export class Capability implements RefineConfigCapability {
  dependencies = ["core:core:sdk-auth"];
  readonly id = "core:core:refine-config-auth";
  status: CapabilityStatus;
  readonly type = "core:refine-config";
  #authProvider?: AuthProvider;

  async destroy() {
    this.#authProvider = undefined;
  }

  getAuthProvider() {
    if (!this.#authProvider) throw new Error("Auth provider not initialized");
    return this.#authProvider;
  }

  getConfig() {
    return {
      authProvider: this.getAuthProvider(),
    };
  }

  async initialize(framework: Framework) {
    // Initialize auth provider
    const sdkCaps =
      await framework.getCapabilitiesByType<SdkCapability>("core:sdk");

    if (!sdkCaps?.length) {
      throw new Error("SDK not found");
    }

    const sdk = sdkCaps.pop()!;

    this.#authProvider = createAuthProvider(sdk.getSdk());
  }
}
