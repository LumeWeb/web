import { AccessPhase } from "@/index";
/** React hydration observes one owner; remounting replaces only its subscription. */
import { createElement } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import type { ApplicationPort } from "@lumeweb/sia-testing/client";
import type { AccessSnapshot, SiaAccess } from "@/index";
import { useSiaAccess } from "@/react";

export function mountReact(
  view: HTMLElement,
  access: SiaAccess<ApplicationPort>,
  serverSnapshot: AccessSnapshot,
): () => void {
  let priorCommands: unknown;
  let stable = true;
  function View() {
    const binding = useSiaAccess(access, { serverSnapshot });
    if (priorCommands && priorCommands !== binding.commands) stable = false;
    priorCommands = binding.commands;
    const state = binding.snapshot.state;
    return createElement(
      "div",
      null,
      createElement("p", { "data-testid": "phase" }, state.phase),
      createElement(
        "p",
        { "data-testid": "approval" },
        state.phase === AccessPhase.AwaitingApproval ? state.approvalUrl : "",
      ),
      createElement(
        "p",
        { "data-testid": "confirmation" },
        state.phase === AccessPhase.Ready ? state.credentials : "",
      ),
      createElement("p", { "data-testid": "stable" }, String(stable)),
    );
  }
  // SSR and hydration use the same snapshot; command identity belongs to each mount.
  view.innerHTML = renderToString(createElement(View));
  priorCommands = undefined;
  const root = hydrateRoot(view, createElement(View));
  return () => root.unmount();
}
