/**
 * URL validation helpers for mempool endpoints.
 *
 * Enforces origin allowlisting to prevent SSRF attacks on both
 * REST and WebSocket connections to mempool servers.
 *
 * @module @lumeweb/lbry-sdk/mempool/url-validation
 */

/** Allowed REST origins for mempool API requests. */
const ALLOWED_MEMPOOL_ORIGINS = new Set([
  "https://mempool.lbry.org",
  "http://localhost:8999", // local dev electrs/mempool
]);

/** Allowed WebSocket origins for mempool WS connections. */
const ALLOWED_WS_ORIGINS = new Set([
  "wss://mempool.lbry.org",
  "ws://localhost:8999", // local dev
]);

/**
 * Check if a URL has an allowed HTTP(S) origin for mempool REST API requests.
 *
 * @param url - The URL to validate
 * @returns `true` if the origin is allowed
 */
export function isAllowedMempoolOrigin(url: string): boolean {
  try {
    const origin = new URL(url).origin;
    return ALLOWED_MEMPOOL_ORIGINS.has(origin);
  } catch {
    return false;
  }
}

/**
 * Check if a WebSocket URL has an allowed origin for mempool connections.
 *
 * @param url - The WebSocket URL to validate
 * @returns `true` if the origin is allowed
 */
export function isAllowedWsOrigin(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ALLOWED_WS_ORIGINS.has(`${parsed.protocol}//${parsed.host}`);
  } catch {
    return false;
  }
}

/**
 * Assert that a URL has a trusted origin. Throws on mismatch.
 *
 * @param url - The URL to validate
 * @param mode - Whether to check REST or WebSocket origins
 * @throws {Error} If the URL's origin is not in the allowlist
 */
export function assertTrustedUrl(url: string, mode: "rest" | "ws"): void {
  const allowed = mode === "rest"
    ? isAllowedMempoolOrigin(url)
    : isAllowedWsOrigin(url);
  if (!allowed) {
    throw new Error(`Refusing to use untrusted ${mode === "rest" ? "base URL" : "WebSocket URL"}: ${url}`);
  }
}
