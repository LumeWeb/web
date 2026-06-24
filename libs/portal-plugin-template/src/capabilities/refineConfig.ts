import {
  createNamespacedId,
  RefineConfigCapability,
  mergeRefineConfig,
} from "@lumeweb/portal-framework-core";
import type { RefineProps } from "@refinedev/core";
import { Framework } from "@lumeweb/portal-framework-core";

export class Capability implements RefineConfigCapability {
  readonly id = createNamespacedId("template", "refine-config");
  status: "active" | "error" | "inactive" = "active";
  readonly type = "framework:refine-config";

  async initialize(_framework: Framework) {
    // Initialize capability
  }

  getConfig(existing?: Partial<RefineProps>) {
    return mergeRefineConfig(existing, {
      // Add template-specific Refine configuration here
      options: {
        // Refine options
      },
    });
  }

  async destroy() {
    // Cleanup capability
  }
}