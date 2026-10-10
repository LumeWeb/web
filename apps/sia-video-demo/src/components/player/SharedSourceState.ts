/**
 * Pure shared-source state: sharing-key presence plus a selected canonical
 * object key yields a determinate armed / unarmed model whose armed source
 * carries a display-safe identity. Identity derivation is delegated to
 * `selectSharedSource` (a SHA-256 digest over seed + object key), so key
 * material never surfaces in source IDs and the seed itself never enters this
 * state model. A missing or malformed key is unarmed, never an error.
 */

import { selectSharedSource } from "../../lib/sourceSelection";

/** Armed shared source, public identity only, never a seed. */
export interface ArmedSharedSource {
  /** Canonical 64-hex lowercase object key. */
  readonly objectKey: string;
  /** Display-safe SHA-256 digest over (seed, key); never the seed itself. */
  readonly sourceId: string;
}

export type SharedSourceState =
  | {
      /** Why the source is not armed, as a message the UI can show. */
      readonly reason: string;
      readonly source: null;
      readonly status: "unarmed";
    }
  | {
      readonly source: ArmedSharedSource;
      readonly status: "armed";
    };

/**
 * Derives the shared-source state from the sharing-key field and the selected
 * object key. Only a valid sharing key AND a canonical 64-hex object key arm
 * the source; anything missing or malformed is unarmed.
 */
export async function sharedSourceState(
  sharingKeyHex: null | string | undefined,
  objectKeyInput: null | string | undefined,
): Promise<SharedSourceState> {
  const selection = await selectSharedSource(sharingKeyHex, objectKeyInput);
  if (!selection.selected || !selection.objectKey || !selection.sourceId) {
    return {
      reason: "A valid sharing key and a 64-hex object key are required.",
      source: null,
      status: "unarmed",
    };
  }
  return {
    source: { objectKey: selection.objectKey, sourceId: selection.sourceId },
    status: "armed",
  };
}
