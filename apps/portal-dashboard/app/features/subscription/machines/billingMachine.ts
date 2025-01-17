import { createMachine, state, transition, reduce } from "robot3";
import { BillingInfo, BillingErrors } from "../types/billing.types";

export type BillingStateValue = 
  | 'idle'
  | 'editing'
  | 'validating'
  | 'saving'
  | 'complete'
  | 'error';

export type BillingContext = {
  billing: BillingInfo | null;
  errors: BillingErrors | null;
  error: Error | null;
  state: BillingStateValue;
};

export type BillingEvent =
  | { type: "EDIT" }
  | { type: "VALIDATE"; billing: BillingInfo }
  | { type: "VALIDATED" }
  | { type: "INVALID"; errors: BillingErrors }
  | { type: "SAVE" }
  | { type: "SAVED" }
  | { type: "FAILED"; error: Error };

export interface BillingStates {
  idle: {};
  editing: {};
  validating: {};
  saving: {};
  complete: {};
  error: {};
}

export const billingMachine = createMachine<BillingContext, BillingEvent, BillingStates>(
  {
    idle: state(transition("EDIT", "editing")),

    editing: state(
      transition(
        "VALIDATE",
        "validating",
        reduce((ctx, ev: Extract<BillingEvent, { type: "VALIDATE" }>) => ({
          ...ctx,
          billing: ev.billing,
          errors: null,
          error: null,
        })),
      ),
    ),

    validating: state(
      transition(
        "VALIDATED",
        "saving",
        reduce((ctx) => ({
          ...ctx,
          errors: null,
          state: 'saving'
        })),
      ),
      transition(
        "INVALID",
        "editing",
        reduce((ctx, ev: Extract<BillingEvent, { type: "INVALID" }>) => ({
          ...ctx,
          errors: ev.errors,
          state: 'editing'
        })),
      ),
    ),

    saving: state(
      transition(
        "SAVED",
        "complete",
        reduce((ctx) => ({
          ...ctx,
          error: null,
          state: 'complete'
        })),
      ),
      transition(
        "FAILED",
        "error",
        reduce((ctx, ev: Extract<BillingEvent, { type: "FAILED" }>) => ({
          ...ctx,
          error: ev.error,
          state: 'error'
        })),
      ),
    ),

    complete: state(transition("EDIT", "editing")),

    error: state(
      transition(
        "EDIT",
        "editing",
        reduce((ctx) => ({ ...ctx, error: null })),
      ),
    ),
  },
  () => ({
    billing: null,
    errors: null,
    error: null,
    state: 'idle'
  }),
);
