/** Publish mode passes the active account's on-demand seed supplier to video. */

/** App-key supplier a later SiaVideo compose step consumes on demand. */
export interface PublishAppKeySupplier {
  /** Yields caller-owned bytes when the player needs them. */
  readonly getAppKeySeed: () => Uint8Array;
}

/** Publish arms only the app key; keyless sharing uses a separate route. */
export interface PublishSuppliers {
  readonly appKey: null | PublishAppKeySupplier;
  readonly sharingKey: null;
}

/** Preserves the live supplier rather than caching a seed in player state. */
export function publishSuppliers(input: {
  getAppKeySeed: (() => Uint8Array) | null;
}): PublishSuppliers {
  return {
    appKey: input.getAppKeySeed ? { getAppKeySeed: input.getAppKeySeed } : null,
    sharingKey: null,
  };
}
