import {
  createNamespacedId,
  CapabilityStatus,
  Framework,
  FRAMEWORK_NS,
  getSdk,
  RefineConfigCapability,
} from "@lumeweb/portal-framework-core";
import { AuthProvider } from "@refinedev/core";

import { createAuthProvider } from "../dataProviders/auth";

export class Capability implements RefineConfigCapability {
  dependencies = [createNamespacedId(FRAMEWORK_NS, "sdk-auth")];
  readonly id = createNamespacedId(FRAMEWORK_NS, "refine-config-auth");
  status: CapabilityStatus = "inactive";
  readonly type = "framework:refine-config";
  #authProvider?: AuthProvider;

  async destroy() {
    this.#authProvider = undefined;
    this.status = "inactive";
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
    const sdk = await getSdk(framework);
    this.#authProvider = createAuthProvider(sdk);
    this.status = "active";
  }
}
