/**
 * Shared (keyless) mode supplier routing. Shared playback runs on the sharing
 * key only: it arms the sharing-key supplier when a sharing-key session is
 * present and never the app key, even an SSO/app-key session routed into
 * shared mode is withheld here. A missing or malformed sharing key arms no
 * supplier at all.
 *
 * The seed is a callable (`getSharingKeySeed`) rather than a stored value, so
 * the plaintext seed never sits in React state, config, or the UI identity
 * layer.
 */

import { fromHex } from "../../lib/hex";

/** Sharing-key supplier a later SiaVideo compose step consumes on demand. */
export interface SharedSharingKeySupplier {
  /** Yields the sharing-key seed in byte form when the player needs it. */
  readonly getSharingKeySeed: () => Uint8Array;
}

/**
 * The Shared supplier set. `sharingKey` is non-null only when a sharing-key
 * session is present; `appKey` is structurally always null.
 */
export interface SharedSuppliers {
  /** Shared never arms the app key; always null, even with an SSO session. */
  readonly appKey: null;
  /** Armed sharing-key supplier, or null when no sharing-key session is present. */
  readonly sharingKey: null | SharedSharingKeySupplier;
}

/**
 * Routes suppliers for Shared mode from the authenticated store fields.
 * The input takes the sharing key only: the shared route authenticates via
 * the sharing key, and must never leak an app-key supplier into its set,
 * even for an SSO user routed into shared mode.
 */
export function sharedSuppliers(input: {
  sharingKeyHex: null | string;
}): SharedSuppliers {
  if (!input.sharingKeyHex) {
    return { appKey: null, sharingKey: null };
  }
  let seed: Uint8Array;
  try {
    seed = fromHex(input.sharingKeyHex);
  } catch {
    // A malformed stored seed is treated as absent, never surfaced as an error.
    return { appKey: null, sharingKey: null };
  }
  return {
    appKey: null,
    sharingKey: { getSharingKeySeed: () => Uint8Array.from(seed) },
  };
}
