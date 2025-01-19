import { createMachine, state, transition, reduce, guard } from "robot3";
import { PaymentInfo } from "../types/payment.types";

interface PaymentContext {
  payment: PaymentInfo | null;
  error: Error | null;
  retryCount: number;
  maxRetries: number;
}

export type PaymentEvent =
  | { type: "START" }
  | { type: "PROCESSING" }
  | { type: "COMPLETE" }
  | { type: "ERROR"; error: Error }
  | { type: "RETRY" };

type EventType = PaymentEvent["type"];

export const MAX_RETRIES = 3;

const guards = {
  canRetry: (ctx: PaymentContext) => ctx.retryCount < ctx.maxRetries
};

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
    ),
    transition<EventType, PaymentContext, PaymentEvent>(
      "RETRY",
      "retrying",
      guard(guards.canRetry),
      reduce((ctx) => ({
        ...ctx,
        error: null
      }))
    )
  ),

  error: state(
    transition<EventType, PaymentContext, PaymentEvent>(
      "RETRY",
      "processing",
      guard(guards.canRetry),
      reduce((ctx) => ({
        ...ctx,
        error: null
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
