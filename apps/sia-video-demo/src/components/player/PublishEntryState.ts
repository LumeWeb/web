/**
 * Pure source-entry state for the Publish screen. A pasted value is lifted
 * into a discriminated idle / invalid / armed state via `publishSource` (the
 * single source of share-URL parsing) so the UI only renders one determinate
 * stage at a time. The armed state is the selected-source model a later
 * SiaVideo compose step consumes; it carries the public object identity,
 * indexer origin, and the `sia://` fetch form, never a separate
 * encryption-key field (key material stays out of UI state and source IDs).
 */

import {
  type NormalizedSiaShareUrl,
  publishSource,
  type PublishSourceResult,
} from "../../lib/publishSource";

/** The armed, selected source, identity, origin, and the play string. */
export interface ArmedPublishSource {
  /** `sia://` fetch form handed to the later player (the only string needed to play). */
  readonly fetchForm: string;
  /** Origin of the indexer that signed the share. */
  readonly indexerUrl: string;
  /** 64-hex lowercase public object identity, display-safe. */
  readonly objectKey: string;
}

/**
 * Determinate UI state for the source entry box: idle until the user types,
 * invalid with an inline reason while the value fails validation, armed as
 * soon as a valid share URL is present.
 */
export type PublishEntryState =
  | {
      readonly input: string;
      readonly reason: string;
      readonly status: "invalid";
    }
  | {
      readonly input: string;
      readonly source: ArmedPublishSource;
      readonly status: "armed";
    }
  | { readonly input: string; readonly status: "idle" };

/** Lifts the pasted text into a single determinate state (see module doc). */
export function publishEntryState(input: string): PublishEntryState {
  if (input.trim() === "") {
    return { input, status: "idle" };
  }
  const result: PublishSourceResult = publishSource(input);
  if (result.status === "invalid") {
    return { input, reason: result.reason, status: "invalid" };
  }
  return {
    input,
    source: toArmedPublishSource(result.source),
    status: "armed",
  };
}

function toArmedPublishSource(
  source: NormalizedSiaShareUrl,
): ArmedPublishSource {
  return {
    fetchForm: source.fetchForm,
    indexerUrl: source.indexerUrl,
    objectKey: source.objectKey,
  };
}
