import { createMachine, state, transition, reduce } from "robot3";
import { BillingInfo, BillingErrors } from "../types/billing.types";

export interface BillingContext {
  billing: BillingInfo | null;
  errors: BillingErrors | null;
  error: Error | null;
}

export type BillingEvent =
  | { type: "EDIT" }
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
      "EDIT",
      "editing"
    )
  ),

  editing: state(
    transition<EventType, BillingContext, BillingEvent>(
      "VALIDATE",
      "validating",
      reduce((ctx, ev) => ({ ...ctx, billing: ev.billing }))
    )
  ),

  validating: state(
    transition<EventType, BillingContext, BillingEvent>(
      "VALIDATED",
      "saving"
    )
  ),

  saving: state(
    transition<EventType, BillingContext, BillingEvent>(
      "SAVED",
      "complete",
      reduce((ctx) => ({ ...ctx, error: null }))
    )
  ),

  complete: state(
    transition<EventType, BillingContext, BillingEvent>(
      "EDIT",
      "editing"
    )
  ),

  error: state(
    transition<EventType, BillingContext, BillingEvent>(
      "EDIT", 
      "editing",
      reduce((ctx) => ({ ...ctx, error: null }))
    )
  )
} as const;

export const billingMachine = createMachine(
  "idle",
  states,
  (context?: BillingContext) => ({
    billing: context?.billing ?? null,
    errors: context?.errors ?? null, 
    error: context?.error ?? null
  })
);
