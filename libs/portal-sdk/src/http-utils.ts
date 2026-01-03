import type { RequestInit, Result } from "@/types";
import { AccountError } from "@/types";

/**
 * Creates a promise that resolves after a specified delay
 * @param ms Delay in milliseconds
 * @returns Promise that resolves after the delay
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Options for polling a condition
 */
export interface PollOptions<T> {
  /** Polling interval in milliseconds (default: 2000) */
  interval?: number;
  /** Maximum time to wait in milliseconds (default: 300000 = 5 minutes) */
  timeout?: number;
}

/**
 * Polls a fetch function until a condition is met or timeout occurs
 * @template T The type of data returned by the fetch function
 * @param fetchFn Function that fetches the current state
 * @param shouldStop Predicate function that determines when to stop polling
 * @param options Polling options (interval, timeout)
 * @returns Promise resolving to the final fetch result
 */
export async function poll<T>(
  fetchFn: () => Promise<Result<T>>,
  shouldStop: (value: T) => boolean,
  options: PollOptions<T> = {},
): Promise<Result<T>> {
  const { interval = 2000, timeout = 300000 } = options;
  const startTime = Date.now();
  const timeoutMs = timeout;

  const pollInternal = async (): Promise<Result<T>> => {
    const elapsed = Date.now() - startTime;
    
    if (elapsed >= timeoutMs) {
      return {
        error: new AccountError(`Polling timed out after ${timeout}ms`, 408),
        success: false,
      };
    }

    const result = await fetchFn();

    if (!result.success) {
      return result;
    }

    if (result.data && shouldStop(result.data)) {
      return result;
    }

    // Recalculate elapsed time after fetchFn completes to account for network latency
    const currentElapsed = Date.now() - startTime;
    const remainingTime = timeoutMs - currentElapsed;
    const nextInterval = Math.min(interval, remainingTime);
    await delay(nextInterval);
    return pollInternal();
  };

  return pollInternal();
}

/**
 * Checks if a response has an empty body based on status code or content-length header
 * @param {Response} response - The response to check
 * @returns {boolean} True if the response is empty, false otherwise
 */
export function isEmptyResponse(response: Response): boolean {
  const emptyStatusCodes = [204, 205, 304];
  if (emptyStatusCodes.includes(response.status)) {
    return true;
  }

  const contentLength = response.headers.get("content-length");
  return !!(
    contentLength === "0" ||
    (contentLength && parseInt(contentLength, 10) === 0)
  );
}

/**
 * Safely parses a response body, handling empty responses
 * @param {Response} response - The response to parse
 * @returns {Promise<T>} The parsed data or undefined for empty responses
 */
export async function parseResponse<T>(response: Response): Promise<T> {
  if (isEmptyResponse(response)) {
    return undefined as unknown as T;
  }

  try {
    return await response.json();
  } catch (error) {
    if (isEmptyResponse(response)) {
      return undefined as unknown as T;
    }
    throw error;
  }
}

/**
 * Standardized fetch wrapper with consistent error handling
 * @param {string} url - The URL to fetch
 * @param {RequestInit} init - Fetch options
 * @returns {Promise<{ data: T; status: number; headers: Headers }>}
 */
export async function fetchWithHandling<T>(
  url: string,
  init: RequestInit = {},
): Promise<{ data: T; status: number; headers: Headers }> {
  const response = await fetch(url, init);
  const data = await parseResponse<T>(response);
  return { data, status: response.status, headers: response.headers };
}
