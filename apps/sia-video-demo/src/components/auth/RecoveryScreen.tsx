import { type FormEvent, useState } from "react";
import { useStore } from "zustand";
import { useAuthStore } from "../../stores/auth";

export function RecoveryScreen() {
  const register = useStore(useAuthStore, (s) => s.register);
  const continueWithoutSaving = useStore(
    useAuthStore,
    (s) => s.continueWithoutSaving,
  );
  const generateRecoveryPhrase = useStore(
    useAuthStore,
    (s) => s.generateRecoveryPhrase,
  );
  const retrySave = useStore(useAuthStore, (s) => s.retrySave);
  const saveError = useStore(useAuthStore, (s) => s.saveError);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<null | string>(null);
  const [phrase, setPhrase] = useState("");

  const handleGenerate = async () => {
    setError(null);
    try {
      setPhrase(await generateRecoveryPhrase());
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
      await register(value);
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
                void retrySave().catch((cause: unknown) =>
                  setError(
                    cause instanceof Error ? cause.message : String(cause),
                  ),
                )
              }
              type="button">
              Try saving again
            </button>
            <button onClick={continueWithoutSaving} type="button">
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
