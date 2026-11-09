/** Controlled session work and suspended renders check application-owned onboarding state. */
import { StrictMode, Suspense, use, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  AccessIntent,
  createMemoryCredentialStore,
  PhraseValidation,
} from "@/index";
import { useSiaAccess } from "@/react";
import { AccountApp } from "../../examples/react-onboarding/account-app.tsx";
import { fixture } from "../helpers/core-fixture.ts";

const memory = createMemoryCredentialStore();
let afterWrite: () => void = () => undefined;
let restoredAccount = "none";
const original = fixture({
  async read(scope) {
    const bytes = await memory.read(scope);
    restoredAccount = bytes?.[0] === 2 ? "second" : "first";
    return bytes;
  },
  remove: (scope) => memory.remove(scope),
  async write(scope, bytes) {
    await memory.write(scope, bytes);
    afterWrite();
  },
});
original.session.exportAppKey = () =>
  new Uint8Array(32).fill(original.counts().registrations);
const replacement = fixture();
let release: () => void = () => undefined;
let generated: Promise<unknown> | undefined;
let holdValidation = false;
let validationResult = PhraseValidation.Invalid;
const registeredPhrases: string[] = [];
let failRegistration = false;
const register = original.connection.register.bind(original.connection);
original.connection.register = async (phrase) => {
  registeredPhrases.push(phrase);
  if (failRegistration) throw new Error("Fixture registration failed");
  return register(phrase);
};
let releaseValidation: () => void = () => undefined;
const validation = new Promise<PhraseValidation>((resolve) => {
  releaseValidation = () => resolve(validationResult);
});
original.adapter.validateRecoveryPhrase = () =>
  holdValidation ? validation : Promise.resolve(PhraseValidation.Valid);
original.adapter.generateRecoveryPhrase = () => {
  const pending = new Promise<string>((resolve) => {
    release = () => resolve("generated phrase");
  });
  generated = pending;
  return pending;
};

let resumeRendering: () => void = () => undefined;
const rendering = new Promise<void>((resolve) => {
  resumeRendering = resolve;
});
/** The store commits its copy before cancellation can retire the new session. */
async function establishAccount(cancel: boolean) {
  afterWrite = cancel ? () => original.access.cancel() : () => undefined;
  original.access.disconnect();
  await original.access.authorize(AccessIntent.Create);
  await original.access.submitRecoveryPhrase("second account phrase");
}

function Harness() {
  const { snapshot } = useSiaAccess(original.access);
  const [access, setAccess] = useState(original.access);
  const [visible, setVisible] = useState(true);
  const [released, setReleased] = useState(false);
  const [paused, setPaused] = useState(false);
  return (
    <>
      <button
        onClick={() => {
          holdValidation = true;
        }}>
        Hold validation
      </button>
      <button
        onClick={() => {
          validationResult = PhraseValidation.Valid;
          holdValidation = true;
        }}>
        Hold valid validation
      </button>
      <button
        onClick={() => {
          failRegistration = true;
        }}>
        Fail registration
      </button>
      <output
        data-phase={snapshot.state.phase}
        data-testid="registered-phrases">
        {JSON.stringify(registeredPhrases)}
      </output>
      <output data-testid="restored-account">{restoredAccount}</output>
      <button
        onClick={() => {
          void establishAccount(true);
        }}>
        Register and cancel
      </button>
      <button
        onClick={() => {
          void establishAccount(false);
        }}>
        Register another account
      </button>
      <button
        onClick={() => {
          void replacement.access
            .authorize(AccessIntent.Create)
            .then(async () => {
              await replacement.access.submitRecoveryPhrase(
                "replacement phrase",
              );
              setAccess(replacement.access);
            });
        }}>
        Replace ready controller
      </button>
      <button
        onClick={() => {
          releaseValidation();
        }}>
        Release validation
      </button>
      <button
        onClick={() => {
          setVisible(false);
        }}>
        Hide account UI
      </button>
      <button
        onClick={() => {
          setVisible(true);
        }}>
        Show account UI
      </button>
      <button
        onClick={() => {
          void replacement.access
            .authorize(AccessIntent.Create)
            .then(() => setAccess(replacement.access));
        }}>
        Replace controller
      </button>
      <button
        onClick={() => {
          release();
          void generated?.then(() => setReleased(true));
        }}>
        Release generated phrase
      </button>
      <output data-testid="controller-id">
        {access === original.access ? "original" : "replacement"}
      </output>
      <output data-testid="generation-released">
        {released ? "released" : "pending"}
      </output>
      <button onClick={() => setPaused(true)}>Pause account rendering</button>
      <button
        onClick={() => {
          resumeRendering();
          setPaused(false);
        }}>
        Resume account rendering
      </button>
      <Suspense fallback={<p>Account rendering is paused</p>}>
        <PauseAccount paused={paused} />
        {visible && <AccountApp access={access} />}
      </Suspense>
    </>
  );
}
function PauseAccount({ paused }: { readonly paused: boolean }) {
  if (paused) use(rendering);
  return null;
}
const element = document.querySelector("#app");
if (!element) throw new Error("Fixture root is missing");
createRoot(element).render(
  <StrictMode>
    <Harness />
  </StrictMode>,
);
window.addEventListener(
  "pagehide",
  () => {
    original.access.dispose();
    replacement.access.dispose();
  },
  { once: true },
);
