import { createMachine, state, transition, reduce } from "robot3";
import { BillingInfo, BillingErrors } from "../types/billing.types";

// The context only needs to track the core billing process state
export interface BillingContext {
  billing: BillingInfo | null;
  errors: BillingErrors | null;
  error: Error | null;
}

// These events represent the core billing process transitions
export type BillingEvent =
  | { type: "VALIDATE"; billing: BillingInfo }
  | { type: "VALIDATED" }
  | { type: "INVALID"; errors: BillingErrors }
  | { type: "SAVE" }
  | { type: "SAVED" }
  | { type: "FAILED"; error: Error };

type EventType = BillingEvent["type"];

const states = {
  idle: state(
    transition<EventType, BillingContext, BillingEvent>(
      "VALIDATE",
      "validating",
      reduce((ctx, ev) => {
        if (ev.type === "VALIDATE") {
          return {
            ...ctx,
            billing: ev.billing,
            errors: null,
            error: null
          };
        }
        return ctx;
      }),
    ),
  ),
  validating: state(
    transition<EventType, BillingContext, BillingEvent>("VALIDATED", "saving"),
    transition<EventType, BillingContext, BillingEvent>(
      "INVALID",
      "idle",
      reduce((ctx, ev) => {
        if (ev.type === "INVALID") {
          return {
            ...ctx,
            errors: ev.errors,
          };
        }
        return ctx;
      }),
    ),
  ),

  saving: state(
    transition<EventType, BillingContext, BillingEvent>(
      "SAVED",
      "complete",
      reduce((ctx) => ({
        ...ctx,
        error: null,
      })),
    ),
    transition<EventType, BillingContext, BillingEvent>(
      "FAILED",
      "error",
      reduce((ctx, ev) => {
        // Type narrowing - we know this is a FAILED event with error property
        if (ev.type === "FAILED") {
          return {
            ...ctx,
            error: ev.error,
          };
        }
        return ctx;
      }),
    ),
  ),

  complete: state(),

  error: state(
    transition<EventType, BillingContext, BillingEvent>(
      "VALIDATE",
      "validating",
      reduce((ctx, ev) => {
        if (ev.type === "VALIDATE") {
          return {
            ...ctx,
            billing: ev.billing,
            errors: null,
            error: null
          };
        }
        return ctx;
      }),
    ),
  ),
} as const;

export const billingMachine = createMachine(
  "idle",
  states,
  (context?: BillingContext) => ({
    billing: context?.billing ?? null,
    errors: context?.errors ?? null,
    error: context?.error ?? null,
  }),
);
