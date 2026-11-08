/** Browser views observe one controller; test drivers supply managed transport bindings. */
import { AccessIntent, AccessPhase } from "@/index";
import { bytesFixture } from "@lumeweb/sia-testing/mock";
import type { MockConnection } from "@lumeweb/sia-testing/client";
import { createMemoryCredentialStore, createSiaAccess } from "@/index";
import { sharedAdapter } from "../helpers/shared-adapter.ts";
interface BrowserFixtureInput {
  readonly owner: MockConnection;
  readonly phrase: string;
  readonly registration: MockConnection;
}
declare global {
  interface Window {
    fixtureInput: BrowserFixtureInput;
  }
}
const { owner, phrase, registration } = window.fixtureInput;
const memory = createMemoryCredentialStore();
let failSave = true;
const access = createSiaAccess({
  adapter: sharedAdapter(registration, phrase, owner),
  application: {
    appId: "a".repeat(64),
    description: "Synthetic browser checks",
    name: "Browser access",
    serviceUrl: "https://app.test",
  },
  credentials: {
    read: (scope) => memory.read(scope),
    remove: (scope) => memory.remove(scope),
    async write(scope, bytes) {
      await memory.write(scope, bytes);
      if (failSave) throw Error("Lost save acknowledgement");
    },
  },
  indexerUrl: registration.url,
});
const view = document.querySelector<HTMLElement>("#view")!;
const controls = document.querySelector<HTMLElement>("#controls")!;
let unmount: () => void;
// The plain fixture uses DOM rendering and the framework-independent observation port.
function mountView() {
  function render() {
    const state = access.getSnapshot().state;
    view.replaceChildren();
    for (const [id, text] of [
      ["phase", state.phase],
      [
        "approval",
        state.phase === AccessPhase.AwaitingApproval ? state.approvalUrl : "",
      ],
      [
        "confirmation",
        state.phase === AccessPhase.Ready ? state.credentials : "",
      ],
    ]) {
      const element = document.createElement("p");
      element.dataset.testid = id;
      element.textContent = text!;
      view.append(element);
    }
  }
  render();
  unmount = access.subscribe(render);
}
const input = document.createElement("input");
input.setAttribute("aria-label", "Phrase");
controls.append(input);
const result = document.createElement("p");
result.dataset.testid = "result";
controls.append(result);
function button(name: string, work: () => unknown) {
  const element = document.createElement("button");
  element.textContent = name;
  element.onclick = () => {
    result.textContent = "pending";
    void Promise.resolve()
      .then(work)
      .then(
        (value) => {
          result.textContent =
            typeof value === "object" && value && "kind" in value
              ? String(value.kind)
              : typeof value === "string" ||
                  typeof value === "number" ||
                  typeof value === "boolean"
                ? String(value)
                : "";
        },
        (error) => {
          result.textContent = String(error);
        },
      );
  };
  controls.append(element);
}
button("Authorize", () => access.authorize(AccessIntent.Create));
button("Cancel", () => access.cancel());
button("Submit", () => access.submitRecoveryPhrase(input.value));
button("Retry", () => {
  failSave = false;
  return access.retrySave();
});
button("Continue", () => access.continueWithoutSaving());
button("Disconnect", () => access.disconnect());
button("Reconnect", () => access.reconnect());
button("Forget", () => access.forget());
button("Remount", () => {
  unmount();
  mountView();
});
button("Work", () =>
  access.withSession(async (port) => {
    const file = await bytesFixture({
      bytes: Uint8Array.of(1, 2),
      name: "document",
    });
    const object = await port.upload({ file, metadata: Uint8Array.of(3) });
    await port.pin(object);
    return port.inspect(object);
  }),
);
mountView();
