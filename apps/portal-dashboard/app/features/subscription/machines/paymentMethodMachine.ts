import { createMachine, state, transition, reduce } from "robot3";

export interface PaymentMethodContext {
  clientSecret: string | null;
  paymentMethodId: string | null;
  error: Error | null;
}

export type PaymentMethodEvent =
  | { type: "START"; clientSecret: string }
  | { type: "PROCESSING" }
  | { type: "COMPLETE"; paymentMethodId: string }
  | { type: "ERROR"; error: Error }
  | { type: "RETRY" };

type EventType = PaymentMethodEvent["type"];

const states = {
  idle: state(
    transition<EventType, PaymentMethodContext, PaymentMethodEvent>(
      "START",
      "processing",
      reduce((ctx, ev) => ({
        ...ctx,
        clientSecret: ev.clientSecret,
        error: null,
      }))
    )
  ),

  processing: state(
    transition<EventType, PaymentMethodContext, PaymentMethodEvent>(
      "COMPLETE",
      "completed",
      reduce((ctx, ev) => ({
        ...ctx,
        paymentMethodId: ev.paymentMethodId,
        error: null,
      }))
    ),
    transition<EventType, PaymentMethodContext, PaymentMethodEvent>(
      "ERROR",
      "failed",
      reduce((ctx, ev) => ({
        ...ctx,
        error: ev.error,
      }))
    )
  ),

  failed: state(
    transition<EventType, PaymentMethodContext, PaymentMethodEvent>(
      "RETRY",
      "retrying",
      guard((ctx) => !!ctx.clientSecret),
      reduce((ctx) => ({
        ...ctx,
        error: null,
      }))
    )
  ),

  retrying: state(
    transition<EventType, PaymentMethodContext, PaymentMethodEvent>(
      "PROCESSING",
      "processing"
    )
  ),

  completed: state()
} as const;

// Create our payment method machine with initial context
export const paymentMethodMachine = createMachine(
  "idle",
  states,
  (context?: PaymentMethodContext) => ({
    clientSecret: context?.clientSecret ?? null,
    paymentMethodId: context?.paymentMethodId ?? null,
    error: context?.error ?? null,
  }),
);
