import { createMachine, state, transition, reduce, guard } from "robot3";
import { PaymentInfo } from "../types/payment.types";

export interface PaymentContext {
  payment: PaymentInfo | null;
  error: Error | null;
  retryCount: number;
  maxRetries: number;
}

export type PaymentEvent =
  | { type: "START"; error?: never }
  | { type: "PROCESSING"; error?: never }
  | { type: "COMPLETE"; error?: never }
  | { type: "ERROR"; error: Error }
  | { type: "RETRY"; error?: never };

type EventType = PaymentEvent["type"];

export const MAX_RETRIES = Number.MAX_SAFE_INTEGER;

const guards = {
  canRetry: (ctx: PaymentContext) => ctx.retryCount < ctx.maxRetries,
};

const states = {
  idle: state(
    transition<EventType, PaymentContext, PaymentEvent>(
      "START",
      "processing",
      reduce((ctx) => ({
        ...ctx,
        error: null,
        retryCount: 0,
      })),
    ),
  ),

  processing: state(
    transition<EventType, PaymentContext, PaymentEvent>(
      "COMPLETE",
      "completed",
      reduce((ctx) => ({
        ...ctx,
        error: null,
      })),
    ),
    transition<EventType, PaymentContext, PaymentEvent>(
      "ERROR",
      "error",
      reduce((ctx, ev) => ({
        ...ctx,
        error: ev.error || null,
        retryCount: ctx.retryCount + 1,
      })),
    ),
    transition<EventType, PaymentContext, PaymentEvent>(
      "RETRY",
      "processing",
      guard(guards.canRetry),
      reduce((ctx) => ({
        ...ctx,
        error: null,
      })),
    ),
  ),

  error: state(
    transition<EventType, PaymentContext, PaymentEvent>(
      "RETRY",
      "retry",
      guard(guards.canRetry),
      reduce((ctx) => ({
        ...ctx,
        error: null,
      })),
    ),
  ),

  retry: state(
    transition<EventType, PaymentContext, PaymentEvent>(
      "START",
      "processing",
      reduce((ctx) => ({
        ...ctx,
        error: null,
      })),
    ),
  ),

  completed: state(),
};

export const paymentMachine = createMachine(
  "idle",
  states,
  (context?: PaymentContext) => ({
    payment: context?.payment ?? null,
    error: context?.error ?? null,
    retryCount: context?.retryCount ?? 0,
    maxRetries: context?.maxRetries ?? MAX_RETRIES,
  }),
);
