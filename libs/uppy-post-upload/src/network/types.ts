/**
 * Network abstraction types for tree-shakable HTTP clients
 */

export interface NetworkRequestOptions {
  method?: string
  body?: Document | XMLHttpRequestBodyInit | null
  headers?: Record<string, string>
  timeout?: number
  signal?: AbortSignal
  withCredentials?: boolean
  responseType?: XMLHttpRequestResponseType
  retries?: number
  shouldRetry?: (request: unknown) => boolean
  onBeforeRequest?: (request: unknown, retryCount: number) => void | Promise<void>
  onAfterResponse?: (response: unknown, retryCount: number) => void | Promise<void>
  /**
   * Limit the number of concurrent uploads (not retry count)
   */
  limit?: number
}

export interface UploadProgressEvent {
  loaded: number
  total: number
  lengthComputable: boolean
}

export interface NetworkCallbacks {
  onUploadProgress?: (event: UploadProgressEvent) => void
  onTimeout?: (timeout: number) => void
}

export type NetworkClientShouldRetryHook = (request: unknown) => boolean;
export type NetworkClientAfterResponseHook = (response: unknown, retryCount: number) => void | Promise<void>;
export type NetworkClientBeforeRequestHook = (request: unknown, retryCount: number) => void | Promise<void>;

export interface NetworkClientHooks {
  shouldRetry?: NetworkClientShouldRetryHook;
  onAfterResponse?: NetworkClientAfterResponseHook;
  onBeforeRequest?: NetworkClientBeforeRequestHook;
}

export interface NetworkResponse {
  status: number
  statusText: string
  responseText?: string
  response?: unknown
  responseType?: XMLHttpRequestResponseType
  // Original request object for compatibility
  request?: unknown
}

export interface NetworkClient {
  /**
   * Perform an HTTP request with upload progress tracking
   */
  request: (
    url: string,
    options: NetworkRequestOptions,
    callbacks?: NetworkCallbacks,
  ) => Promise<NetworkResponse>

  /**
   * Check if this client is available in the current environment
   */
  isAvailable: () => boolean

  /**
   * Get the driver name for debugging
   */
  getDriverName: () => string

  /**
   * Set hooks for request lifecycle
   */
  setHooks?: (hooks: NetworkClientHooks) => void

  /**
   * Process an error and return a standardized error object
   * This allows each driver to handle error message extraction appropriately
   */
  processError?: (error: unknown) => Error
}

export type NetworkDriver = 'browser' | 'node'
