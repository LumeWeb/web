/**
 * Transport policy for direct SDK ranged reads.
 *
 * One owner for the tunables every `SiaByteSource` read receives: the stall
 * watchdog timeout (callers no longer supply a per-read value) and the explicit
 * `maxBufferedChunks` cap handed to every `Sdk.download` call. The worker
 * composition root builds one
 * policy and threads it through source construction, so a read's behavior can
 * no longer drift between the stall watchdog, the SDK download options, and
 * the concurrency limit.
 */

/**
 * Default stall watchdog timeout in milliseconds. A ranged read that yields
 * no bytes for this long is aborted and reported as a stall, instead of
 * leaving the media element `seeking` forever on a dead transport (e.g. every
 * WebTransport session pending and the browser dropping new ones).
 */
export const DEFAULT_TRANSPORT_STALL_TIMEOUT_MS = 8000;

/**
 * Default explicit `maxBufferedChunks` for every SDK ranged download. The SDK
 * otherwise buffers download chunks without a caller-visible cap; making the
 * bound explicit per policy keeps one stalled or slow-consumed download from
 * accumulating unbounded WASM-side buffer while the downstream remux/append
 * side is the slow party.
 */
export const DEFAULT_MAX_BUFFERED_CHUNKS = 100;

export interface SiaTransportPolicy {
  /** Explicit buffered-chunk cap passed to every `Sdk.download` call. */
  readonly maxBufferedChunks: number;
  /** Stall watchdog timeout in ms applied to every SDK ranged read. */
  readonly stallTimeoutMs: number;
}

/** Builds the effective transport policy: `overrides` over the defaults. */
export function createSiaTransportPolicy(overrides: Partial<SiaTransportPolicy> = {}): SiaTransportPolicy {
  return {
    maxBufferedChunks: overrides.maxBufferedChunks ?? DEFAULT_MAX_BUFFERED_CHUNKS,
    stallTimeoutMs: overrides.stallTimeoutMs ?? DEFAULT_TRANSPORT_STALL_TIMEOUT_MS,
  };
}
