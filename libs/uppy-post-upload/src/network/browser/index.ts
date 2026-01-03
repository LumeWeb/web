/**
 * Browser network driver using @uppy/utils fetcher (XHR-based)
 * This driver provides upload progress tracking via XMLHttpRequest
 */

import type {
  NetworkCallbacks,
  NetworkClient,
  NetworkClientHooks,
  NetworkRequestOptions,
  NetworkResponse,
} from "@/network/types";
import {
  fetcher,
  type FetcherOptions,
  isNetworkError,
  NetworkError,
} from "@uppy/utils";

const DEFAULT_NETWORK_ERROR_MESSAGE =
  "this looks like a network error, the endpoint might be blocked by an internet provider or a firewall.";

export class BrowserNetworkClient implements NetworkClient {
  #shouldRetry?: (xhr: XMLHttpRequest) => boolean;
  #onAfterResponse?: (
    xhr: XMLHttpRequest,
    retryCount: number,
  ) => void | Promise<void>;
  #onBeforeRequest?: (
    xhr: XMLHttpRequest,
    retryCount: number,
  ) => void | Promise<void>;

  isAvailable(): boolean {
    return typeof XMLHttpRequest !== "undefined";
  }

  getDriverName(): string {
    return "browser";
  }

  processError(error: unknown, xhr?: XMLHttpRequest): Error {
    // If already an Error, process it
    if (error instanceof Error) {
      // If error is a NetworkError, extract status info from its xhr
      // But preserve custom error messages (e.g., from onAfterResponse hook)
      if (error instanceof NetworkError && error.request) {
        const requestXhr = error.request;
        const status = requestXhr.status;
        const statusText = requestXhr.statusText || `Status ${status}`;
        // Only overwrite message if it's the default NetworkError message
        // This preserves custom errors thrown from onAfterResponse hook
        if (error.message.toLowerCase() === DEFAULT_NETWORK_ERROR_MESSAGE) {
          error.message = `${statusText} (${status})`;
        }
        // Use the NetworkError's xhr if xhr not provided
        if (!xhr) xhr = requestXhr;
      }

      // Check if this is a network error based on xhr
      let finalError: Error;
      if (isNetworkError(xhr)) {
        finalError = new NetworkError(error, xhr);
      } else {
        finalError = error as Error;
      }

      return Object.assign(finalError, { request: xhr });
    }

    // If it's a string, convert to Error
    if (typeof error === "string") {
      return new Error(error);
    }

    // Otherwise, create an error with the data
    return Object.assign(new Error("Upload error"), { data: error });
  }

  setHooks(hooks: NetworkClientHooks) {
    this.#shouldRetry = hooks.shouldRetry;
    this.#onAfterResponse = hooks.onAfterResponse;
    this.#onBeforeRequest = hooks.onBeforeRequest;
  }

  async request(
    url: string,
    options: NetworkRequestOptions,
    callbacks?: NetworkCallbacks,
  ): Promise<NetworkResponse> {
    const fetcherOptions: FetcherOptions = {
      method: options.method || "GET",
      body: options.body || null,
      headers: options.headers || {},
      timeout: options.timeout || 30_000,
      signal: options.signal,
      withCredentials: options.withCredentials || false,
      responseType: options.responseType,
      retries: options.retries ?? 3,
      shouldRetry: this.#shouldRetry,
      onBeforeRequest: this.#onBeforeRequest,
      onAfterResponse: this.#onAfterResponse,
      onUploadProgress: callbacks?.onUploadProgress
        ? (event) => {
            callbacks.onUploadProgress!({
              loaded: event.loaded,
              total: event.total,
              lengthComputable: event.lengthComputable,
            });
          }
        : undefined,
      onTimeout: callbacks?.onTimeout
        ? (timeout) => callbacks.onTimeout!(timeout)
        : undefined,
    };

    const xhr = await fetcher(url, fetcherOptions);

    return {
      status: xhr.status,
      statusText: xhr.statusText,
      responseText: xhr.responseText,
      response: xhr.response,
      responseType: xhr.responseType,
      request: xhr,
    };
  }
}

export const browserClient = new BrowserNetworkClient();
