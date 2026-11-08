/** Mounted observation exposes subscription ownership without starting authorization. */
import { createElement, StrictMode, useMemo, useRef, useState } from "react";
import { useStore } from "zustand";
import { createSiaAccessStore } from "@/zustand";
import { createRoot } from "react-dom/client";
import { createSiaAccess } from "@/index";
import type { SiaAccess } from "@/index";
import { createSiaAccessContext, useSiaAccess } from "@/react";

function observedAccess(label: string): SiaAccess<number> {
  const unused = async (): Promise<never> => {
    throw Error("Unexpected adapter work");
  };
  const base = createSiaAccess<number>({
    adapter: {
      begin: unused,
      generateRecoveryPhrase: unused,
      reconnect: unused,
      validateRecoveryPhrase: unused,
    },
    application: {
      appId: label.repeat(64),
      description: "",
      name: label,
      serviceUrl: "https://app.test",
    },
    indexerUrl: "https://indexer.test",
  });
  let subscriptions = 0;
  let disposals = 0;
  function report(kind: string, value: number) {
    document.querySelector(`[data-testid="${label}-${kind}"]`)!.textContent =
      String(value);
  }
  const access: SiaAccess<number> = {
    ...base,
    dispose() {
      disposals++;
      report("disposals", disposals);
      base.dispose();
    },
    reconnect() {
      if (this !== access) throw Error("Controller receiver was lost");
      return base.reconnect();
    },
    subscribe(listener) {
      subscriptions++;
      report("subscriptions", subscriptions);
      const unsubscribe = base.subscribe(listener);
      return () => {
        subscriptions--;
        report("subscriptions", subscriptions);
        unsubscribe();
      };
    },
  };
  return access;
}
const a = observedAccess("a");
const b = observedAccess("b");
const bindings = createSiaAccessContext<number>();
function App() {
  const [access, setAccess] = useState(a);
  const [visible, setVisible] = useState(true);
  return createElement(
    "div",
    null,
    createElement("button", { onClick: () => setAccess(b) }, "Swap controller"),
    createElement(
      "button",
      { onClick: () => access.dispose() },
      "Dispose owner",
    ),
    createElement(
      "button",
      { onClick: () => setVisible((value) => !value) },
      "Toggle observers",
    ),
    createElement(
      bindings.Provider,
      { access },
      visible
        ? createElement(
            "div",
            null,
            createElement(Whole, { access }),
            createElement(Selected),
          )
        : null,
    ),
  );
}
function Selected() {
  const selected = bindings.useSelector((snapshot) => snapshot.scope.appId);
  const renders = useRef(0);
  renders.current++;
  return createElement(
    "div",
    null,
    createElement(
      "output",
      { "data-testid": "selected-renders" },
      String(renders.current),
    ),
    createElement("output", { "data-testid": "selected-app" }, selected),
  );
}
function Whole({ access }: { readonly access: SiaAccess<number> }) {
  const binding = useSiaAccess(access);
  const store = useMemo(() => createSiaAccessStore(access), [access]);
  const independent = useStore(store);
  const renders = useRef(0);
  renders.current++;
  return createElement(
    "div",
    null,
    createElement(
      "output",
      { "data-testid": "whole-renders" },
      String(renders.current),
    ),
    createElement(
      "output",
      { "data-testid": "whole-phase" },
      binding.snapshot.state.phase,
    ),
    createElement(
      "output",
      { "data-testid": "shared-snapshot" },
      String(binding.snapshot === independent),
    ),
    createElement(
      "button",
      { onClick: () => void binding.commands.reconnect() },
      "Publish",
    ),
  );
}
createRoot(document.getElementById("root")!).render(
  createElement(StrictMode, null, createElement(App)),
);
