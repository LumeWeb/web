/**
 * Publish (source-entry) mode supplier routing. Publish runs on the app key
 * only: it arms the app-key supplier when an app-key session is present and
 * never the sharing key, a sharing-key-only user receives no authenticated
 * supplier values at all (auth is provided on the sharing side).
 *
 * The seed is a callable (`getAppKeySeed`) rather than a stored value, so the
 * plaintext seed never sits in React state, config, or the UI identity layer.
 */

import { fromHex } from "../../lib/hex";

/** App-key supplier a later SiaVideo compose step consumes on demand. */
export interface PublishAppKeySupplier {
  /** Yields the 32-byte app-key seed in byte form when the player needs it. */
  readonly getAppKeySeed: () => Uint8Array;
}

/**
 * The Publish supplier set. `appKey` is non-null only when an app-key session
 * is present; `sharingKey` is structurally always null.
 */
export interface PublishSuppliers {
  /** Armed app-key supplier, or null when no app-key session is present. */
  readonly appKey: null | PublishAppKeySupplier;
  /** Publish deliberately never arms the sharing key; always null. */
  readonly sharingKey: null;
}

/**
 * Routes suppliers for Publish mode from the authenticated store fields.
 * The input takes the app key only: the keyless shared route owns the
 * sharing credential, and Publish must not leak it into its supplier set.
 */
export function publishSuppliers(input: {
  appKeyHex: null | string;
}): PublishSuppliers {
  if (!input.appKeyHex) {
    return { appKey: null, sharingKey: null };
  }
  const seed = fromHex(input.appKeyHex);
  return {
    appKey: { getAppKeySeed: () => Uint8Array.from(seed) },
    sharingKey: null,
  };
}
