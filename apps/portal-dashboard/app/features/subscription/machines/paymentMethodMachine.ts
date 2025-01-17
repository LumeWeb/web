import { createMachine, state, transition, reduce } from "robot3";

export interface PaymentMethodContext {
  clientSecret: string | null;
  paymentMethodId: string | null;
  error: Error | null;
}

export type PaymentMethodEvent =
  | { type: "INITIALIZE" }
  | { type: "INITIALIZED"; clientSecret: string }
  | { type: "COLLECT" }
  | { type: "VALIDATE" }
  | { type: "VALIDATED"; paymentMethodId: string }
  | { type: "SAVE" }
  | { type: "SAVED" }
  | { type: "ERROR"; error: Error };

export const paymentMethodMachine = createMachine<
  PaymentMethodContext,
  PaymentMethodEvent
>(
  {
    idle: state(transition("INITIALIZE", "initializing")),

    initializing: state(
      transition(
        "INITIALIZED",
        "collecting",
        reduce((ctx, ev) => ({
          ...ctx,
          clientSecret: ev.clientSecret,
          error: null,
        })),
      ),
      transition(
        "ERROR",
        "error",
        reduce((ctx, ev) => ({ ...ctx, error: ev.error })),
      ),
    ),

    collecting: state(transition("VALIDATE", "validating")),

    validating: state(
      transition(
        "VALIDATED",
        "saving",
        reduce((ctx, ev) => ({
          ...ctx,
          paymentMethodId: ev.paymentMethodId,
          error: null,
        })),
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

    complete: state(),

    error: state(
      transition(
        "INITIALIZE",
        "initializing",
        reduce((ctx) => ({ ...ctx, error: null })),
      ),
    ),
  },
  () => ({
    clientSecret: null,
    paymentMethodId: null,
    error: null,
  }),
);
