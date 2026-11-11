/** Owns the demo's account controller and translates account commands for screens. */
import { useSyncExternalStore } from "react";
import {
  AccessFailure,
  AccessIntent,
  type AccessInteractionSnapshot,
  AccessOutcome,
  AccessPhase,
  SessionUnavailableError,
  type SiaAccessInteractions,
} from "@lumeweb/sia-app-access";
import { createSiaAccess, type SiaSession } from "@lumeweb/sia-app-access/sia";
import { APP_META, resolveIndexerUrl } from "../lib/constants";
import { fromHex, toHex } from "../lib/hex";
import { demoSettingsStore, initialState } from "./authSettings";
import { useEventLogStore } from "./eventLog";

type DemoAccess = SiaAccessInteractions<SiaSession>;
let access: DemoAccess | null = null;
let pendingAuthorization: null | {
  controller: DemoAccess;
  result: ReturnType<DemoAccess["authorize"]>;
} = null;
let unsubscribeAccess: (() => void) | null = null;
const accountListeners = new Set<() => void>();

/** Native stream auth reads the current account instead of a persisted key. */
export function activeDemoAppKeyHex(): null | string {
  return access?.activeAppKeyHex() ?? null;
}

/** Video's seed supplier reads fresh access-owned key bytes when playback starts. */
export function copyDemoActiveAppKeySeed(
  expectedSessionId: null | string,
): Uint8Array {
  const controller = access;
  if (
    !controller ||
    !expectedSessionId ||
    controller.getSnapshot().activeSessionId !== expectedSessionId
  )
    throw new SessionUnavailableError();
  return controller.copyActiveAppKeySeed();
}

export function currentDemoAccountSnapshot(): AccessInteractionSnapshot | null {
  return access?.getSnapshot() ?? null;
}

export function subscribeDemoAccount(listener: () => void): () => void {
  accountListeners.add(listener);
  return () => accountListeners.delete(listener);
}

export function useDemoAccountSnapshot(): AccessInteractionSnapshot | null {
  return useSyncExternalStore(
    subscribeDemoAccount,
    currentDemoAccountSnapshot,
    () => null,
  );
}

/** Playback builds a separate worker SDK; account access owns only main-thread handles. */
function accountAccess(indexerUrl: string): DemoAccess {
  const url = resolveIndexerUrl(indexerUrl);
  if (access?.getSnapshot().scope.indexerUrl === new URL(url).href)
    return access;
  const next = createSiaAccess({
    application: APP_META,
    // Keep the demo's one saved key when a user switches indexers to retry reconnect.
    credentials: {
      read() {
        const key = demoSettingsStore.getState().savedUserKeyHex;
        return Promise.resolve(key ? fromHex(key) : null);
      },
      remove() {
        demoSettingsStore.setState({ savedUserKeyHex: "" });
        return Promise.resolve();
      },
      write(_scope, bytes) {
        const previous = demoSettingsStore.getState().savedUserKeyHex;
        try {
          demoSettingsStore.setState({ savedUserKeyHex: toHex(bytes) });
        } catch (error) {
          // Zustand publishes state before localStorage rejects the write.
          // A later state update must not persist a key whose save failed.
          try {
            demoSettingsStore.setState({ savedUserKeyHex: previous });
          } catch {
            // The in-memory rollback still runs before persistence rejects again.
          }
          throw error;
        }
        return Promise.resolve();
      },
    },
    indexerUrl: url,
    onResourceError: () => {
      useEventLogStore.getState().push("Account SDK cleanup failed", "error");
    },
  });
  replaceAccount(next);
  return next;
}

function continueWithoutSaving() {
  if (access?.continueWithoutSaving().kind !== AccessOutcome.Ready)
    throw new Error("Account is not ready to continue.");
}

async function generateRecoveryPhrase() {
  const result = await (
    access ?? accountAccess(demoSettingsStore.getState().indexerUrl)
  ).generateRecoveryPhrase();
  if (result.kind === AccessOutcome.Generated) return result.phrase;
  throw new Error("Could not generate a recovery phrase.");
}

