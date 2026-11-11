/** Persists the demo's settings and sharing credentials, never a live account snapshot. */
import { createStore } from "zustand";
import { persist } from "zustand/middleware";
import { APP_ID, DEFAULT_INDEXER_URL } from "../lib/constants";
import { normalizeSharingSeedHex } from "../lib/hex";
import { buildSharingFragment, parseSharingFragment } from "../lib/sharingLink";

/** Plaintext localStorage slot (the app-key seed is deliberately stored in the
 * clear, it is the app's own credential and must survive reloads). */
export const AUTH_STORAGE_KEY = `sia-auth-${APP_ID.slice(0, 8)}`;

export interface DemoSettingsActions {
  /** Removes the sharing-key seed (and any validation error + object key). */
  clearSharingKeySeed: () => void;
  /** Carries a share link's `object` param to the player as a one-shot pre-selection. */
  setObjectKey: (objectKey: string) => void;
  /** Validates the out-of-band sharing seed before persisting it. */
  setSharingKeySeed: (hexOrSeedString: string) => void;
}

export interface DemoSettingsState extends DemoSettingsActions {
  /** Account command errors remain visible after the screen that started them closes. */
  accountError: null | string;
  /** User confirmation keeps the approval screen open after access records approval. */
  approvalContinueRequired: boolean;
  indexerUrl: string;
  /**
   * 64-hex object key carried over from a share link's `object` param. Held
   * only until the player consumes it as its pre-selected source; deliberately
   * NOT persisted (it is part of a share URL, not a credential).
   */
  objectKey: string;
  /** A failed automatic reconnect waits for a user action instead of rearming the effect. */
  reconnectError: null | string;
  /** Only this confirmed key is written to the persisted userKeyHex field. */
  savedUserKeyHex: string;
  /**
   * Last sharing-key paste validation failure, as a message the UI can show
   * next to the controls. Deliberately NOT persisted (transient UI state).
   */
  sharingError: null | string;
  /**
   * 32-byte sharing-key seed, hex-encoded; null when none is pasted. Sharing
   * keys are NEVER created by the app, they are given OUT-OF-BAND by the key
   * owner and are READ-ONLY credentials, so this is persisted exactly as
   * pasted and handed to the player verbatim.
   */
  sharingKeyHex: null | string;
}

export const initialState: Pick<
  DemoSettingsState,
  | "accountError"
  | "approvalContinueRequired"
  | "indexerUrl"
  | "objectKey"
  | "reconnectError"
  | "savedUserKeyHex"
  | "sharingError"
  | "sharingKeyHex"
> = {
  accountError: null,
  approvalContinueRequired: false,
  indexerUrl: DEFAULT_INDEXER_URL,
  objectKey: "",
  reconnectError: null,
  savedUserKeyHex: "",
  sharingError: null,
  sharingKeyHex: null,
};

export const demoSettingsStore = createStore<DemoSettingsState>()(
  persist(
    (set) => ({
      ...initialState,

      clearSharingKeySeed: () => {
        // The object pre-selection dies with the seed that carried it, so a
        // later share opened by hand cannot quietly re-arm a stale key.
        set({ objectKey: "", sharingError: null, sharingKeyHex: null });
        window.history.replaceState(
          null,
          "",
          `${window.location.pathname}${window.location.search}`,
        );
      },

      setObjectKey: (objectKey) => {
        set({ objectKey });
      },

      setSharingKeySeed: (hexOrSeedString) => {
        try {
          const hex = normalizeSharingSeedHex(hexOrSeedString);
          set({ sharingError: null, sharingKeyHex: hex });
        } catch (error) {
          const message =
            error instanceof Error ? error.message : String(error);
          set({ sharingError: message });
        }
      },
    }),
    {
      // The confirmed key uses the existing userKeyHex storage slot, so it
      // needs restoring even when the stored version needs no migration.
      merge: (persisted, current) => {
        const state = (persisted ?? {}) as {
          indexerUrl?: string;
          sharingKeyHex?: null | string;
          userKeyHex?: string;
        };
        return {
          ...current,
          indexerUrl: state.indexerUrl ?? current.indexerUrl,
          savedUserKeyHex: state.userKeyHex ?? "",
          sharingKeyHex: state.sharingKeyHex ?? null,
        };
      },
      // `sharingKeyHex` replaces the earlier `sharingKeySeed` field: the value
      // is identical (a hex-encoded sharing-key seed), so a stored payload is
      // carried over by renaming rather than dropped.
      migrate: (persisted) => {
        const state = (persisted ?? {}) as {
          indexerUrl?: string;
          sharingKeyHex?: null | string;
          sharingKeySeed?: unknown;
          userKeyHex?: string;
        };
        if (typeof state.sharingKeySeed === "string") {
          state.sharingKeyHex = state.sharingKeySeed;
        }
        return {
          indexerUrl: state.indexerUrl ?? "",
          sharingKeyHex: state.sharingKeyHex ?? null,
          userKeyHex: state.userKeyHex ?? "",
        };
      },
      name: AUTH_STORAGE_KEY,
      partialize: (state) => ({
        indexerUrl: state.indexerUrl,
        sharingKeyHex: state.sharingKeyHex,
        userKeyHex: state.savedUserKeyHex,
      }),
      version: 3,
    },
  ),
);

/**
 * Boot-time ingest of a sharing link's URL fragment, the URL fragment IS the
 * share. Runs at browser module load (before React renders, so a fragment-open
 * lands straight in the keyless shared player with no gate flash) and again on
 * every `hashchange` (wired in `App`), so a sharing key pasted into the
 * address bar mid-session starts a fresh keyless session.
 *
 * `#sharing_key=<64-hex seed>[&object=<64-hex object key>]`. A valid seed is
 * applied exactly like a manual paste, `setSharingKeySeed` validates,
 * persists to localStorage, and the optional `object` key is stashed
 * (transient) for the player to pre-select + arm on mount. The fragment is
 * then sealed into its canonical form (lowercase seed, normalized shape) with
 * `replaceState` (never `pushState`, so the browser Back button is untouched).
 */
export function ingestSharingFragment(): void {
  const { objectKey, seed } = parseSharingFragment(window.location.hash);
  const state = demoSettingsStore.getState();
  if (seed) {
    if (seed !== state.sharingKeyHex) {
      state.setSharingKeySeed(seed);
    }
    const canonical = buildSharingFragment(seed, objectKey ?? undefined);
    if (window.location.hash !== canonical) {
      window.history.replaceState(null, "", canonical);
    }
  }
  if (objectKey && objectKey !== state.objectKey) {
    state.setObjectKey(objectKey);
  }
}

// Apply a share fragment found in the initial URL the moment the store exists,
// so the first render of `AuthFlow` already sees `sharingKeyHex` populated and
// routes straight to the keyless shared player.
if (typeof window !== "undefined") ingestSharingFragment();
