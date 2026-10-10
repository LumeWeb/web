import type { AppMetadata } from "@siafoundation/sia-storage";

/** Stable public string used to derive the app identifier. */
export const APP_ID_SOURCE = "@lumeweb/sia-video-demo";

/** SHA-256 of APP_ID_SOURCE, used as the indexer app identifier. */
export const APP_ID =
  "7d3dfceb7e23542db55711d5e652494653394a0b8b4d9cce53452bf961aa4a9b";

export const APP_NAME = "Sia Video Demo";

export const APP_DESCRIPTION =
  "Plays Sia shared-link sources through @lumeweb/sia-video-source.";

export const DEFAULT_INDEXER_URL = "https://sia.storage";

/**
 * The single advanced indexer setting, shared by the share and account entry
 * flows: a stored value (trimmed) wins, an empty/blank one falls back to the
 * default. Both entry panels resolve through this one helper so there is
 * exactly one indexer control and one effective value.
 */
export function resolveIndexerUrl(stored: string): string {
  const trimmed = stored.trim();
  return trimmed === "" ? DEFAULT_INDEXER_URL : trimmed;
}

// Computed defensively so the constants module stays importable in a Node test
// environment where `window` does not exist (the SDK is only touched at
// runtime, not at import time).
const serviceUrl =
  typeof window === "undefined" || !window.location?.origin
    ? "http://localhost"
    : window.location.origin;

export const APP_META: AppMetadata = {
  appId: APP_ID,
  callbackUrl: undefined,
  description: APP_DESCRIPTION,
  logoUrl: undefined,
  name: APP_NAME,
  serviceUrl,
};
