import { createMachine, state, transition, reduce } from "robot3";
import { BillingInfo, BillingErrors } from "../types/billing.types";

export interface BillingContext {
  billing: BillingInfo | null;
  errors: BillingErrors | null;
  error: Error | null;
  currentState: keyof BillingState;
}

export type BillingEvent =
  | { type: "EDIT" }
  | { type: "VALIDATE"; billing: BillingInfo }
  | { type: "VALIDATED" }
  | { type: "VALIDATION_FAILED"; errors: BillingErrors }
  | { type: "SAVE" }
  | { type: "SAVED" }
  | { type: "SAVE_ERROR"; error: Error };

export type BillingState = {
  idle: { type: 'idle' };
  editing: { type: 'editing' };
  validating: { type: 'validating' };
  saving: { type: 'saving' };
  complete: { type: 'complete' };
  error: { type: 'error' };
};

type BillingReducer<E extends BillingEvent> = (
  context: BillingContext,
  event: E
) => Partial<BillingContext>;

export const billingMachine = createMachine<BillingContext, BillingEvent, BillingState>(
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
        reduce((ctx) => ({ ...ctx, errors: null })),
      ),
      transition(
        "VALIDATION_FAILED",
        "editing",
        reduce((ctx, ev: Extract<BillingEvent, { type: "VALIDATION_FAILED" }>) => ({
          ...ctx,
          errors: ev.errors
        })),
      ),
      transition(
        "SAVE_ERROR",
        "error",
        reduce((ctx, ev: Extract<BillingEvent, { type: "SAVE_ERROR" }>) => ({
          ...ctx,
          error: ev.error
        })),
      ),
    ),

    saving: state(
      transition(
        "SAVED",
        "complete",
        reduce((ctx) => ({ ...ctx, error: null })),
      ),
      transition(
        "SAVE_ERROR",
        "error",
        reduce((ctx, ev: Extract<BillingEvent, { type: "SAVE_ERROR" }>) => ({
          ...ctx,
          error: ev.error
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
    currentState: 'idle'
  }),
);
