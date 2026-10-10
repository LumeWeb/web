import { type FormEvent, useState } from "react";
import { useStore } from "zustand";
import { resolveIndexerUrl } from "../../lib/constants";
import { useAuthStore } from "../../stores/auth";

/**
 * Account (SSO) entry panel. The advanced indexer setting is NOT repeated
 * here: it is the single shared control on the gate screen, and this panel
 * connects through the same stored value (resolved via `resolveIndexerUrl`).
 */
export function ConnectScreen() {
  const requestConnection = useStore(useAuthStore, (s) => s.requestConnection);
  const storedIndexer = useStore(useAuthStore, (s) => s.indexerUrl);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<null | string>(null);

  const handleConnect = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await requestConnection(resolveIndexerUrl(storedIndexer));
      // Success transitions the router to the approval screen.
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
      setBusy(false);
    }
  };

  return (
    <section className="bg-canvas-subtle border-border-default mb-4 rounded-lg border p-5">
      <h2 className="mt-0 mb-3 text-lg">Connect to an indexer</h2>
      <p className="text-fg-muted mt-0 mb-3 text-[13px]">
        Uses the shared indexer setting above:{" "}
        {resolveIndexerUrl(storedIndexer)}.
      </p>
      <form
        className="flex flex-col gap-3"
        onSubmit={(event) => void handleConnect(event)}>
        {error ? (
          <p className="text-danger" role="alert">
            {error}
          </p>
        ) : null}
        <button disabled={busy} type="submit">
          {busy ? "Connecting…" : "Connect"}
        </button>
      </form>
    </section>
  );
}
