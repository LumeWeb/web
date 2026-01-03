/**
 * Node.js network driver using ky with upload progress tracking
 * Available in Node.js 18+ with native fetch support
 */

import ky from "ky";
import type {
  NetworkCallbacks,
  NetworkClient,
  NetworkClientHooks,
  NetworkRequestOptions,
  NetworkResponse,
} from "@/network/types";
import {
  DEFAULT_RETRY_OPTIONS,
  getRetryDelay,
  shouldRetryRequest,
  type RetryOptions,
} from "./retry";

const DEFAULT_KY_ERROR_PREFIX = "request failed";
const DEFAULT_HTTP_ERROR_NAME = "httperror";
const CONTENT_TYPE_JSON = "application/json";

export class NodeNetworkClient implements NetworkClient {
  #shouldRetry?: (xhr: any) => boolean;
  #onAfterResponse?: (xhr: any, retryCount: number) => void | Promise<void>;
  #onBeforeRequest?: (xhr: any, retryCount: number) => void | Promise<void>;

  isAvailable(): boolean {
    return (
      typeof process !== "undefined" &&
      process.versions != null &&
      process.versions.node != null &&
      typeof fetch === "function"
    );
  }

  getDriverName(): string {
    return "node";
  }

  processError(error: unknown): Error {
    // If already an Error, process it
    if (error instanceof Error) {
      // For ky errors, we can extract status info from the error
      const kyError = error as any;
      if (kyError.response && kyError.response.status) {
        const status = kyError.response.status;
        const statusText = kyError.response.statusText || `Status ${status}`;
        // Only overwrite message if it's the default ky error message
        // This preserves custom errors thrown from onAfterResponse hook
        // ky's default format: "Request failed with status code XXX: METHOD URL"
        if (
          error.name.toLowerCase() === DEFAULT_HTTP_ERROR_NAME &&
          error.message.toLowerCase().startsWith(DEFAULT_KY_ERROR_PREFIX)
        ) {
          error.message = `${statusText} (${status})`;
        }
        // Attach response info for compatibility
        (error as any).request = { status, statusText };
      }
      return error;
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
    const {
      body,
      headers = {},
      method = "GET",
      timeout = 30_000,
      signal,
      withCredentials = false,
      retries = 3,
    } = options;

    // Build retry options using ky's defaults but with our retry limit (retries = number of retry attempts)
    // Uppy's retries=3 means up to 3 retry attempts (total 4 requests including initial)
    const retryOptions: RetryOptions = {
      ...DEFAULT_RETRY_OPTIONS,
      limit: retries,
    };

    let retryCount = 0;
    let lastError: Error | undefined;
    const limit = retryOptions.limit ?? DEFAULT_RETRY_OPTIONS.limit;

    while (retryCount <= limit) {
      try {
        // Call onBeforeRequest if provided
        if (this.#onBeforeRequest) {
          await this.#onBeforeRequest(undefined, retryCount);
        }

        // Build ky options
        const kyOptions: any = {
          method,
          headers,
          timeout: timeout as number | false,
          signal,
          throwHttpErrors: true, // Allow HTTP errors to trigger error handling
          retry: 0, // Disable ky's built-in retry - we handle retries manually
          // Convert ky's progress callback to our format
          onUploadProgress: callbacks?.onUploadProgress
            ? (progress, _chunk) => {
                callbacks.onUploadProgress!({
                  loaded: progress.transferredBytes,
                  total: progress.totalBytes,
                  lengthComputable: progress.totalBytes > 0,
                });
              }
            : undefined,
          onTimeout: callbacks?.onTimeout
            ? () => callbacks.onTimeout!(timeout)
            : undefined,
        };

        // Handle withCredentials (ky uses 'credentials' option)
        if (withCredentials) {
          kyOptions.credentials = "include";
        }

        // Handle body
        if (body) {
          kyOptions.body = body;
        }

        let response;
        try {
          // Make the request using ky
          response = await ky(url, kyOptions);
        } catch (error) {
          // Check if this is an HTTP error (has response property)
          if (error instanceof Error && (error as any).response) {
            const errorResponse = (error as any).response;

            // Call shouldRetry hook to match Uppy XHR behavior
            let shouldRetryResult = false;
            if (this.#shouldRetry) {
              shouldRetryResult = this.#shouldRetry(error);
            }

            // Call onAfterResponse with the error response info if provided
            if (this.#onAfterResponse) {
              try {
                await this.#onAfterResponse(
                  {
                    status: errorResponse.status,
                    statusText: errorResponse.statusText,
                  },
                  retryCount,
                );
              } catch (hookError) {
                // Preserve the error from the hook
                if (hookError instanceof Error) {
                  throw hookError;
                }
              }
            }

            // Check if we should retry
            if (
              shouldRetryRequest(
                error,
                method,
                retryCount,
                retryOptions,
                this.#shouldRetry,
              )
            ) {
              const delayMs = getRetryDelay(
                retryCount + 1,
                retryOptions,
                errorResponse,
              );
              await new Promise((resolve) => setTimeout(resolve, delayMs));
              retryCount++;
              lastError = error as Error;
              continue; // Retry the request
            }

            // No retry - attach response info to error and throw it (matching browser XHR behavior)
            // Browser mode rejects with NetworkError for non-2xx responses
            // We attach the response to the error so it can be accessed by processError
            (error as any).request = {
              status: errorResponse.status,
              statusText: errorResponse.statusText,
              response: errorResponse,
            };
            throw error;
          }

          // Handle network errors (no response property)
          // Call shouldRetry hook to match Uppy XHR behavior
          let shouldRetryResult = false;
          if (this.#shouldRetry && error instanceof Error) {
            shouldRetryResult = this.#shouldRetry(error);
          }

          // Call onAfterResponse with error info if provided
          if (this.#onAfterResponse && error instanceof Error) {
            try {
              await this.#onAfterResponse(
                { status: 0, statusText: "Network Error" },
                retryCount,
              );
            } catch (hookError) {
              // Preserve the error from the hook and attach original error details
              if (hookError instanceof Error) {
                (hookError as any).request = {
                  status: 0,
                  statusText: "Network Error",
                };
              }
              throw hookError;
            }
          }

          // Check if we should retry network errors
          if (
            shouldRetryRequest(
              error,
              method,
              retryCount,
              retryOptions,
              this.#shouldRetry,
            )
          ) {
            const delayMs = getRetryDelay(retryCount + 1, retryOptions);
            await new Promise((resolve) => setTimeout(resolve, delayMs));
            retryCount++;
            lastError = error as Error;
            continue; // Retry the request
          }

          // Convert AbortError to DOMException for consistency
          if (error instanceof Error && error.name === "AbortError") {
            throw new DOMException("Aborted", "AbortError");
          }

          throw error;
        }

        // Call onAfterResponse with the response (for both success and HTTP errors)
        if (this.#onAfterResponse) {
          await this.#onAfterResponse(
            { status: response.status, statusText: response.statusText },
            retryCount,
          );
        }

        // Parse response based on content type or explicit responseType
        let responseData: unknown = null;
        let responseJsonType: XMLHttpRequestResponseType = "text";
        const contentType = response.headers.get("content-type");

        // If responseType is explicitly set to 'json', parse as JSON
        if (options.responseType === "json") {
          responseData = await response.json();
          responseJsonType = "json";
        } else if (contentType?.includes(CONTENT_TYPE_JSON)) {
          responseData = await response.json();
          responseJsonType = "json";
        } else {
          responseData = await response.text();
        }

        return {
          status: response.status,
          statusText: response.statusText,
          response: responseData,
          responseText:
            typeof responseData === "string" ? responseData : undefined,
          responseType: responseJsonType,
        };
      } catch (error) {
        // This is a fallback for any unexpected errors
        if (error instanceof Error) {
          throw error;
        }
        throw new Error("Unknown error occurred during request");
      }
    }

    // If we've exhausted all retries, throw the last error
    throw lastError || new Error("Request failed after retries");
  }
}

export const nodeClient = new NodeNetworkClient();
