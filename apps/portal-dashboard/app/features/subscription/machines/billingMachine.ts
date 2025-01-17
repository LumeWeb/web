import { createMachine, state, transition, reduce, Transition } from "robot3";
import { BillingInfo, BillingErrors } from "../types/billing.types";

// Context just holds the data
export interface BillingContext {
  billing: BillingInfo | null;
  errors: BillingErrors | null;
  error: Error | null;
}

// Events define allowed transitions
export type BillingEvent =
  | { type: "EDIT" }
  | { type: "VALIDATE"; billing: BillingInfo }
  | { type: "VALIDATED" }
  | { type: "INVALID"; errors: BillingErrors }
  | { type: "SAVE" }
  | { type: "SAVED" }
  | { type: "FAILED"; error: Error };

// States define the machine structure
export interface BillingStates {
  idle: {
    final: false;
    transitions: Map<string, Array<Transition<string>>>;
  };
  editing: {
    final: false;
    transitions: Map<string, Array<Transition<string>>>;
  };
  validating: {
    final: false;
    transitions: Map<string, Array<Transition<string>>>;
  };
  saving: {
    final: false;
    transitions: Map<string, Array<Transition<string>>>;
  };
  complete: {
    final: true;
    transitions: Map<string, Array<Transition<string>>>;
  };
  error: {
    final: false;
    transitions: Map<string, Array<Transition<string>>>;
  };
}

export const billingMachine = createMachine<
  BillingContext,
  BillingEvent,
  BillingStates
>(
  {
    idle: state(transition("EDIT", "editing")),

    editing: state(
      transition(
        "VALIDATE",
        "validating",
        reduce((ctx, ev: Extract<BillingEvent, { type: "VALIDATE" }>) => ({
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
        })),
      ),
      transition(
        "INVALID",
        "editing",
        reduce((ctx, ev: Extract<BillingEvent, { type: "INVALID" }>) => ({
          ...ctx,
          errors: ev.errors,
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
        })),
      ),
      transition(
        "FAILED",
        "error",
        reduce((ctx, ev: Extract<BillingEvent, { type: "FAILED" }>) => ({
          ...ctx,
          error: ev.error,
        })),
      ),
    ),

    complete: state(transition("EDIT", "editing")),

    error: state(
      transition(
        "EDIT",
        "editing",
        reduce((ctx) => ({
          ...ctx,
          error: null,
        })),
      ),
    ),
  },
  () => ({
    billing: null,
    errors: null,
    error: null,
  }),
);
