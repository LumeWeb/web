import { type FormEvent, useState } from "react";
// The SDK value imports stay dynamic so the sia-storage WASM module is not
// pulled into the main-thread graph until a phrase is generated or registered.
import { useStore } from "zustand";
import { useAuthStore } from "../../stores/auth";

export function RecoveryScreen() {
  const register = useStore(useAuthStore, (s) => s.register);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<null | string>(null);
  const [phrase, setPhrase] = useState("");

  const handleGenerate = async () => {
    const { generateRecoveryPhrase, initSia } =
      await import("@siafoundation/sia-storage");
    await initSia();
    setError(null);
    setPhrase(generateRecoveryPhrase());
  };

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = phrase.trim();
    if (!value) return;
    setError(null);
    try {
      const { validateRecoveryPhrase } =
        await import("@siafoundation/sia-storage");
      validateRecoveryPhrase(value);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
      return;
    }
    setBusy(true);
    try {
      await register(value);
      // Registration resolves to `status: "connected"` and the router takes
      // the account into the player.
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
        <div className="flex gap-2">
          <button onClick={() => void handleGenerate()} type="button">
            Generate
          </button>
          <button disabled={busy} type="submit">
            {busy ? "Registering…" : "Register"}
          </button>
        </div>
      </form>
    </section>
  );
}
