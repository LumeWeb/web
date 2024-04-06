import { AxiosHeaders, AxiosProgressEvent, AxiosRequestConfig } from "axios";
import { S5Client } from "../client.js";
import { BaseCustomOptions, CustomRegistryOptions } from "#options/registry.js";

/**
 * Custom client options.
 *
 * @property [apiKey] - Authentication password to use for a single S5 node/portal.
 * @property [customUserAgent] - Custom user agent header to set.
 * @property [customCookie] - Custom cookie header to set. WARNING: the Cookie header cannot be set in browsers. This is meant for usage in server contexts.
 * @property [onDownloadProgress] - Optional callback to track download progress.
 * @property [onUploadProgress] - Optional callback to track upload progress.
 */

export type CustomClientOptions = {
  apiKey?: string;
  customUserAgent?: string;
  customCookie?: string;
  onDownloadProgress?: (progressEvent: AxiosProgressEvent) => void;
  onUploadProgress?: (progressEvent: AxiosProgressEvent) => void;
  httpConfig?: AxiosRequestConfig;
};

export function optionsToConfig(
  client: S5Client,
  def: CustomClientOptions | BaseCustomOptions | CustomRegistryOptions,
  ...options: (
    | CustomClientOptions
    | BaseCustomOptions
    | CustomRegistryOptions
  )[]
): AxiosRequestConfig {
  let config: AxiosRequestConfig = {};

  config.baseURL = client.portalUrl;

  const extraOptions= Object.values(options.reduce((acc, val) => {
    return {
      ...acc,
      ...val,
    };
  }, options)).reverse().pop();

  const finalOptions = {
    ...def,
    ...client.clientOptions,
    ...extraOptions,
  } as CustomClientOptions;

  if (finalOptions?.onDownloadProgress) {
    config.onDownloadProgress = finalOptions?.onDownloadProgress;
  }

  if (finalOptions?.onUploadProgress) {
    config.onUploadProgress = finalOptions?.onUploadProgress;
  }

  const headers = new AxiosHeaders(config.headers as AxiosHeaders);

  if (finalOptions?.customCookie) {
    headers.set("Cookie", finalOptions.customCookie);
  }
  if (finalOptions?.customUserAgent) {
    headers.set("User-Agent", finalOptions.customUserAgent);
  }

  if (finalOptions?.apiKey) {
    headers.set("Authorization", `Bearer ${finalOptions.apiKey}`);
    config.withCredentials = true;

    config.params = {
      ...config.params,
      auth_token: finalOptions?.apiKey,
    };
  }

  config.headers = headers;

  if (finalOptions?.httpConfig) {
    config = {
      ...config,
      ...finalOptions.httpConfig,
    };
  }

  return config;
}
