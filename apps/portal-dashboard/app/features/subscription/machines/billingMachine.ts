import { createMachine, state, transition, reduce } from "robot3";
import { BillingInfo, BillingErrors } from "../types/billing.types";

interface BillingContext {
  billing: BillingInfo | null;
  errors: BillingErrors | null;
  error: Error | null;
}

type BillingEvent =
  | { type: "EDIT" }
  | { type: "VALIDATE"; billing: BillingInfo }
  | { type: "VALIDATED" }
  | { type: "VALIDATION_FAILED"; errors: BillingErrors }
  | { type: "SAVE" }
  | { type: "SAVED" }
  | { type: "ERROR"; error: Error };

export const billingMachine = createMachine<BillingContext, BillingEvent>(
  {
    idle: state(transition("EDIT", "editing")),

    editing: state(
      transition(
        "VALIDATE",
        "validating",
        reduce((ctx, ev) => ({
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
        reduce((ctx) => ({ ...ctx, errors: null })),
      ),
      transition(
        "VALIDATION_FAILED",
        "editing",
        reduce((ctx, ev) => ({ ...ctx, errors: ev.errors })),
      ),
      transition(
        "ERROR",
        "error",
        reduce((ctx, ev) => ({ ...ctx, error: ev.error })),
      ),
    ),

    saving: state(
      transition(
        "SAVED",
        "complete",
        reduce((ctx) => ({ ...ctx, error: null })),
      ),
      transition(
        "ERROR",
        "error",
        reduce((ctx, ev) => ({ ...ctx, error: ev.error })),
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
  }),
);
