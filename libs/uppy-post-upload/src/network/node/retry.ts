/**
 * Retry logic based on ky's retry system
 *
 * Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (https://sindresorhus.com)
 * ky: https://github.com/sindresorhus/ky (MIT licensed)
 *
 * This module implements retry logic matching Uppy XHR fetcher behavior while using
 * ky's sophisticated retry logic, including:
 * - Exponential backoff with optional jitter
 * - Retry-After header parsing (HTTP-date and numeric formats)
 * - Configurable retry limits, methods, and status codes
 * - Custom shouldRetry hook integration
 */

// ky's default retry options (extracted from normalizeRetryOptions)
export const DEFAULT_RETRY_OPTIONS = {
  limit: 2,
  methods: ['get', 'put', 'head', 'delete', 'options', 'trace'] as const,
  statusCodes: [408, 413, 429, 500, 502, 503, 504] as const,
  afterStatusCodes: [413, 429, 503] as const,
  maxRetryAfter: Number.POSITIVE_INFINITY,
  backoffLimit: Number.POSITIVE_INFINITY,
  delay: (attemptCount: number) => 0.3 * (2 ** (attemptCount - 1)) * 1000,
  jitter: undefined,
  retryOnTimeout: false,
} as const;

export interface RetryOptions {
  limit?: number;
  methods?: readonly (typeof DEFAULT_RETRY_OPTIONS.methods)[number][];
  statusCodes?: readonly (typeof DEFAULT_RETRY_OPTIONS.statusCodes)[number][];
  afterStatusCodes?: readonly (typeof DEFAULT_RETRY_OPTIONS.afterStatusCodes)[number][];
  maxRetryAfter?: number;
  backoffLimit?: number;
  delay?: (attemptCount: number) => number;
  jitter?: boolean | ((delay: number) => number);
  retryOnTimeout?: boolean;
}

/**
 * ky's delay calculation with jitter and backoff limit
 */
export function calculateRetryDelay(attemptCount: number, retryOptions: RetryOptions): number {
  const delayFn = retryOptions.delay ?? DEFAULT_RETRY_OPTIONS.delay;
  const retryDelay = delayFn(attemptCount);
  let jitteredDelay = retryDelay;

  if (retryOptions.jitter === true) {
    jitteredDelay = Math.random() * retryDelay;
  } else if (typeof retryOptions.jitter === 'function') {
    jitteredDelay = retryOptions.jitter(retryDelay);
    if (!Number.isFinite(jitteredDelay) || jitteredDelay < 0) {
      jitteredDelay = retryDelay;
    }
  }

  const backoffLimit = retryOptions.backoffLimit ?? Number.POSITIVE_INFINITY;
  return Math.min(backoffLimit, jitteredDelay);
}

/**
 * Calculate retry delay including Retry-After header handling
 * Matches ky's logic for parsing Retry-After headers
 */
export function getRetryDelay(
  attemptCount: number,
  retryOptions: RetryOptions,
  response?: Response,
): number {
  let delayMs = calculateRetryDelay(attemptCount, retryOptions);

  // Check for Retry-After header if we have a response
  if (response) {
    const retryAfter = response.headers.get('Retry-After')
      ?? response.headers.get('RateLimit-Reset')
      ?? response.headers.get('X-RateLimit-Retry-After')
      ?? response.headers.get('X-RateLimit-Reset')
      ?? response.headers.get('X-Rate-Limit-Reset');

    const afterStatusCodes = retryOptions.afterStatusCodes ?? DEFAULT_RETRY_OPTIONS.afterStatusCodes;
    if (retryAfter && afterStatusCodes.includes(response.status as 413 | 429 | 503)) {
      let after = Number(retryAfter) * 1000;
      if (Number.isNaN(after)) {
        // Try parsing as HTTP-date
        after = Date.parse(retryAfter) - Date.now();
      } else if (after >= Date.parse('2024-01-01')) {
        // A large number is treated as a timestamp (fixed threshold protects against clock skew)
        after -= Date.now();
      }
      const max = retryOptions.maxRetryAfter ?? after;
      // Don't apply jitter when server provides explicit retry timing
      delayMs = after < max ? after : max;
    }
  }

  return delayMs;
}

/**
 * Check if an error is a timeout error
 * Matches ky's isTimeoutError utility
 */
function isTimeoutError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.name === 'TimeoutError' ||
     error.name === 'AbortError' ||
     error.message.includes('timeout') ||
     error.message.includes('timed out'))
  );
}

/**
 * Check if an error is an HTTP error (has response property)
 * Matches ky's isHTTPError utility
 */
function isHTTPError(error: unknown): error is Error & { response: Response } {
  return error instanceof Error && 'response' in error && (error as any).response instanceof Response;
}

/**
 * Determine if a request should be retried based on the error and retry options
 * Matches ky's retry logic integrated with Uppy's shouldRetry hook
 */
export function shouldRetryRequest(
  error: unknown,
  method: string,
  retryCount: number,
  retryOptions: RetryOptions,
  userShouldRetry?: (error: unknown) => boolean,
): boolean {
  // Check if we've exceeded the retry limit
  const limit = retryOptions.limit ?? DEFAULT_RETRY_OPTIONS.limit;
  if (retryCount >= limit) {
    return false;
  }

  // Call user's shouldRetry hook first (like Uppy XHR)
  const userShouldRetryResult = userShouldRetry ? userShouldRetry(error) : true;

  // Handle timeout errors (ky's retryOnTimeout option)
  const retryOnTimeout = retryOptions.retryOnTimeout ?? DEFAULT_RETRY_OPTIONS.retryOnTimeout;
  if (isTimeoutError(error) && !retryOnTimeout) {
    return false;
  }

  // Check if this is an HTTP error (has response property)
  if (isHTTPError(error)) {
    const errorResponse = error.response;

    // ky's retry logic: check method and status code
    const methodLower = method.toLowerCase() as 'get' | 'put' | 'head' | 'delete' | 'options' | 'trace';
    const isRetriableMethod = retryOptions.methods?.includes(methodLower) ?? DEFAULT_RETRY_OPTIONS.methods.includes(methodLower);
    const isRetriableStatus = retryOptions.statusCodes?.includes(errorResponse.status as 408 | 413 | 429 | 500 | 502 | 503 | 504) ?? DEFAULT_RETRY_OPTIONS.statusCodes.includes(errorResponse.status as 408 | 413 | 429 | 500 | 502 | 503 | 504);

    // ky special case: 413 (Payload Too Large) is never retried
    if (errorResponse.status === 413) {
      return false;
    }

    return isRetriableMethod && isRetriableStatus && userShouldRetryResult;
  }

  // For network errors (no response), only check user's shouldRetry
  return userShouldRetryResult;
}
