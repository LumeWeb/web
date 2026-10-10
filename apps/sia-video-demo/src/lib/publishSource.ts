/**
 * Pure "publish a shared source" input handling: turns pasted text into a
 * discriminated, UI-ready result. Only a valid Sia share URL is ever accepted
 *, the public `isSiaShareUrl` / `parseSiaShareUrl` helpers do the shaping and
 * full parsing, so this module never re-implements share-URL logic.
 *
 * The valid arm carries the normalized parsed fields the UI needs (object
 * identity, indexer origin, and the `sia://` fetch form the player will
 * consume). The raw encryption-key bytes from `parseSiaShareUrl` are NOT
 * echoed into the UI-facing result: key material stays out of config/state
 * (the worker re-derives it from `fetchForm`), so only the object identity and
 * origin are ever shown.
 */

import { isSiaShareUrl, parseSiaShareUrl } from "@lumeweb/sia-video-source";

/** The disputed input, trimmed, plus a human-readable inline-error reason. */
export interface InvalidPublishSource {
  readonly input: string;
  /** Message a paste box can show next to the controls. */
  readonly reason: string;
  readonly status: "invalid";
}

/**
 * Normalized, UI-safe fields of a parsed share URL. Deliberately excludes the
 * raw 32-byte encryption key: the worker re-derives it from `fetchForm`.
 */
export interface NormalizedSiaShareUrl {
  /** `sia://` fetch form handed to the worker; the only string needed to play. */
  readonly fetchForm: string;
  /** Origin of the indexer that signed the share. */
  readonly indexerUrl: string;
  /** 64-hex lowercase object key, the share's public object identity. */
  readonly objectKey: string;
}

export type PublishSourceResult = InvalidPublishSource | ValidPublishSource;

/** A validated share URL, normalized for the UI. */
export interface ValidPublishSource {
  readonly input: string;
  readonly source: NormalizedSiaShareUrl;
  readonly status: "valid";
}

/**
 * Publishes a pasted Sia share URL. Anything that is not shaped like a share
 * URL is rejected up front; share-shaped input is passed to `parseSiaShareUrl`
 * so a malformed key or bad encryption key surfaces as a descriptive inline
 * reason instead of being accepted.
 */
export function publishSource(input: string): PublishSourceResult {
  const value = input.trim();
  if (!isSiaShareUrl(value)) {
    return {
      input: value,
      reason:
        "Enter a Sia share URL: https://<indexer>/objects/<64-hex-key>/shared#encryption_key=…",
      status: "invalid",
    };
  }
  try {
    const parsed = parseSiaShareUrl(value);
    return {
      input: value,
      source: {
        fetchForm: parsed.fetchForm,
        indexerUrl: parsed.indexerUrl,
        objectKey: parsed.objectKey,
      },
      status: "valid",
    };
  } catch (error) {
    return {
      input: value,
      reason: error instanceof Error ? error.message : String(error),
      status: "invalid",
    };
  }
}
