/** This bootstrap owns one demo controller; the React UI can also receive a real SDK controller. */
import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  createMemoryCredentialStore,
  createSiaAccess,
} from "@lumeweb/sia-app-access";
import { sharedAdapter } from "../../tests/helpers/shared-adapter.ts";
import { AccountApp } from "./account-app.tsx";
import "./style.scss";

if (typeof __DEMO_INPUT__ === "undefined")
  throw new Error("Start the local example with pnpm run example:react");
const input = __DEMO_INPUT__;
const memory = createMemoryCredentialStore();
let failNext = false;
const access = createSiaAccess({
  adapter: sharedAdapter(input.registration, input.phrase, input.owner),
  application: {
    appId: "a".repeat(64),
    description: "Local documentation example",
    name: "React onboarding",
    serviceUrl: location.origin,
  },
  credentials: {
    read: (scope) => memory.read(scope),
    remove: (scope) => memory.remove(scope),
    async write(scope, bytes) {
      await memory.write(scope, bytes);
      // A failed acknowledgement can follow a successful write; recovery must not register again.
      if (failNext) {
        failNext = false;
        throw new Error("Demo save acknowledgement lost");
      }
    },
  },
  indexerUrl: input.registration.url,
});

function DemoApproval({ url }: { readonly url: string }) {
  const [error, setError] = useState("");
  const decide = async (action: "approve" | "deny") => {
    const query = new URLSearchParams({ decision: action, url });
    const response = await fetch(`/__demo/approval?${query}`, {
      method: "POST",
    });
    if (!response.ok) throw new Error("The simulated approval request failed.");
  };
  return (
    <div className="demo-approval">
      <p>
        This request is simulated. Approving it won&apos;t connect a real
        account.
      </p>
      <button
        onClick={() => {
          void decide("approve").catch(() => setError("Try approving again."));
        }}>
        Allow connection
      </button>
      <button
        className="secondary"
        onClick={() => {
          void decide("deny").catch(() => setError("Try denying again."));
        }}>
        Decline
      </button>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

const element = document.querySelector("#app");
if (!element) throw new Error("Example root is missing");
const root = createRoot(element);
root.render(
  <StrictMode>
    <main className="page">
      <header className="page-header">
        <a className="wordmark" href="/">
          Account access
        </a>
        <span className="demo-label">Local demo</span>
      </header>
      <div className="layout">
        {/* The shared synthetic client does not implement existing-phrase matching. */}
        <AccountApp
          access={access}
          allowExistingPhrase={false}
          renderApproval={(url) => <DemoApproval url={url} />}
        />
        <aside className="guide-panel">
          <h2>About this demo</h2>
          <p>
            No real account is created. Use the generated test phrase, never
            your own recovery phrase.
          </p>
          <div className="guide-note">
            <h3>Sign in again</h3>
            <p>
              Sign out, then choose Sign in again to return to your account.
              Reloading this page clears your saved sign-in and profile.
            </p>
          </div>
          <div className="guide-note">
            <h3>Try a saving problem</h3>
            <p>
              Choose the button below before finishing account setup to see what
              happens when saving can&apos;t be confirmed.
            </p>
          </div>
          <button
            className="secondary"
            onClick={() => {
              failNext = true;
            }}>
            Simulate a save error
          </button>
          <p className="fine-print">
            The demo will save your sign-in but report an error. You can try
            saving again or continue without confirmation.
          </p>
          <p className="fine-print">
            Read the walkthrough in <code>docs/onboarding.md</code>.
          </p>
        </aside>
      </div>
    </main>
  </StrictMode>,
);

window.addEventListener("pagehide", (event) => {
  // A page in the back/forward cache can resume with the same controller.
  if (event.persisted) return;
  root.unmount();
  void access.dispose();
});
