/**
 * Shared internal helpers for the worker-side session composition and the
 * media load pipeline: byte seed equality, HELLO worker-config equality, and
 * the one-line error description. `session-coordinator.ts`,
 * `sia-composition.ts`, and `media/library-load.ts` all use these, so the
 * semantics live in exactly one place.
 *
 * The module is Sia-free: it imports no SDK surface (only the protocol's
 * `WorkerConfig` wire type, as a type) and no MSE, so it runs against
 * injected fakes in every environment. It is internal — not part of the
 * package's public exports.
 */

import type { WorkerConfig } from './protocol.ts';

/** Byte equality over two decapsulated seeds (or nulls); scrubbed buffers read as "changed". */
export function appKeySeedsEqual(a: null | Uint8Array, b: null | Uint8Array): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  if (a.byteLength !== b.byteLength) return false;
  for (let i = 0; i < a.byteLength; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

/** One-line diagnostic for an unknown thrown value: `Error` messages, `String()` otherwise. */
export function describeError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/**
 * True when two HELLO worker configs describe the same connection. App
 * metadata is descriptive only (not part of SDK auth), so identity is the
 * indexer endpoint.
 */
export function workerConfigsEqual(a: undefined | WorkerConfig, b: undefined | WorkerConfig): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return a.indexerUrl === b.indexerUrl;
}
