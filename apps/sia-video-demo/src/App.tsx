import { useEffect } from "react";
import { AuthFlow } from "./components/auth/AuthFlow";
import { DeveloperTools } from "./components/DeveloperTools";
import { ingestSharingFragment } from "./stores/auth";

export function App() {
  // Share fragments are ingested at the app entrypoint: once at module load
  // (stores/auth.ts) and again on every `hashchange` here, so a sharing key
  // pasted into the address bar mid-session starts a fresh keyless session.
  useEffect(() => {
    window.addEventListener("hashchange", ingestSharingFragment);
    return () =>
      window.removeEventListener("hashchange", ingestSharingFragment);
  }, []);

  return (
    <main className="mx-auto max-w-[960px] px-4 pt-6 pb-12">
      <header>
        <h1 className="m-0 mb-1 text-2xl">Sia Video Demo</h1>
        <p className="text-fg-muted m-0 mb-6">
          Open a share to watch videos someone gave you, or sign in with your
          Sia account.
        </p>
      </header>
      <AuthFlow />
      {/* The developer-only event-log panel mounts ONCE here, at the app level
          below the auth flow, so it stays visible across connect/approve/
          recovery and the player flow alike. It is kept behind a collapsed
          "Developer tools" disclosure: unmounted while hidden, mounted only
          when expanded. It reads the typed eventLog store straight from the
          shared singleton; this chunk only presents them. */}
      <DeveloperTools />
    </main>
  );
}
