import { useState } from "react";
import { useStore } from "zustand";
import { useAuthStore } from "../../stores/auth";

export function ApproveScreen() {
  const approvalUrl = useStore(useAuthStore, (s) => s.approvalUrl);
  const waitForApproval = useStore(useAuthStore, (s) => s.waitForApproval);
  const requestConnection = useStore(useAuthStore, (s) => s.requestConnection);
  const indexerUrl = useStore(useAuthStore, (s) => s.indexerUrl);
  const [waiting, setWaiting] = useState(false);
  const [error, setError] = useState<null | string>(null);
  const handleContinue = async () => {
    if (!approvalUrl) return;
    setError(null);
    setWaiting(true);
    try {
      await waitForApproval();
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
        Open the approval link below in another tab, approve the request, then
        continue here.
      </p>
      <div className="my-3 wrap-anywhere">
        <a
          className="text-accent"
          href={approvalUrl ?? undefined}
          rel="noreferrer"
          target="_blank">
          {approvalUrl}
        </a>
      </div>
      {error ? (
        <>
          <p className="text-danger" role="alert">
            {error}
          </p>
          <button
            onClick={() => {
              void requestConnection(indexerUrl).then(
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
