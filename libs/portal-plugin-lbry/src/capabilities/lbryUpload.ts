import type {
  UploadCapability,
  UploadConfig,
} from "@lumeweb/portal-plugin-dashboard";

import {
  CapabilityStatus,
  cleanTrailingSlashes,
  FRAMEWORK_NS,
  createNamespacedId,
  Framework,
  getApiBaseUrl,
} from "@lumeweb/portal-framework-core";

export class LbryUpload implements UploadCapability {
  readonly id = createNamespacedId("lbry", "upload");
  readonly status: CapabilityStatus;
  readonly type = createNamespacedId(FRAMEWORK_NS, "upload");
  #tusEndpoint: string;
  #xhrEndpoint: string;

  async destroy() {}

  getAdditionalPlugins() {
    return [];
  }
  getLargeFileUploadConfig(): UploadConfig {
    return {
      endpoint: this.#tusEndpoint,
    };
  }

  getSmallFileUploadConfig(): UploadConfig {
    return {
      endpoint: this.#xhrEndpoint,
    };
  }

  async initialize(framework: Framework) {
    const apiUrl = getApiBaseUrl({
      currentUrl: framework.portalUrl,
    });

    if (apiUrl === false) {
      throw new Error("Invalid API URL configuration");
    }
    const parsed = new URL(apiUrl);

    parsed.hostname = `lbry.${parsed.hostname}`;

    const subdomain = cleanTrailingSlashes(parsed.toString());

    this.#xhrEndpoint = `${subdomain}/api/streams/upload`;
    this.#tusEndpoint = `${subdomain}/api/streams/upload/tus`;
  }
}
