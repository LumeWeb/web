import type { RefineProps } from "@refinedev/core";
import {
  createNamespacedId,
  Framework,
  mergeRefineConfig,
  RefineConfigCapability,
  type CapabilityStatus,
} from "@lumeweb/portal-framework-core";

const DATA_PROVIDER_NAME = "ipfs";

export class Capability implements RefineConfigCapability {
  readonly id = createNamespacedId("onboarding", "refine-config");
  status: CapabilityStatus = "active";
  readonly type = "framework:refine-config";
  version!: string;
  #apiUrl!: string;

  dependencies = [createNamespacedId("ipfs", "refine-config")];

  getApiUrl(): string {
    return this.#apiUrl;
  }

  async destroy() {
  }

  getConfig(existing?: Partial<RefineProps>) {
    const onboardingResources = [
      {
        meta: {
          dataProviderName: DATA_PROVIDER_NAME,
          template: "/api/websites",
        },
        name: "ipfs/websites",
      },
    ];

    return mergeRefineConfig(existing, {}, onboardingResources);
  }

  async initialize(framework: Framework) {
    const ipfsCapability = await framework.getCapability<
      RefineConfigCapability & { getApiUrl(): string }
    >(createNamespacedId("ipfs", "refine-config"));

    if (!ipfsCapability) {
      throw new Error("IPFS refine capability not found");
    }

    this.#apiUrl = ipfsCapability.getApiUrl();

    if (!this.#apiUrl) {
      throw new Error("API URL not found in IPFS capability");
    }
  }
}
