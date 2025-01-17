import { createMachine, state, transition, reduce } from "robot3";

// First, we define our context to track payment processing state
export interface PaymentMethodContext {
  clientSecret: string | null;
  paymentMethodId: string | null;
  error: Error | null;
}

// Define all possible events in our payment method flow
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
  // Initial state waiting for initialization
  idle: state(
    transition<EventType, PaymentMethodContext, PaymentMethodEvent>(
      "INITIALIZE",
      "initializing",
      // Clear any previous state when starting fresh
      reduce((ctx) => ({
        ...ctx,
        clientSecret: null,
        paymentMethodId: null,
        error: null,
      })),
    ),
  ),

  // Initialize payment session with payment provider
  initializing: state(
    transition<EventType, PaymentMethodContext, PaymentMethodEvent>(
      "INITIALIZED",
      "collecting",
      reduce((ctx, ev) => {
        if (ev.type === "INITIALIZED") {
          return {
            ...ctx,
            clientSecret: ev.clientSecret,
            error: null,
          };
        }
        return ctx;
      }),
    ),
    // Handle initialization failures
    transition<EventType, PaymentMethodContext, PaymentMethodEvent>(
      "ERROR",
      "error",
      reduce((ctx, ev) => {
        if (ev.type === "ERROR") {
          return {
            ...ctx,
            error: ev.error,
            clientSecret: null,
          };
        }
        return ctx;
      }),
    ),
  ),

  // Collect payment method details from user
  collecting: state(
    transition<EventType, PaymentMethodContext, PaymentMethodEvent>(
      "VALIDATE",
      "validating",
    ),
  ),

  // Validate payment method with payment provider
  validating: state(
    transition<EventType, PaymentMethodContext, PaymentMethodEvent>(
      "VALIDATED",
      "saving",
      reduce((ctx, ev) => {
        if (ev.type === "VALIDATED") {
          return {
            ...ctx,
            paymentMethodId: ev.paymentMethodId,
            error: null,
          };
        }
        return ctx;
      }),
    ),
    // Handle validation failures
    transition<EventType, PaymentMethodContext, PaymentMethodEvent>(
      "ERROR",
      "error",
      reduce((ctx, ev) => {
        if (ev.type === "ERROR") {
          return {
            ...ctx,
            error: ev.error,
            paymentMethodId: null,
          };
        }
        return ctx;
      }),
    ),
  ),

  // Save validated payment method
  saving: state(
    transition<EventType, PaymentMethodContext, PaymentMethodEvent>(
      "SAVED",
      "complete",
      reduce((ctx) => ({
        ...ctx,
        error: null,
      })),
    ),
    // Handle saving failures
    transition<EventType, PaymentMethodContext, PaymentMethodEvent>(
      "ERROR",
      "error",
      reduce((ctx, ev) => {
        if (ev.type === "ERROR") {
          return {
            ...ctx,
            error: ev.error,
          };
        }
        return ctx;
      }),
    ),
  ),

  // Successfully completed payment method processing
  complete: state(),

  // Error handling state
  error: state(
    transition<EventType, PaymentMethodContext, PaymentMethodEvent>(
      "INITIALIZE",
      "initializing",
      reduce((ctx) => ({
        ...ctx,
        error: null,
        clientSecret: null,
        paymentMethodId: null,
      })),
    ),
  ),
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
