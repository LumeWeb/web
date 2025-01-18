import { createMachine, state, transition, reduce } from "robot3";
import { PaymentInfo } from "../types/payment.types";

interface PaymentContext {
  payment: PaymentInfo | null;
  error: Error | null;
  retryCount: number;
}

export type PaymentEvent =
  | { type: "START" }
  | { type: "PROCESSING" }
  | { type: "COMPLETE" }
  | { type: "ERROR"; error: Error }
  | { type: "RETRY" };

type EventType = PaymentEvent["type"];

const states = {
  idle: state(
    transition<EventType, PaymentContext, PaymentEvent>(
      "START",
      "processing",
      reduce((ctx) => ({
        ...ctx,
        error: null,
        retryCount: 0
      }))
    )
  ),

  processing: state(
    transition<EventType, PaymentContext, PaymentEvent>(
      "COMPLETE",
      "completed",
      reduce((ctx) => ({
        ...ctx,
        error: null
      }))
    ),
    transition<EventType, PaymentContext, PaymentEvent>(
      "ERROR",
      "error",
      reduce((ctx, ev) => ({
        ...ctx,
        error: ev.error,
        retryCount: ctx.retryCount + 1
      }))
    )
  ),

  error: state(
    transition<EventType, PaymentContext, PaymentEvent>(
      "RETRY",
      "processing",
      reduce((ctx) => ({
        ...ctx,
        error: null
      }))
    ),
    transition<EventType, PaymentContext, PaymentEvent>(
      "ERROR",
      "error",
      reduce((ctx, ev) => ({
        ...ctx,
        error: ev.error,
        retryCount: ctx.retryCount + 1
      }))
    )
  ),

  completed: state()
};

export const paymentMachine = createMachine(
  "idle",
  states,
  (context?: PaymentContext) => ({
    payment: context?.payment ?? null,
    error: context?.error ?? null,
    retryCount: context?.retryCount ?? 0
  })
);
