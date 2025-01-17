import { createMachine, invoke, reduce, state, transition } from "robot3";
import {
  BillingInfo,
  Subscription,
  SubscriptionPlan,
} from "../types/subscription.types";
import { PaymentInfo } from "../types/payment.types";
import { BillingContext, billingMachine } from "./billingMachine";

// First, we define our context interface to track all the data our state machine needs
interface SubscriptionContext {
  subscription: Subscription | null;
  selectedPlan: SubscriptionPlan | null;
  billing: BillingInfo | null;
  payment: PaymentInfo | null;
  error: Error | null;
  status: "ACTIVE" | "PENDING" | "CANCELLED" | "PENDING_PAYMENT" | null;
  previousStatus: string | null;
  planChangeHistory: {
    fromPlan: SubscriptionPlan | null;
    toPlan: SubscriptionPlan | null;
    timestamp: number;
  }[];
}

// Guards for subscription state transitions
const guards = {
  canTransitionPlan: (ctx: SubscriptionContext) => {
    if (!ctx.subscription) return true;
    return !["CANCELLED", "PENDING_PAYMENT"].includes(ctx.subscription.status);
  },
  
  isPlanChangeValid: (ctx: SubscriptionContext) => {
    if (!ctx.subscription) return true;
    if (ctx.subscription.status === "CANCELLED") return false;
    return true;
  }
};

type InvokedEvent<T> =
  | { type: "done"; data: T }
  | { type: "error"; error: Error };

// We define all possible events that can occur in our subscription flow
export type SubscriptionEvent =
  | { type: "SUBSCRIPTION_LOADED"; subscription: Subscription }
  | { type: "SELECT_PLAN"; plan: SubscriptionPlan }
  | { type: "CREATE_SUBSCRIPTION" }
  | { type: "UPDATE_SUBSCRIPTION" }
  | { type: "SUBSCRIPTION_CREATED"; subscription: Subscription }
  | { type: "SUBSCRIPTION_UPDATED"; subscription: Subscription }
  | { type: "COMPLETE" }
  | { type: "CANCEL" }
  | { type: "RETRY" }
  | { type: "ERROR"; error: Error }
  | { type: "PAYMENT_COMPLETE"; paymentMethodId: string }
  | { type: "PAYMENT_METHOD_UPDATE_INITIATED" }
  | { type: "PAYMENT_METHOD_UPDATED"; paymentMethodId: string }
  | { type: "EDIT_BILLING" }
  | { type: "BILLING_COMPLETE"; billing: BillingInfo }
  | { type: "BILLING_FAILED"; error: Error }
  | InvokedEvent<BillingContext>;

type EventType = SubscriptionEvent["type"];

