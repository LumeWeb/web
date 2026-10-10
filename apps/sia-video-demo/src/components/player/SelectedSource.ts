/**
 * Hoisted selected-source model for the player screen. PlayerScreen owns one
 * explicit, display-safe selected-source union; the mode panels communicate
 * selection changes up through callbacks.
 *
 * The reducer tracks each mode's canonical selection intent (the publish
 * share-URL text, the shared object key); the normalizer lifts that intent
 * plus injected suppliers and the async-derived shared armed source into a
 * single discriminated `SelectedSource`.
 *
 * The union carries public fetch/source data and supplier callbacks only:
 * plaintext seeds never enter the state. The shared armed identity (a
 * SHA-256 digest over seed + object key) is derived asynchronously outside
 * this module and injected through `SelectedSourceDeps`, so this module stays
 * pure and the seed never crosses into it.
 */

import { canonicalizeSelectedObjectKey } from "../../lib/sourceSelection";
import {
  type ArmedPublishSource,
  publishEntryState,
} from "./PublishEntryState";
import {
  type PublishAppKeySupplier,
  type PublishSuppliers,
} from "./PublishSuppliers";
import { type ArmedSharedSource } from "./SharedSourceState";
import {
  type SharedSharingKeySupplier,
  type SharedSuppliers,
} from "./SharedSuppliers";

/** The player screen's routed mode: publish (app-key share URL) or shared. */
export type PlayerMode = "publish" | "shared";

/** Armed, display-safe selected publish source plus its app-key supplier. */
export interface PublishSelectedSource {
  readonly mode: "publish";
  readonly source: ArmedPublishSource;
  /** Callback identity for playback, or null when no app-key session exists. */
  readonly supplier: null | PublishAppKeySupplier;
}

/** Selection intent kept for the publish source-entry box. */
export interface PublishSelectionInput {
  /** Raw share-URL text in the box (kept per mode). */
  readonly input: string;
}

/** The single selected-source union the later player wiring consumes. */
export type SelectedSource = PublishSelectedSource | SharedSelectedSource;

/** Shared-fragment selection updates the selected key without toggle semantics. */
export const SHARED_OBJECT_SELECTED = "shared-object-selected" as const;

/** Action union for the selected-source reducer; all selection-intent changes. */
export type SelectedSourceAction =
  | { readonly input: string; readonly type: "publish-input-changed" }
  | { readonly mode: PlayerMode; readonly type: "mode-changed" }
  | { readonly objectKey: string; readonly type: "shared-object-toggled" }
  | {
      readonly objectKey: string;
      readonly type: typeof SHARED_OBJECT_SELECTED;
    }
  | { readonly type: "cleared" };

/**
 * Inputs the normalizer needs that are routed outside this pure module: the
 * store-derived active mode, both supplier sets, and the async-derived shared
 * armed source. Suppliers and the shared armed source carry callbacks/identity
 * only, never plaintext seeds.
 */
export interface SelectedSourceDeps {
  /** Store-derived active mode; decides which union variant is produced. */
  readonly mode: PlayerMode;
  /** Publish (app-key-only) supplier set, routed by the caller. */
  readonly publishSuppliers: PublishSuppliers;
  /** Async-derived display-safe armed shared source, or null. */
  readonly sharedArmed: ArmedSharedSource | null;
  /** Shared (sharing-key-only) supplier set, routed by the caller. */
  readonly sharedSuppliers: SharedSuppliers;
}

/** Per-mode selection intent owned by the reducer, free of any seed. */
export interface SelectedSourceState {
  readonly publish: PublishSelectionInput;
  readonly shared: SharedSelectionInput;
}

/** Armed, display-safe selected shared source plus its sharing-key supplier. */
export interface SharedSelectedSource {
  readonly mode: "shared";
  readonly source: ArmedSharedSource;
  /** Callback identity for playback, or null when no sharing-key session exists. */
  readonly supplier: null | SharedSharingKeySupplier;
}

/** Selection intent kept for the shared object picker. */
export interface SharedSelectionInput {
  /** Canonical 64-hex selected object key, or null when nothing is selected. */
  readonly objectKey: null | string;
}

/**
 * Initial selection state. `preselectedObjectKey` is the one-shot
 * share-fragment object key; a malformed value degrades to "nothing selected".
 */
export function initialSelectedSourceState(
  preselectedObjectKey?: null | string,
): SelectedSourceState {
  return {
    publish: { input: "" },
    shared: { objectKey: canonicalizeSelectedObjectKey(preselectedObjectKey) },
  };
}

/**
 * Lifts the selection intent (plus the routed mode, suppliers, and derived
 * shared armed source) into the single display-safe `SelectedSource` union,
 * or null when the active mode has no armed source. Shared arms only when a
 * selected key AND an injected armed source are present, so a cleared or
 * stale selection can never quietly re-arm. The result never carries a seed.
 */
export function normalizeSelectedSource(
  state: SelectedSourceState,
  deps: SelectedSourceDeps,
): null | SelectedSource {
  if (deps.mode === "publish") {
    const entry = publishEntryState(state.publish.input);
    if (entry.status !== "armed") return null;
    return {
      mode: "publish",
      source: entry.source,
      supplier: deps.publishSuppliers.appKey,
    };
  }
  if (state.shared.objectKey === null || deps.sharedArmed === null) return null;
  return {
    mode: "shared",
    source: deps.sharedArmed,
    supplier: deps.sharedSuppliers.sharingKey,
  };
}

/**
 * Pure selected-source reducer. Keeps both intents in canonical form; toggling
 * reuses the picker's click semantics (canonicalize, toggle off the matching
 * row, ignore malformed ids). Leaving shared mode clears the shared selection
 * so a stale key can never quietly re-arm; publish text is retained per mode.
 */
export function selectedSourceReducer(
  state: SelectedSourceState,
  action: SelectedSourceAction,
): SelectedSourceState {
  switch (action.type) {
    case "cleared":
      return initialSelectedSourceState();
    case "mode-changed": {
      // Entering publish means no sharing-key session: the shared selection
      // dies with the key that carried it (no-op once it already is cleared).
      if (action.mode === "shared") return state;
      if (state.shared.objectKey === null) return state;
      return { ...state, shared: { objectKey: null } };
    }
    case "publish-input-changed":
      return { ...state, publish: { input: action.input } };
    case "shared-object-toggled": {
      const clicked = canonicalizeSelectedObjectKey(action.objectKey);
      if (!clicked) return state;
      return {
        ...state,
        shared: {
          objectKey: clicked === state.shared.objectKey ? null : clicked,
        },
      };
    }
    case SHARED_OBJECT_SELECTED:
      return {
        ...state,
        shared: { objectKey: canonicalizeSelectedObjectKey(action.objectKey) },
      };
    default:
      return state;
  }
}
