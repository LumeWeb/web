/**
 * Sharing-link fragment utilities, the URL fragment IS the share. A
 * shareable URL looks like:
 *
 *   /#sharing_key=<64-hex sharing-key seed>[&object=<64-hex object key>]
 *
 * The demo reads the fragment on load (and on every `hashchange`), applies the
 * seed (same as pasting it), and pre-selects the optional `object` key. The
 * paste box additionally accepts a FULL sharing URL / link and extracts the
 * seed out of it, so either form lands in one normalized hex seed.
 */

const SHARING_KEY_PARAM = "sharing_key";
const OBJECT_PARAM = "object";
const HEX64 = /^[0-9a-fA-F]{64}$/;

export interface SharingFragment {
  /** Optional 64-hex object key to pre-select; null when absent or malformed. */
  objectKey: null | string;
  /** 64-hex sharing-key seed, lowercase; null when the fragment has none. */
  seed: null | string;
}

/** Canonical fragment for the current share: `#sharing_key=<seed>[&object=<key>]`. */
export function buildSharingFragment(
  seed: string,
  objectKey?: null | string,
): string {
  const params = new URLSearchParams();
  params.set(SHARING_KEY_PARAM, seed);
  if (objectKey) params.set(OBJECT_PARAM, objectKey);
  return `#${params.toString()}`;
}

/**
 * Accepts either a raw sharing-key seed (even-length hex, judged by the store)
 * or a full sharing link/URL. When the text carries a `sharing_key=<hex>`
 * parameter, as a fragment, query, or bare `?`/`&`, the seed is pulled out;
 * otherwise the raw text is returned verbatim for the store's hex validator to
 * judge.
 */
export function extractSharingSeed(input: string): string {
  const value = input.trim();
  const match = /(?:[#?&])sharing_key=([0-9a-fA-F]+)/.exec(value);
  return match ? match[1] : value;
}

/**
 * Parses `location.hash` (pass the raw hash, `"#…"` included) with
 * URLSearchParams. `sharing_key` is only accepted as a strict 64-hex seed;
 * anything else is ignored rather than passed on to the store, so a malformed
 * fragment can never arm the player by accident.
 */
export function parseSharingFragment(hash: string): SharingFragment {
  const params = new URLSearchParams(hash.replace(/^#/, ""));
  const rawSeed = params.get(SHARING_KEY_PARAM);
  const rawObject = params.get(OBJECT_PARAM);
  const objectKey =
    rawObject && HEX64.test(rawObject) ? rawObject.toLowerCase() : null;
  const seed = rawSeed && HEX64.test(rawSeed) ? rawSeed.toLowerCase() : null;
  return { objectKey, seed };
}
