/** Controlled phrase work checks the guide's form without changing the controller's outcomes. */
import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { AccessIntent, PhraseValidation } from "@/index";
import { useSiaAccess } from "@/react";
import { AccountApp } from "../../examples/react-onboarding/account-app.tsx";
import { fixture } from "../helpers/core-fixture.ts";

const original = fixture();
const replacement = fixture();
let release: () => void = () => undefined;
let generated: Promise<unknown> | undefined;
let holdValidation = false;
let validationResult = PhraseValidation.Invalid;
const registeredPhrases: string[] = [];
const register = original.connection.register.bind(original.connection);
original.connection.register = async (phrase) => {
  registeredPhrases.push(phrase);
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

function Harness() {
  const { snapshot } = useSiaAccess(original.access);
  const [access, setAccess] = useState(original.access);
  const [visible, setVisible] = useState(true);
  const [released, setReleased] = useState(false);
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
      <output
        data-phase={snapshot.state.phase}
        data-testid="registered-phrases">
        {JSON.stringify(registeredPhrases)}
      </output>
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
      {visible && <AccountApp access={access} />}
    </>
  );
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