const states = {
  // Initial state waits for subscription data to load
  idle: state(
    transition<EventType, SubscriptionContext, SubscriptionEvent>(
      "SUBSCRIPTION_LOADED",
      "loading",
    ),
  ),

  // Loading state handles the initial subscription data
  loading: state(
    transition<EventType, SubscriptionContext, SubscriptionEvent>(
      "SUBSCRIPTION_LOADED",
      "inactive",
      reduce((ctx, ev) => {
        if (ev.type === "SUBSCRIPTION_LOADED") {
          return {
            ...ctx,
            subscription: ev.subscription,
            error: null,
          };
        }
        return ctx;
      }),
    ),
    transition<EventType, SubscriptionContext, SubscriptionEvent>(
      "ERROR",
      "error",
      reduce((ctx, ev) => {
        if (ev.type === "ERROR") {
          return {
            ...ctx,
            error: ev.error,
            subscription: null,
          };
        }
        return ctx;
      }),
    ),
  ),

  // Inactive state allows plan selection
  inactive: state(
    transition<EventType, SubscriptionContext, SubscriptionEvent>(
      "SELECT_PLAN",
      "pending",
      guard(guards.canTransitionPlan),
      guard(guards.isPlanChangeValid),
      reduce((ctx, ev) => {
        if (ev.type === "SELECT_PLAN") {
          return {
            ...ctx,
            selectedPlan: ev.plan,
            error: null,
            previousStatus: ctx.status,
            status: "PENDING",
            planChangeHistory: [...ctx.planChangeHistory, {
              fromPlan: ctx.subscription?.plan ?? null,
              toPlan: ev.plan,
              timestamp: Date.now()
            }]
          };
        }
        return ctx;
      }),
    ),
  ),

  // Pending state handles subscription operations
  pending: state(
    transition<EventType, SubscriptionContext, SubscriptionEvent>(
      "CREATE_SUBSCRIPTION",
      "creating"
    ),
    transition<EventType, SubscriptionContext, SubscriptionEvent>(
      "UPDATE_SUBSCRIPTION", 
      "changing"
    ),
    transition<EventType, SubscriptionContext, SubscriptionEvent>(
      "EDIT_BILLING",
      "editingBilling"
    ),
  ),

  // Creating new subscription
  creating: state(
    transition<EventType, SubscriptionContext, SubscriptionEvent>(
      "SUBSCRIPTION_CREATED",
      "active",
      reduce((ctx, ev) => ({
        ...ctx,
        subscription: ev.subscription,
        selectedPlan: null,
        error: null
      }))
    ),
    transition<EventType, SubscriptionContext, SubscriptionEvent>(
      "ERROR",
      "error",
      reduce((ctx, ev) => ({
        ...ctx,
        error: ev.error,
        subscription: null
      }))
    )
  ),

  // Changing existing subscription
  changing: state(
    transition<EventType, SubscriptionContext, SubscriptionEvent>(
      "SUBSCRIPTION_UPDATED",
      "active",
      reduce((ctx, ev) => ({
        ...ctx,
        subscription: ev.subscription,
        selectedPlan: null,
        error: null
      }))
    ),
    transition<EventType, SubscriptionContext, SubscriptionEvent>(
      "ERROR",
      "error",
      reduce((ctx, ev) => ({
        ...ctx,
        error: ev.error
      }))
    )
  ),

  // Editing billing information invokes the billing machine
  editingBilling: invoke(
    billingMachine,
    transition<EventType, SubscriptionContext, SubscriptionEvent>(
      "done",
      "pendingPayment",
      reduce((ctx, ev) => {
        if (ev.type === "done") {
          return {
            ...ctx,
            billing: ev.data.billing,
            error: null,
          };
        }
        return ctx;
      }),
    ),
  ),

  // Payment processing state
  pendingPayment: state(
    transition<EventType, SubscriptionContext, SubscriptionEvent>(
      "PAYMENT_COMPLETE",
      "active",
      reduce((ctx, ev) => {
        if (ev.type === "PAYMENT_COMPLETE") {
          return {
            ...ctx,
            payment: ctx.payment
              ? {
                  ...ctx.payment,
                  paymentMethodId: ev.paymentMethodId,
                }
              : null,
            error: null,
          };
        }
        return ctx;
      }),
    ),
  ),

  // Active subscription state handles plan changes and cancellation
  active: state(
    transition<EventType, SubscriptionContext, SubscriptionEvent>(
      "SELECT_PLAN",
      "pending",
      reduce((ctx, ev) => {
        if (ev.type === "SELECT_PLAN") {
          return {
            ...ctx,
            selectedPlan: ev.plan,
          };
        }
        return ctx;
      }),
    ),
    transition<EventType, SubscriptionContext, SubscriptionEvent>(
      "PAYMENT_METHOD_UPDATE_INITIATED",
      "updatingPayment",
    ),
    transition<EventType, SubscriptionContext, SubscriptionEvent>(
      "CANCEL",
      "cancelled",
    ),
  ),

  // Payment method update state
  updatingPayment: state(
    transition<EventType, SubscriptionContext, SubscriptionEvent>(
      "PAYMENT_METHOD_UPDATED",
      "active",
      reduce((ctx, ev) => {
        if (ev.type === "PAYMENT_METHOD_UPDATED") {
          return {
            ...ctx,
            payment: ctx.payment
              ? {
                  ...ctx.payment,
                  paymentMethodId: ev.paymentMethodId,
                }
              : null,
          };
        }
        return ctx;
      }),
    ),
  ),

  // Cancelled subscription state
  cancelled: state(
    transition<EventType, SubscriptionContext, SubscriptionEvent>(
      "REACTIVATE",
      "pending",
    ),
  ),

  // Error handling state with recovery
  error: state(
    transition<EventType, SubscriptionContext, SubscriptionEvent>(
      "RETRY",
      "pending",
      reduce((ctx) => ({
        ...ctx,
        error: null,
        payment: null,
        status: ctx.previousStatus,
      })),
    ),
  ),
} as const;

// Create our subscription machine with initial context
// Guards for subscription state transitions
const guards = {
  canTransitionPlan: (ctx: SubscriptionContext) => {
    if (!ctx.subscription) return true;
    return !["CANCELLED", "PENDING_PAYMENT"].includes(ctx.subscription.status);
  },
  
  isPlanChangeValid: (ctx: SubscriptionContext) => {
    if (!ctx.subscription) return true;
    if (ctx.subscription.status === "CANCELLED") return false;
    return true;
  }
};

export const subscriptionMachine = createMachine(
  "idle",
  states,
  (context?: SubscriptionContext) => ({
    subscription: context?.subscription ?? null,
    selectedPlan: context?.selectedPlan ?? null,
    billing: context?.billing ?? null,
    payment: context?.payment ?? null,
    error: context?.error ?? null,
    status: context?.status ?? null,
    previousStatus: context?.previousStatus ?? null,
    planChangeHistory: context?.planChangeHistory ?? [],
  }),
);
