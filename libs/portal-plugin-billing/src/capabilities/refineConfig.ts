import type { RefineProps } from "@refinedev/core";
import {
  Framework,
  mergeRefineConfig,
  RefineConfigCapability,
} from "@lumeweb/portal-framework-core";

export class Capability implements RefineConfigCapability {
  readonly id: string = "billing:refine-config";
  status;
  readonly type = "core:refine-config";
  version: string;
  #apiUrl: string;
  dependencies = ["dashboard:refine-config"];

  async destroy() {}

  getConfig(existing?: Partial<RefineProps>) {
    return mergeRefineConfig(existing, {});
  }

  async initialize(framework: Framework) {
    // Get the dashboard refine capability
    const dashboardCapability = await framework.getCapability<
      RefineConfigCapability & { apiUrl: string }
    >("dashboard:refine-config");

    if (!dashboardCapability) {
      throw new Error("Dashboard refine capability not found");
    }

    // Get the API URL from the dashboard capability
    this.#apiUrl = dashboardCapability.apiUrl;

    if (!this.#apiUrl) {
      throw new Error("API URL not found in dashboard capability");
    }
  }
}
