import type { RequestInit } from "./types.js";

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
