import { createStore } from "zustand";
import { persist } from "zustand/middleware";
// Value imports stay dynamic so the SDK's WASM module is only fetched from the
// main thread when actually needed; only the erased type bindings stay static.
import type { Builder, Sdk } from "@siafoundation/sia-storage";
import { AuthStatus } from "../components/auth/authFlow";
import { APP_ID, APP_META, DEFAULT_INDEXER_URL } from "../lib/constants";
import { fromHex, normalizeSharingSeedHex, toHex } from "../lib/hex";
import { buildSharingFragment, parseSharingFragment } from "../lib/sharingLink";

/** Plaintext localStorage slot (the app-key seed is deliberately stored in the
 * clear, it is the app's own credential and must survive reloads). */
export const AUTH_STORAGE_KEY = `sia-auth-${APP_ID.slice(0, 8)}`;

export interface AuthActions {
  /** Removes the sharing-key seed (and any validation error + object key). */
  clearSharingKeySeed: () => void;
  logout: () => void;
  reconnect: () => Promise<void>;
  register: (phrase: string) => Promise<void>;
  requestConnection: (indexerUrl: string) => Promise<void>;
  /** Points the demo at a different indexer without starting an SSO request. */
  setIndexerUrl: (indexerUrl: string) => void;
  /** Carries a share link's `object` param to the player as a one-shot pre-selection. */
  setObjectKey: (objectKey: string) => void;
  /**
   * Accepts a sharing-key seed pasted by the user (given OUT-OF-BAND by the
   * key's owner, the demo never creates sharing keys). Validates the input via
   * `normalizeSharingSeedHex` before persisting it; failures surface as an
   * inline `sharingError` on the Gate screen.
   */
  setSharingKeySeed: (hexOrSeedString: string) => void;
  waitForApproval: () => Promise<void>;
}

export interface AuthState extends AuthActions {
  indexerUrl: string;
  /**
   * 64-hex object key carried over from a share link's `object` param. Held
   * only until the player consumes it as its pre-selected source; deliberately
   * NOT persisted (it is part of a share URL, not a credential).
   */
  objectKey: string;
  /** The live connection request, held across the approval/registration screens. */
  request: Builder | null;
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
  status: AuthStatus;
  /** 32-byte app-key seed, hex-encoded. */
  userKeyHex: string;
}

const initialState: Pick<
  AuthState,
  | "indexerUrl"
  | "objectKey"
  | "request"
  | "sharingError"
  | "sharingKeyHex"
  | "status"
  | "userKeyHex"
> = {
  indexerUrl: DEFAULT_INDEXER_URL,
  objectKey: "",
  request: null,
  sharingError: null,
  sharingKeyHex: null,
  status: "disconnected",
  userKeyHex: "",
};

/**
 * Reconnects a registered app-key seed into a main-thread `Sdk`. No SSO or
 * approval is involved: `Builder.connected` tells the indexer the app key
 * (which `register` already registered), exactly like `reconnect` does. The
 * store keeps only hex seeds, never an Sdk instance (an Sdk holds WASM/native
 * resources that must not be serialized into localStorage), so the SDK is
 * rebuilt on demand here.
 */
async function connectAppKeySdk(
  indexerUrl: string,
  userKeyHex: string,
): Promise<Sdk> {
  const {
    AppKey,
    Builder: SdkBuilder,
    initSia,
  } = await import("@siafoundation/sia-storage");
  await initSia();
  const key = new AppKey(fromHex(userKeyHex));
  const builder = new SdkBuilder(indexerUrl, APP_META);
  const sdk = await builder.connected(key);
  builder.free();
  if (!sdk) {
    throw new Error("The Sia app key is not registered with the indexer.");
  }
  return sdk;
}

/** Releases a main-thread SDK; the playback worker builds its own SDK later. */
function disconnectSdk(sdk: null | Sdk | undefined): void {
  if (!sdk) return;
  sdk.free();
}

/** Opens a connection request against the indexer and resolves once it exists. */
async function openRequest(indexerUrl: string): Promise<Builder> {
  const { Builder: SdkBuilder, initSia } =
    await import("@siafoundation/sia-storage");
  await initSia();
  const request = new SdkBuilder(indexerUrl, APP_META);
  await request.requestConnection();
  return request;
}

export const useAuthStore = createStore<AuthState>()(
  persist(
    (set, get) => ({
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

      logout: () => {
        const wasSharingKeySession = get().sharingKeyHex !== null;
        set({ ...initialState });
        if (wasSharingKeySession) {
          // Sharing-key logout: clear the persisted seed + object (the store
          // reset above) AND strip the #sharing_key/#object fragment from the
          // address bar, then let the auth flow re-render the gate on its own
          // NO full-page reload, so there is no white flash / UI flicker.
          // A fragment-free path/query drops the share fragment without
          // firing `hashchange`.
          window.history.replaceState(
            null,
            "",
            `${window.location.pathname}${window.location.search}`,
          );
          return;
        }
        // SSO/app-key logout keeps the historic full reload, which drops the
        // in-memory SDK/worker state cleanly and re-initializes the app.
        window.location.reload();
      },

      reconnect: async () => {
        const { indexerUrl, status, userKeyHex } = get();
        if (!userKeyHex) return;
        // Reconnect is idempotent once the store is in (or heading for) a
        // non-disconnected state: only an explicitly disconnected store may
        // (re)start the SSO-free app-key reconnect.
        if (status !== AuthStatus.Disconnected) return;
        set({ status: AuthStatus.Reconnecting });
        try {
          const sdk = await connectAppKeySdk(indexerUrl, userKeyHex);
          set({ status: AuthStatus.Connected });
          disconnectSdk(sdk);
        } catch {
          // A transient failure ends the in-flight retry but must NOT discard
          // the persisted app-key credential: keep userKeyHex so the user can
          // retry or switch indexers from the gate screen.
          set({ status: AuthStatus.Disconnected });
        }
      },

      register: async (phrase) => {
        const request = get().request;
        if (!request) throw new Error("no connection request in flight");
        const sdk: Sdk = await request.register(phrase);
        const appKey = sdk.appKey();
        const userKeyHex = toHex(appKey.export());
        appKey.free();
        disconnectSdk(sdk);
        request.free();
        set({ request: null, status: "connected", userKeyHex });
      },

      requestConnection: async (indexerUrl) => {
        const request = await openRequest(indexerUrl);
        set({ indexerUrl, request, status: "awaiting-approval" });
      },

      setIndexerUrl: (indexerUrl) => {
        set({ indexerUrl });
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

      waitForApproval: async () => {
        const request = get().request;
        if (!request) return;
        await request.waitForApproval();
        set({ status: "registering" });
      },
    }),
    {
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
        userKeyHex: state.userKeyHex,
      }),
      version: 2,
    },
  ),
);

/**
 * Boot-time ingest of a sharing link's URL fragment, the URL fragment IS the
 * share. Runs once at module load (before React renders, so a fragment-open
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
  const state = useAuthStore.getState();
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
ingestSharingFragment();
