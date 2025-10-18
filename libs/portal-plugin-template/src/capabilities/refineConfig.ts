import {
  RefineConfigCapability,
  mergeRefineConfig,
} from "@lumeweb/portal-framework-core";
import type { RefineProps } from "@refinedev/core";
import { Framework } from "@lumeweb/portal-framework-core";

export class Capability implements RefineConfigCapability {
  readonly id: string = "template:refine-config";
  readonly type = "core:refine-config";

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