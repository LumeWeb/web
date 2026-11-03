/** Mutation controls stop before effects and never manufacture a lost acknowledgement. */
import { createRequestControls, type RequestHold } from "./controls.js";
import type { ActorRef, ApplicationObject } from "./types.js";
export interface MockMutationFaults {
  fail(
    selector: MutationSelector,
    options: { code: "denied" | "unavailable"; times: number },
  ): void;
  hold(selector: MutationSelector): RequestHold;
}
export interface MutationSelector {
  readonly actor?: ActorRef;
  readonly object?: ApplicationObject;
  readonly operation: "delete" | "pin" | "upload";
  readonly stage: "beforeCommit";
}
export function createMutationControls(
  validate: (selector: MutationSelector) => void,
) {
  const controls = createRequestControls();
  const control: MockMutationFaults = {
    fail(selector, options) {
      selector = { ...selector };
      options = { ...options };
      validate(selector);
      if (options.code !== "denied" && options.code !== "unavailable")
        throw Object.assign(new Error("Invalid mutation failure"), {
          code: "invalid-input",
        });
      controls.control.fail(selector, options);
    },
    hold(selector) {
      selector = { ...selector };
      validate(selector);
      return controls.control.hold(selector);
    },
  };
  return { ...controls, control };
}
