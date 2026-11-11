/** Application-rendered controls exercise headless views without any SDK or native account work. */
import { createElement, StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import type { SiaAccess } from "@/index";
import { createSiaAccessContext, SiaAccessView } from "@/react";
import type { SiaAccessBinding } from "@/react";
import { fixture } from "../helpers/core-fixture.ts";
import type { TestSession } from "../helpers/core-fixture.ts";

const f = fixture();
let reconnects = 0;
let disposals = 0;
const access: SiaAccess<TestSession> = {
  ...f.access,
  dispose() {
    document.querySelector("[data-testid=disposals]")!.textContent = String(
      ++disposals,
    );
    return f.access.dispose();
  },
  reconnect() {
    if (this !== access) throw new Error("Controller receiver was lost");
    document.querySelector("[data-testid=reconnects]")!.textContent = String(
      ++reconnects,
    );
    return f.access.reconnect();
  },
};
const bindings = createSiaAccessContext<TestSession>();

function App() {
  const [visible, setVisible] = useState(true);
  return createElement(
    "main",
    null,
    createElement(
      "button",
      { onClick: () => setVisible((value) => !value), type: "button" },
      "Toggle views",
    ),
    createElement(
      "button",
      { onClick: () => access.dispose(), type: "button" },
      "Dispose owner",
    ),
    createElement(
      "section",
      { "data-testid": "views" },
      visible
        ? [
            createElement(SiaAccessView<TestSession>, {
              access,
              children: (binding) =>
                createElement(Panel, { binding, name: "direct" }),
              key: "direct",
            }),
            createElement(
              bindings.Provider,
              { access, key: "context" },
              createElement(bindings.View, {
                children: (binding) =>
                  createElement(Panel, { binding, name: "context" }),
              }),
            ),
          ]
        : null,
    ),
  );
}
function Panel({
  binding,
  name,
}: {
  readonly binding: SiaAccessBinding<TestSession>;
  readonly name: string;
}) {
  const [outcome, setOutcome] = useState("");
  return createElement(
    "article",
    { className: "application-panel" },
    createElement(
      "output",
      { "data-testid": `${name}-phase` },
      binding.snapshot.state.phase,
    ),
    createElement(
      "button",
      {
        className: "application-button",
        onClick: async () => {
          const result = await binding.commands.reconnect();
          setOutcome(result.kind);
        },
        style: { color: "purple" },
        type: "button",
      },
      `Reconnect ${name}`,
    ),
    createElement("output", { "data-testid": `${name}-outcome` }, outcome),
  );
}
createRoot(document.getElementById("root")!).render(
  createElement(StrictMode, null, createElement(App)),
);
