/** Mutation failures precede effects; pin reply losses consume only committed effects. */
import {
  createRequestControls,
  type RequestHold,
  type RequestReceipt,
} from "./controls.js";
import { lostReply } from "./reply-loss.js";
import type { ActorRef, ApplicationObject } from "./types.js";
export interface MockMutationFaults {
  fail(
    selector: MutationSelector,
    options: { code: "denied" | "unavailable"; times: number },
  ): void;
  hold(selector: MutationSelector): RequestHold;
  loseReply(selector: PinReplySelector, options: { times: number }): void;
}
export interface MutationSelector {
  readonly actor?: ActorRef;
  readonly object?: ApplicationObject;
  readonly operation: "delete" | "pin" | "upload";
  readonly stage: "beforeCommit";
}
export interface PinReplySelector {
  readonly actor: ActorRef;
  readonly object?: ApplicationObject;
  readonly operation: "pin";
}
export function createMutationControls(
  validate: (selector: MutationSelector) => void,
  records: RequestReceipt[] = [],
  validateReply: (selector: PinReplySelector) => void,
) {
  const controls = createRequestControls(records);
  const replies = createRequestControls();
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
    loseReply(selector, options) {
      selector = { ...selector };
      options = { ...options };
      validateReply(selector);
      replies.control.fail(selector, {
        code: "unavailable",
        times: options.times,
      });
    },
  };
  return {
    ...controls,
    afterCommit(receipt: RequestReceipt) {
      if (
        receipt.operation === "pin" &&
        receipt.committed &&
        replies.takeFailure(receipt)
      )
        throw lostReply();
    },
    control,
  };
}
