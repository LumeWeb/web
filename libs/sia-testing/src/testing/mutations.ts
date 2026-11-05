/** Mutation failures precede effects; reply losses consume only committed effects. */
import {
  createRequestControls,
  type RequestHold,
  type RequestReceipt,
} from "./controls.js";
import { lostReply } from "./reply-loss.js";
import type { ActorRef, ApplicationObject, MockShareGrant } from "./types.js";
export interface MockMutationFaults {
  fail(
    selector: MutationSelector,
    options: { code: "denied" | "unavailable"; times: number },
  ): void;
  hold(selector: MutationSelector): RequestHold;
  loseReply(selector: MutationReplySelector, options: { times: number }): void;
}
export type MutationReplySelector = { readonly actor: ActorRef } & (
  | {
      readonly object?: ApplicationObject;
      readonly operation: "delete" | "pin";
      readonly share?: never;
    }
  | {
      readonly object?: never;
      readonly operation: "share-add" | "share-end" | "share-remove";
      readonly share?: MockShareGrant;
    }
  | {
      readonly object?: never;
      readonly operation: "upload";
      readonly share?: never;
    }
);
export type MutationSelector =
  | {
      readonly actor: ActorRef;
      readonly afterBytes: number;
      readonly object?: never;
      readonly operation: "packed-add" | "upload";
      readonly share?: never;
      readonly stage: "collect";
    }
  | ({
      readonly actor?: ActorRef;
      readonly stage: "beforeCommit";
    } & (
      | {
          readonly object?: ApplicationObject;
          readonly operation: "delete" | "pin";
          readonly share?: never;
        }
      | {
          readonly object?: never;
          readonly operation:
            "metadata" | "packed-add" | "packed-finalize" | "upload";
          readonly share?: never;
        }
      | {
          readonly object?: never;
          readonly operation: "share-add" | "share-end" | "share-remove";
          readonly share?: MockShareGrant;
        }
    ));
export interface PinReplySelector {
  readonly actor: ActorRef;
  readonly object?: ApplicationObject;
  readonly operation: "pin";
}
export function createMutationControls(
  validate: (selector: MutationSelector) => void,
  records: RequestReceipt[] = [],
  validateReply: (selector: MutationReplySelector) => void,
  actorLabel: (actor: ActorRef) => string,
) {
  const receiptGrants = new WeakMap<RequestReceipt, MockShareGrant>();
  const controls = createRequestControls(records, actorLabel, receiptGrants);
  const replies = createRequestControls([], actorLabel, receiptGrants);
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
      if (receipt.committed && replies.takeFailure(receipt)) throw lostReply();
    },
    async collect<T>(
      actor: ActorRef,
      operation: "packed-add" | "upload",
      signal: AbortSignal,
      work: (checkpoint: (bytes: number) => Promise<void>) => Promise<T>,
    ): Promise<T> {
      const receipt = controls.createReceipt(
        actor,
        operation,
        undefined,
        undefined,
        false,
      );
      receipt.stage = "collect";
      try {
        const result = await work(async (bytes) => {
          receipt.bytes = bytes;
          await controls.begin(
            actor,
            operation,
            undefined,
            signal,
            undefined,
            receipt,
          );
        });
        receipt.status = "completed";
        return result;
      } catch (error) {
        receipt.status = signal.aborted ? "cancelled" : "failed";
        throw error;
      }
    },
    control,
  };
}
