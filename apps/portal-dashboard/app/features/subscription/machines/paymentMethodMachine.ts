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

type EventType = PaymentMethodEvent["type"];

const states = {
  idle: state(
    transition<EventType, PaymentMethodContext, PaymentMethodEvent>(
      "INITIALIZE",
      "initializing"
    )
  ),

  initializing: state(
    transition<EventType, PaymentMethodContext, PaymentMethodEvent>(
      "INITIALIZED",
      "collecting",
      reduce((ctx, ev) => ({
        ...ctx,
        clientSecret: ev.clientSecret,
        error: null,
      }))
    )
  ),

  collecting: state(
    transition<EventType, PaymentMethodContext, PaymentMethodEvent>(
      "VALIDATE",
      "validating"
    )
  ),

  validating: state(
    transition<EventType, PaymentMethodContext, PaymentMethodEvent>(
      "VALIDATED", 
      "saving",
      reduce((ctx, ev) => ({
        ...ctx,
        paymentMethodId: ev.paymentMethodId,
        error: null,
      }))
    )
  ),

  saving: state(
    transition<EventType, PaymentMethodContext, PaymentMethodEvent>(
      "SAVED",
      "complete",
      reduce((ctx) => ({ ...ctx, error: null }))
    )
  ),

  complete: state(),

  error: state(
    transition<EventType, PaymentMethodContext, PaymentMethodEvent>(
      "INITIALIZE",
      "initializing",
      reduce((ctx) => ({ ...ctx, error: null }))
    )
  )
} as const;

export const paymentMethodMachine = createMachine(
  "idle",
  states,
  (context?: PaymentMethodContext) => ({
    clientSecret: context?.clientSecret ?? null,
    paymentMethodId: context?.paymentMethodId ?? null,
    error: context?.error ?? null
  })
);
