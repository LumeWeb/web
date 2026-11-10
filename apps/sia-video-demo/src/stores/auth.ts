/** Keeps sharing credentials and demo settings while access owns account authorization. */
import { createStore } from "zustand";
import { persist } from "zustand/middleware";
import {
  AccessFailure,
  AccessIntent,
  AccessOutcome,
  AccessPhase,
  createSiaAccess,
} from "@lumeweb/sia-app-access";
import type { SiaAccessInteractions } from "@lumeweb/sia-app-access";
import type { AuthSession } from "../lib/storageBackend";
import { createDemoAccessAdapter } from "../lib/accessAdapter";
import { AuthStatus } from "../components/auth/authFlow";
import {
  APP_ID,
  APP_META,
  DEFAULT_INDEXER_URL,
  resolveIndexerUrl,
} from "../lib/constants";
import { fromHex, normalizeSharingSeedHex, toHex } from "../lib/hex";
import { buildSharingFragment, parseSharingFragment } from "../lib/sharingLink";

/** Plaintext localStorage slot (the app-key seed is deliberately stored in the
 * clear, it is the app's own credential and must survive reloads). */
export const AUTH_STORAGE_KEY = `sia-auth-${APP_ID.slice(0, 8)}`;

export interface AuthActions {
  /** Removes the sharing-key seed (and any validation error + object key). */
  clearSharingKeySeed: () => void;
  continueWithoutSaving: () => void;
  generateRecoveryPhrase: () => Promise<string>;
  logout: () => void;
  reconnect: () => Promise<void>;
  register: (phrase: string) => Promise<void>;
  requestConnection: (indexerUrl: string) => Promise<void>;
  retrySave: () => Promise<void>;
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
  /** Account command errors remain visible after the screen that started them closes. */
  accountError: null | string;
  /** The approval URL is presentation data; the access controller owns its request. */
  approvalUrl: null | string;
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
  /** A failed credential write can be retried without registering again. */
  saveError: null | string;
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
  | "accountError"
  | "approvalUrl"
  | "indexerUrl"
  | "objectKey"
  | "reconnectError"
  | "savedUserKeyHex"
  | "saveError"
  | "sharingError"
  | "sharingKeyHex"
  | "status"
  | "userKeyHex"
> = {
  accountError: null,
  approvalUrl: null,
  indexerUrl: DEFAULT_INDEXER_URL,
  objectKey: "",
  reconnectError: null,
  savedUserKeyHex: "",
  saveError: null,
  sharingError: null,
  sharingKeyHex: null,
  status: "disconnected",
  userKeyHex: "",
};

type DemoAccess = SiaAccessInteractions<AuthSession>;
let access: DemoAccess | null = null;
let pendingAuthorization: null | ReturnType<DemoAccess["authorize"]> = null;

/** Playback builds a separate worker SDK; account access owns only main-thread handles. */
function accountAccess(indexerUrl: string): DemoAccess {
  const url = resolveIndexerUrl(indexerUrl);
  if (access?.getSnapshot().scope.indexerUrl === new URL(url).href)
    return access;
  access?.dispose();
  const next = createSiaAccess<AuthSession>({
    adapter: createDemoAccessAdapter(),
    application: APP_META,
    // Keep the demo's one saved key when a user switches indexers to retry reconnect.
    credentials: {
      read() {
        const key = useAuthStore.getState().savedUserKeyHex;
        return Promise.resolve(key ? fromHex(key) : null);
      },
      remove() {
        useAuthStore.setState({ savedUserKeyHex: "", userKeyHex: "" });
        return Promise.resolve();
      },
      write(_scope, bytes) {
        const previous = useAuthStore.getState().savedUserKeyHex;
        try {
          useAuthStore.setState({
            savedUserKeyHex: toHex(bytes),
            userKeyHex: toHex(bytes),
          });
        } catch (error) {
          // Zustand publishes state before localStorage rejects the write.
          // A later state update must not persist a key whose save failed.
          try {
            useAuthStore.setState({ savedUserKeyHex: previous });
          } catch {
            // The in-memory rollback still runs before persistence rejects again.
          }
          throw error;
        }
        return Promise.resolve();
      },
    },
    indexerUrl: url,
  });
  access = next;
  next.subscribe(() => {
    if (access !== next) return;
    const state = next.getSnapshot().state;
    switch (state.phase) {
      case AccessPhase.AwaitingApproval:
        useAuthStore.setState({
          approvalUrl: state.approvalUrl,
          status: AuthStatus.AwaitingApproval,
        });
        break;
      case AccessPhase.Failed:
        if (state.failure === AccessFailure.CredentialsWrite) {
          useAuthStore.setState({
            saveError: "Could not save your account key. Try saving again.",
            status: AuthStatus.Registering,
          });
        }
        break;
      case AccessPhase.Ready:
        useAuthStore.setState({
          accountError: null,
          approvalUrl: null,
          reconnectError: null,
          saveError: null,
          status: AuthStatus.Connected,
        });
        break;
    }
  });
  return next;
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

      continueWithoutSaving: () => {
        if (access?.continueWithoutSaving().kind !== AccessOutcome.Ready)
          throw new Error("Account is not ready to continue.");
      },

      generateRecoveryPhrase: async () => {
        const result = await (
          access ?? accountAccess(get().indexerUrl)
        ).generateRecoveryPhrase();
        if (result.kind === AccessOutcome.Generated) return result.phrase;
        throw new Error("Could not generate a recovery phrase.");
      },

      logout: () => {
        const wasSharingKeySession = get().sharingKeyHex !== null;
        access?.dispose();
        access = null;
        pendingAuthorization = null;
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
        const { indexerUrl, savedUserKeyHex, status } = get();
        if (!savedUserKeyHex) return;
        // Reconnect is idempotent once the store is in (or heading for) a
        // non-disconnected state: only an explicitly disconnected store may
        // (re)start the SSO-free app-key reconnect.
        if (status !== AuthStatus.Disconnected) return;
        set({
          accountError: null,
          reconnectError: null,
          status: AuthStatus.Reconnecting,
        });
        let controller: DemoAccess | null = null;
        try {
          controller = accountAccess(indexerUrl);
          const result = await controller.reconnect();
          if (access !== controller) return;
          if (result.kind === AccessOutcome.Ready) return;
          if (result.kind === AccessOutcome.Cancelled) return;
          throw new Error("Account reconnect failed");
        } catch {
          if (controller && access !== controller) return;
          // A transient failure ends the in-flight retry but must NOT discard
          // the persisted app-key credential: keep savedUserKeyHex so the user
          // can retry or switch indexers from the entry screen.
          set({
            reconnectError:
              "Could not reconnect your account. Retry or choose another indexer.",
            status: AuthStatus.Disconnected,
          });
        }
      },

      register: async (phrase) => {
        if (!access) throw new Error("No approved connection");
        const controller = access;
        const result = await controller.submitRecoveryPhrase(phrase);
        if (access !== controller || result.kind === AccessOutcome.Ready)
          return;
        if (result.kind === AccessOutcome.InvalidPhrase)
          throw new Error("Enter a valid recovery phrase.");
        if (result.kind === AccessOutcome.PhraseMismatch)
          throw new Error("Recovery phrase does not match this account.");
        if (
          result.kind === AccessOutcome.Failed &&
          result.failure === AccessFailure.CredentialsWrite
        )
          throw new Error("Could not save your account key. Try saving again.");
        const message =
          result.kind === AccessOutcome.Failed &&
          result.failure === AccessFailure.PhraseCheck
            ? "Could not check the recovery phrase. Start again."
            : "Could not register the account. Start again.";
        set({
          accountError: message,
          approvalUrl: null,
          status: AuthStatus.Disconnected,
        });
        throw new Error(message);
      },

      requestConnection: async (indexerUrl) => {
        const controller = accountAccess(indexerUrl);
        if (!controller.getSnapshot().presentation.availability.authorize)
          throw new Error("Account connection is unavailable.");
        set({
          accountError: null,
          indexerUrl,
          reconnectError: null,
          saveError: null,
          status: AuthStatus.Reconnecting,
        });
        const started = new Promise<void>((resolve, reject) => {
          const unsubscribe = controller.subscribe(() => {
            const phase = controller.getSnapshot().state.phase;
            if (phase === AccessPhase.AwaitingApproval) {
              unsubscribe();
              resolve();
            } else if (phase === AccessPhase.Failed) {
              unsubscribe();
              set({
                accountError: "Could not connect to the indexer. Try again.",
                status: AuthStatus.Disconnected,
              });
              reject(new Error("Could not connect to the indexer."));
            } else if (
              phase === AccessPhase.Disposed ||
              phase === AccessPhase.Disconnected
            ) {
              unsubscribe();
              reject(new Error("Connection cancelled."));
            }
          });
        });
        pendingAuthorization = controller.authorize(AccessIntent.Create);
        await started;
      },

      retrySave: async () => {
        if (!access) return;
        const result = await access.retrySave();
        if (result.kind !== AccessOutcome.Ready)
          throw new Error("Could not save your account key.");
      },

      setIndexerUrl: (indexerUrl) => {
        access?.dispose();
        access = null;
        pendingAuthorization = null;
        set({
          accountError: null,
          approvalUrl: null,
          indexerUrl,
          reconnectError: null,
          saveError: null,
          status: AuthStatus.Disconnected,
        });
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
        if (!pendingAuthorization) return;
        const result = await pendingAuthorization;
        if (result.kind === AccessOutcome.Approved && access)
          set({ status: AuthStatus.Registering });
        else if (result.kind === AccessOutcome.Failed)
          throw new Error("Connection approval failed.");
      },
    }),
    {
      // The confirmed key uses the existing userKeyHex storage slot, so it
      // needs restoring even when the stored version needs no migration.
      merge: (persisted, current) => {
        const state = (persisted ?? {}) as Partial<AuthState>;
        return {
          ...current,
          ...state,
          savedUserKeyHex: state.userKeyHex ?? "",
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
          savedUserKeyHex: state.userKeyHex ?? "",
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
