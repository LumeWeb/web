import { type FormEvent, useState } from "react";
import { AccessFailure, AccessPhase } from "@lumeweb/sia-app-access";
import { demoAccount, useDemoAccountSnapshot } from "../../stores/auth";

export function RecoveryScreen() {
  const accountState = useDemoAccountSnapshot()?.state;
  const saveError =
    accountState?.phase === AccessPhase.Failed &&
    accountState.failure === AccessFailure.CredentialsWrite
      ? "Could not save your account key. Try saving again."
      : null;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<null | string>(null);
  const [phrase, setPhrase] = useState("");

  const handleGenerate = async () => {
    setError(null);
    try {
      setPhrase(await demoAccount.generateRecoveryPhrase());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    }
  };

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = phrase.trim();
    if (!value) return;
    setError(null);
    setBusy(true);
    try {
      await demoAccount.register(value);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
      setBusy(false);
    }
  };

  return (
    <section className="bg-canvas-subtle border-border-default mb-4 rounded-lg border p-5">
      <h2 className="mt-0 mb-3 text-lg">Recovery phrase</h2>
      <p>
        Use a freshly generated phrase for a new account, or paste an existing
        one.
      </p>
      <form
        className="flex flex-col gap-3"
        onSubmit={(event) => void handleRegister(event)}>
        <textarea
          className="font-inherit bg-canvas-default border-border-default rounded-md border px-2.5 py-2 text-inherit"
          onChange={(event) => setPhrase(event.target.value)}
          placeholder="12-word recovery phrase"
          rows={3}
          spellCheck={false}
          value={phrase}
        />
        {error ? (
          <p className="text-danger" role="alert">
            {error}
          </p>
        ) : null}
        {saveError ? (
          <div className="flex flex-col gap-2">
            <button
              onClick={() =>
                void demoAccount
                  .retrySave()
                  .catch((cause: unknown) =>
                    setError(
                      cause instanceof Error ? cause.message : String(cause),
                    ),
                  )
              }
              type="button">
              Try saving again
            </button>
            <button onClick={demoAccount.continueWithoutSaving} type="button">
              Continue without saving
            </button>
          </div>
        ) : null}
        <div className="flex gap-2">
          <button
            disabled={Boolean(saveError)}
            onClick={() => void handleGenerate()}
            type="button">
            Generate
          </button>
          <button disabled={busy || Boolean(saveError)} type="submit">
            {busy ? "Registering…" : "Register"}
          </button>
        </div>
      </form>
    </section>
  );
}
