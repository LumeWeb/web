import { useState } from "react";
import { AccessFailure, AccessPhase } from "@lumeweb/sia-app-access";
import { useStore } from "zustand";
import { DEFAULT_INDEXER_URL, resolveIndexerUrl } from "../../lib/constants";
import { extractSharingSeed } from "../../lib/sharingLink";
import { cn } from "../../lib/utils";
import { demoAccount, useDemoAccountSnapshot } from "../../stores/auth";
import { demoSettingsStore } from "../../stores/authSettings";
import { ConnectScreen } from "./ConnectScreen";

/**
 * Default entry screen: a sharing key is a complete credential, so "Open a
 * share" is the primary path: one input accepts either a full share link or a
 * raw 64-hex sharing key, and Apply routes straight into the keyless shared
 * player. SSO is a clearly secondary text action below. The ONE advanced
 * indexer setting (used by the keyless listing/playback and by the account
 * connect flow alike) lives behind a collapsed "Advanced" toggle on this
 * screen only, so it never front-loads infrastructure details.
 */

/** Shared visual base for the "Advanced" and "Sign in with your Sia account"
 * expanders: transparent text links that escape the default button chrome
 * (see the `button[type="button"]` base rule in index.css), with the
 * per-toggle margin/color/hover handled by `cn` variants below. */
const expanderToggle =
  "block bg-transparent border-0 px-0 py-1 text-[13px] cursor-pointer text-left hover:underline";

export function GateScreen() {
  const setSharingKeySeed = useStore(
    demoSettingsStore,
    (s) => s.setSharingKeySeed,
  );
  const sharingError = useStore(demoSettingsStore, (s) => s.sharingError);
  const reconnectError = useStore(demoSettingsStore, (s) => s.reconnectError);
  const accountError = useStore(demoSettingsStore, (s) => s.accountError);
  const accountState = useDemoAccountSnapshot()?.state;
  const approvalFailed =
    accountState?.phase === AccessPhase.Failed &&
    (accountState.failure === AccessFailure.Approval ||
      accountState.failure === AccessFailure.ApprovalTimeout);
  const accountMessage =
    accountError ??
    (approvalFailed ? "Connection approval failed. Start again." : null);
  const savedUserKeyHex = useStore(demoSettingsStore, (s) => s.savedUserKeyHex);
  const storedIndexer = useStore(demoSettingsStore, (s) => s.indexerUrl);
  const [shareInput, setShareInput] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showSso, setShowSso] = useState(false);
  const [indexerUrl, setIndexerInput] = useState(
    resolveIndexerUrl(storedIndexer),
  );

  const handleApplyShare = () => {
    // The box accepts a raw seed OR a full sharing link; a URL's seed is
    // extracted here so its non-hex URL characters never reach the store's hex
    // validator.
    setSharingKeySeed(extractSharingSeed(shareInput));
  };

  const handleApplyIndexer = () => {
    const url = indexerUrl.trim();
    if (!url) return;
    demoAccount.setIndexerUrl(url);
  };

  return (
    <>
      <section className="bg-canvas-subtle border-border-default mb-4 rounded-lg border p-5">
        {reconnectError ? (
          <div className="mb-3">
            <p className="text-danger text-xs" role="alert">
              {reconnectError}
            </p>
            <button onClick={() => void demoAccount.reconnect()} type="button">
              Retry connection
            </button>
          </div>
        ) : null}
        <h2 className="mt-0 mb-1 text-lg">Open a share</h2>
        <p className="text-fg-muted mt-0 mb-3 text-[13px]">
          Paste a sharing link or key to list the objects it unlocks.
        </p>
        <label
          className="text-fg-muted mb-1 flex flex-col gap-1 text-xs"
          htmlFor="gate-sharing-input">
          Sharing link or key
        </label>
        <div className="flex items-center gap-2">
          <input
            className="font-inherit bg-canvas-default border-border-default flex-1 rounded-md border px-2.5 py-2 text-inherit"
            id="gate-sharing-input"
            onChange={(event) => setShareInput(event.target.value)}
            placeholder="https://your-service.example/#sharing_key=a1b2…"
            spellCheck={false}
            value={shareInput}
          />
          <button
            disabled={shareInput.trim() === ""}
            onClick={handleApplyShare}
            type="button">
            Apply
          </button>
        </div>
        {sharingError ? (
          <p className="text-danger mt-2 text-xs" role="alert">
            {sharingError}
          </p>
        ) : null}
        <button
          aria-expanded={showAdvanced}
          className={cn(
            expanderToggle,
            "text-fg-muted hover:text-fg-default mt-3",
          )}
          onClick={() => setShowAdvanced((open) => !open)}
          type="button">
          {showAdvanced ? "Hide" : "Show"} advanced
        </button>
        {showAdvanced ? (
          <div className="mt-3 flex flex-col gap-1.5">
            <label
              className="text-fg-muted mb-1 flex flex-col gap-1 text-xs"
              htmlFor="gate-indexer-input">
              Indexer URL (shared by both entry flows)
            </label>
            <div className="flex items-center gap-2">
              <input
                className="font-inherit bg-canvas-default border-border-default flex-1 rounded-md border px-2.5 py-2 text-inherit"
                id="gate-indexer-input"
                onChange={(event) => setIndexerInput(event.target.value)}
                placeholder={DEFAULT_INDEXER_URL}
                spellCheck={false}
                value={indexerUrl}
              />
              <button
                disabled={indexerUrl.trim() === ""}
                onClick={handleApplyIndexer}
                type="button">
                Save
              </button>
            </div>
          </div>
        ) : null}
      </section>
      {accountMessage ? (
        <p className="text-danger mb-3 text-xs" role="alert">
          {accountMessage}
        </p>
      ) : null}
      {approvalFailed ? (
        <button
          onClick={() =>
            void demoAccount
              .requestConnection(storedIndexer)
              .catch(() => undefined)
          }
          type="button">
          Start again
        </button>
      ) : null}
      {accountMessage && savedUserKeyHex ? (
        <button onClick={() => void demoAccount.reconnect()} type="button">
          Reconnect saved account
        </button>
      ) : null}
      <button
        aria-expanded={showSso}
        className={cn(
          expanderToggle,
          "text-accent hover:text-accent-hover mb-4",
        )}
        onClick={() => setShowSso((open) => !open)}
        type="button">
        Sign in with your Sia account
      </button>
      {showSso ? <ConnectScreen /> : null}
    </>
  );
}