function logout() {
  const wasSharingKeySession =
    demoSettingsStore.getState().sharingKeyHex !== null;
  replaceAccount(null);
  pendingAuthorization = null;
  demoSettingsStore.setState({ ...initialState });
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
}

function publishAccount(): void {
  for (const listener of accountListeners) {
    try {
      listener();
    } catch {
      // A failing observer cannot skip the outgoing controller's disposal.
      try {
        useEventLogStore.getState().push("Account observer failed", "error");
      } catch {
        // A failed reporter cannot block other observers or cleanup.
      }
    }
  }
}

async function reconnect() {
  const { indexerUrl, savedUserKeyHex } = demoSettingsStore.getState();
  if (!savedUserKeyHex) return;
  const phase = access?.getSnapshot().state.phase;
  if (
    phase !== undefined &&
    phase !== AccessPhase.Disconnected &&
    phase !== AccessPhase.Failed
  )
    return;
  demoSettingsStore.setState({ accountError: null, reconnectError: null });
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
    // Failed reconnect keeps the confirmed key so a user can retry or switch indexers.
    demoSettingsStore.setState({
      reconnectError:
        "Could not reconnect your account. Retry or choose another indexer.",
    });
  }
}

async function register(phrase: string) {
  if (!access) throw new Error("No approved connection");
  const controller = access;
  const result = await controller.submitRecoveryPhrase(phrase);
  if (access !== controller || result.kind === AccessOutcome.Ready) return;
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
  demoSettingsStore.setState({ accountError: message });
  throw new Error(message);
}

function replaceAccount(next: DemoAccess | null): void {
  const previous = access;
  unsubscribeAccess?.();
  access = next;
  unsubscribeAccess =
    next?.subscribe(() => {
      if (access !== next) return;
      if (next.getSnapshot().state.phase === AccessPhase.Ready) {
        demoSettingsStore.setState({
          accountError: null,
          reconnectError: null,
        });
      }
      publishAccount();
    }) ?? null;
  publishAccount();
  void previous?.dispose().catch(() => {
    // Detached cleanup must not reject after the replacement is already visible.
    try {
      useEventLogStore
        .getState()
        .push("Account controller cleanup failed", "error");
    } catch {
      // A failed reporter cannot turn cleanup into an unhandled rejection.
    }
  });
}

async function requestConnection(indexerUrl: string) {
  const controller = accountAccess(indexerUrl);
  if (!controller.getSnapshot().presentation.availability.authorize)
    throw new Error("Account connection is unavailable.");
  demoSettingsStore.setState({
    accountError: null,
    approvalContinueRequired: true,
    indexerUrl,
    reconnectError: null,
  });
  const started = new Promise<void>((resolve, reject) => {
    const unsubscribe = controller.subscribe(() => {
      const phase = controller.getSnapshot().state.phase;
      if (phase === AccessPhase.AwaitingApproval) {
        unsubscribe();
        resolve();
      } else if (phase === AccessPhase.Failed) {
        unsubscribe();
        if (access === controller)
          demoSettingsStore.setState({
            accountError: "Could not connect to the indexer. Try again.",
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
  pendingAuthorization = {
    controller,
    result: controller.authorize(AccessIntent.Create),
  };
  await started;
}

async function retrySave() {
  if (!access) return;
  const result = await access.retrySave();
  if (result.kind !== AccessOutcome.Ready)
    throw new Error("Could not save your account key.");
}

function setIndexerUrl(indexerUrl: string) {
  replaceAccount(null);
  pendingAuthorization = null;
  demoSettingsStore.setState({
    accountError: null,
    approvalContinueRequired: false,
    indexerUrl,
    reconnectError: null,
  });
}

async function waitForApproval() {
  const pending = pendingAuthorization;
  if (!pending) return;
  const result = await pending.result;
  if (access !== pending.controller) return;
  if (result.kind === AccessOutcome.Approved)
    demoSettingsStore.setState({ approvalContinueRequired: false });
  else if (result.kind === AccessOutcome.Failed)
    throw new Error("Connection approval failed.");
}

export const demoAccount = {
  continueWithoutSaving,
  generateRecoveryPhrase,
  logout,
  reconnect,
  register,
  requestConnection,
  retrySave,
  setIndexerUrl,
  waitForApproval,
};
