/**
 * Pure source-selection helpers for the shared player: canonicalizing a typed
 * object key, deciding whether a shared source is actually selected, and
 * deriving a stable display identity for the selected source.
 *
 * Object keys go through the strict `normalizeObjectKeyHex` helper, the
 * single validator, but a malformed key must never break the UI, so the
 * selection layer treats any malformed input as "unselected" instead of
 * throwing. The derived identity is a SHA-256 digest over
 * (sharing-key seed, object key), so key material never surfaces in the
 * display identifier.
 */

import { normalizeObjectKeyHex, normalizeSharingSeedHex, toHex } from "./hex";

/** The selected-source decision plus its display-safe identity. */
export interface SharedSourceSelection {
  /** Canonical 64-hex lowercase object key, or null when not selected. */
  readonly objectKey: null | string;
  /** True only when a canonical object key AND a valid sharing seed are present. */
  readonly selected: boolean;
  /** Stable, display-safe identity for the selected source, or null. */
  readonly sourceId: null | string;
}

/**
 * Canonicalizes a typed/pasted object key through the hex helper. Malformed or
 * absent input is "unselected" (null): the strict helper still rejects, but
 * the selection layer absorbs that for the UI instead of surfacing an error.
 */
export function canonicalizeSelectedObjectKey(
  input: null | string | undefined,
): null | string {
  if (!input) return null;
  try {
    return normalizeObjectKeyHex(input);
  } catch {
    return null;
  }
}

/** Selects a shared source; a malformed key or invalid seed leaves it unselected. */
export async function selectSharedSource(
  sharingSeed: null | string | undefined,
  objectKey: null | string | undefined,
): Promise<SharedSourceSelection> {
  const key = canonicalizeSelectedObjectKey(objectKey);
  if (!key) {
    return { objectKey: null, selected: false, sourceId: null };
  }
  try {
    const seed = normalizeSharingSeedHex(sharingSeed ?? "");
    const sourceId = await sharedSourceIdentity(seed, key);
    return { objectKey: key, selected: true, sourceId };
  } catch {
    return { objectKey: null, selected: false, sourceId: null };
  }
}

/**
 * Stable, display-safe identity for a shared source, derived from the
 * sharing-key seed and the object key. Returns the SHA-256 hex digest of
 * `seed:objectKey`, deterministic given the same inputs, and structured so
 * the seed (key material) never appears in the identifier or anything the UI
 * might display.
 */
export async function sharedSourceIdentity(
  sharingSeed: string,
  objectKey: string,
): Promise<string> {
  const seed = normalizeSharingSeedHex(sharingSeed);
  const key = normalizeObjectKeyHex(objectKey);
  const digest = await globalThis.crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(`${seed}:${key}`),
  );
  return toHex(new Uint8Array(digest));
}
