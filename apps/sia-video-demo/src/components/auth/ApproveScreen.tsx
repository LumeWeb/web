import { useState } from "react";
import { AccessPhase } from "@lumeweb/sia-app-access";
import { useStore } from "zustand";
import { demoAccount, useDemoAccountSnapshot } from "../../stores/auth";
import { demoSettingsStore } from "../../stores/authSettings";

export function ApproveScreen() {
  const state = useDemoAccountSnapshot()?.state;
  const approvalUrl =
    state?.phase === AccessPhase.AwaitingApproval ? state.approvalUrl : null;
  const indexerUrl = useStore(demoSettingsStore, (s) => s.indexerUrl);
  const [waiting, setWaiting] = useState(false);
  const [error, setError] = useState<null | string>(null);
  const handleContinue = async () => {
    if (!approvalUrl && state?.phase !== AccessPhase.RecoveryPhrase) return;
    setError(null);
    setWaiting(true);
    try {
      await demoAccount.waitForApproval();
      // Approval resolved: the router moves on to the recovery screen.
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
      setWaiting(false);
    }
  };

  return (
    <section className="bg-canvas-subtle border-border-default mb-4 rounded-lg border p-5">
      <h2 className="mt-0 mb-3 text-lg">Approve the connection</h2>
      <p>
        {approvalUrl
          ? "Open the approval link below in another tab, approve the request, then continue here."
          : "Connection approved. Continue to your recovery phrase."}
      </p>
      {approvalUrl ? (
        <div className="my-3 wrap-anywhere">
          <a
            className="text-accent"
            href={approvalUrl}
            rel="noreferrer"
            target="_blank">
            {approvalUrl}
          </a>
        </div>
      ) : null}
      {error ? (
        <>
          <p className="text-danger" role="alert">
            {error}
          </p>
          <button
            onClick={() => {
              void demoAccount.requestConnection(indexerUrl).then(
                () => setError(null),
                (cause: unknown) =>
                  setError(
                    cause instanceof Error ? cause.message : String(cause),
                  ),
              );
            }}
            type="button">
            Start again
          </button>
        </>
      ) : null}
      <button
        disabled={waiting}
        onClick={() => void handleContinue()}
        type="button">
        {waiting ? "Waiting for approval…" : "Continue"}
      </button>
    </section>
  );
}
