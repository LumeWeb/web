import type { RequestInit } from "@/types";
import {
  type AccountError,
  handleFetchError,
  handleUnknownError,
} from "@/types";

/**
 * Resolves an endpoint path against the account API base URL. Paths are
 * joined with `new URL(path, apiUrl)`, so an absolute `input` is used as-is.
 */
export function buildApiUrl(path: string, apiUrl: string): string {
  return new URL(path, apiUrl).toString();
}

/**
 * Builds request options for JSON API calls: JSON content type, the JWT
 * bearer header attached when `token` is set, and headers from `init`
 * overriding the defaults. `credentials` is explicit — callers choose
 * `"include"` (session-cookie flows) or `"same-origin"` (token-returned-
 * in-body flows that must not send cookies cross-origin).
 */
export function buildJsonOptions(
  init: RequestInit,
  token: string | undefined,
  credentials: RequestCredentials,
): RequestInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  Object.assign(headers, init.headers);

  return {
    ...init,
    credentials,
    headers,
  };
}

/**
 * Parses a JSON response body with the generated-fetcher semantics: the
 * text is read whole and an empty body parses as `{}`; a non-JSON body
 * throws SyntaxError (no `response.json()` / empty-status special casing).
 */
export async function parseRawJson<T>(response: Response): Promise<T> {
  const text = await response.text();
  return (text ? JSON.parse(text) : {}) as T;
}

/**
 * Parses a JSON response body, mapping a non-JSON body to `null` so the
 * caller can fall back to a non-JSON outcome (e.g. an HTML redirect page).
 * Like {@link parseRawJson}, an empty body parses as `{}`.
 */
export async function parseRawJsonOrNull<T>(response: Response): Promise<null | T> {
  const text = await response.text();
  if (!text) {
    return {} as T;
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

/**
 * Maps anything thrown by a fetch flow to an AccountError: a thrown
 * `Response` goes through the response error mapping, anything else
 * through the unknown-error mapping (both preserve the HTTP status when
 * one is available).
 */
export async function toAccountError(e: unknown): Promise<AccountError> {
  if (e instanceof Response) {
    return handleFetchError(e);
  }
  return handleUnknownError(e);
}
