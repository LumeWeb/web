import type {
  UploadCapability,
  UploadConfig,
  UppyPlugin,
} from "@lumeweb/portal-plugin-dashboard";

import {
  createNamespacedId,
  type NamespacedId,
  type Framework,
  cleanTrailingSlashes,
  getApiBaseUrl,
} from "@lumeweb/portal-framework-core";

import CarPreprocessorPlugin from "./carPreprocessor";

export class IpfsUpload implements UploadCapability {
  readonly id = createNamespacedId("ipfs", "upload");
  status: "active" | "error" | "inactive" = "active";
  readonly type = "framework:upload" as const;
  #tusEndpoint!: string;
  #xhrEndpoint!: string;

  async destroy() {}

  getAdditionalPlugins(): UppyPlugin[] {
    return [
      {
        module: CarPreprocessorPlugin,
        name: "IPFSCarPreprocessor",
        options: {},
      },
    ];
  }

  #parseResponseData(xhr: XMLHttpRequest) {
    try {
      const response = JSON.parse(xhr.responseText);
      return response;
    } catch (error) {
      throw new Error('@uppy/xhr-upload expects a JSON response. To parse non-JSON responses, use `getResponseData` to turn your response into JSON.');
    }
  }

  getLargeFileUploadConfig(): UploadConfig {
    return {
      endpoint: this.#tusEndpoint,
      getResponseData: this.#parseResponseData.bind(this),
    } as unknown as UploadConfig;
  }

  getSmallFileUploadConfig(): UploadConfig {
    return {
      endpoint: this.#xhrEndpoint,
      getResponseData: this.#parseResponseData.bind(this),
    } as unknown as UploadConfig;
  }

  async initialize(framework: Framework) {
    const apiUrl = getApiBaseUrl({
      currentUrl: framework.portalUrl,
    });

    if (apiUrl === false) {
      throw new Error("Invalid API URL configuration");
    }
    const parsed = new URL(apiUrl);

    parsed.hostname = `ipfs.${parsed.hostname}`;

    const subdomain = cleanTrailingSlashes(parsed.toString());

    this.#xhrEndpoint = `${subdomain}/api/upload`;
    this.#tusEndpoint = `${subdomain}/api/upload/tus`;
  }
}
