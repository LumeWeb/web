import {
  createMachine,
  guard,
  interpret,
  reduce,
  state,
  transition,
} from "robot3";
import {
  BillingInfo,
  Subscription,
  SubscriptionPlan,
} from "../types/subscription.types";
import { billingMachine } from "@/features/subscription/machines/billingMachine";
import { SubscriptionPlanStatus } from "portal-shared/dataProviders/accountProvider";

type SubscriptionStatus =
  | "ACTIVE"
  | "PENDING"
  | "PENDING_PAYMENT"
  | "CANCELING"
  | SubscriptionPlanStatus;

export interface SubscriptionContext {
  subscription: Subscription | null;
  selectedPlan: SubscriptionPlan | null;
  billing: BillingInfo | null;
  error: Error | null;
  status: SubscriptionStatus | null;
  payment: {
    client_secret?: string;
    publishable_key?: string;
    expires_at?: string;
  } | null;
  refresh?: boolean;
}

// Guards for subscription state transitions
const guards = {
  canTransitionPlan: (ctx: SubscriptionContext) => {
    if (!ctx.subscription) return true;
    return ctx.subscription.status !== "CANCELLED";
  },
  hasBillingOrFree: (ctx: SubscriptionContext, ev: SubscriptionEvent) => {
    if (ev.type === "SELECT_PLAN") {
      return ev.plan.is_free || !!ctx.billing;
    }
    return false;
  },
};

export type SubscriptionEvent =
  | { type: "SUBSCRIPTION_LOADED"; subscription: Subscription }
  | { type: "BILLING_VALID"; billing: BillingInfo }
  | { type: "SELECT_PLAN"; plan: SubscriptionPlan }
  | { type: "CANCEL_PLAN_SELECTION" }
  | { type: "CREATE_SUBSCRIPTION" }
  | { type: "UPDATE_SUBSCRIPTION" }
  | { type: "SUBSCRIPTION_CREATED"; subscription: Subscription }
  | { type: "SUBSCRIPTION_UPDATED"; subscription: Subscription }
  | { type: "RETRY" }
  | { type: "ERROR"; error: Error }
  | { type: "PAYMENT_COMPLETE" }
  | { type: "TRIGGER_PAYMENT" }
  | { type: "PAYMENT_CLOSE" }
  | { type: "CANCEL_SUBSCRIPTION" }
  | { type: "SUBSCRIPTION_CANCELED" }
  | { type: "ABORT_CANCELLATION" };

type EventType = SubscriptionEvent["type"];

const states = {
  // Initial state, waiting for subscription data
  idle: state(
    transition<EventType, SubscriptionContext, SubscriptionEvent>(
      "SUBSCRIPTION_LOADED",
      "active",
      guard((ctx, ev) => {
        return (
          ev.type === "SUBSCRIPTION_LOADED" &&
          ev.subscription?.status === "ACTIVE"
        );
      }),
      reduce((ctx, ev) => {
        if (ev.type === "SUBSCRIPTION_LOADED") {
          return {
            ...ctx,
            subscription: ev.subscription,
            billing: ev.subscription.billing ?? null,
            error: null,
          };
        }
        return ctx;
      }),
    ),
    transition<EventType, SubscriptionContext, SubscriptionEvent>(
      "SUBSCRIPTION_LOADED",
      "pending",
      guard((ctx, ev) => {
        return (
          ev.type === "SUBSCRIPTION_LOADED" &&
          ev.subscription?.status === "PENDING" &&
          ev.subscription?.plan?.is_free === false &&
          !!ev.subscription.payment?.client_secret &&
          !!ev.subscription.plan?.id
        );
      }),
      reduce((ctx, ev) => {
        if (ev.type === "SUBSCRIPTION_LOADED") {
          return {
            ...ctx,
            subscription: ev.subscription,
            billing: ev.subscription.billing ?? null,
            payment: ev.subscription.payment ?? null,
            error: null,
            status: "PENDING",
            selectedPlan: null,
            refresh: false,
          };
        }
        return ctx;
      }),
    ),
    transition<EventType, SubscriptionContext, SubscriptionEvent>(
      "SUBSCRIPTION_LOADED",
      "inactive",
      reduce((ctx, ev) => {
        if (ev.type === "SUBSCRIPTION_LOADED") {
          return {
            ...ctx,
            subscription: ev.subscription,
            billing: ev.subscription.billing ?? null,
            error: null,
          };
        }
        return ctx;
      }),
    ),
  ),

  // No active subscription
  inactive: state(
    transition<EventType, SubscriptionContext, SubscriptionEvent>(
      "SELECT_PLAN",
      "pending",
      guard(guards.hasBillingOrFree),
      reduce((ctx, ev) => {
        if (ev.type === "SELECT_PLAN") {
          return {
            ...ctx,
            selectedPlan: ev.plan,
            status: "PENDING",
            refresh: false
          };
        }
        return ctx;
      }),
    ),
    transition<EventType, SubscriptionContext, SubscriptionEvent>(
      "BILLING_VALID",
      "inactive",
      reduce((ctx, ev) => {
        if (ev.type === "BILLING_VALID") {
          return {
            ...ctx,
            billing: ev.billing,
          };
        }
        return ctx;
      }),
    ),
  ),

  // Plan selected, waiting for confirmation
  pending: state(
    transition<EventType, SubscriptionContext, SubscriptionEvent>(
      "SUBSCRIPTION_LOADED",
      "active",
      guard((ctx, ev) => {
        return (
          ev.type === "SUBSCRIPTION_LOADED" &&
          ev.subscription?.status === "ACTIVE"
        );
      }),
      reduce((ctx, ev) => {
        if (ev.type === "SUBSCRIPTION_LOADED") {
          return {
            ...ctx,
            subscription: ev.subscription,
            billing: ev.subscription.billing ?? null,
            selectedPlan: null,
            error: null,
          };
        }
        return ctx;
      }),
    ),
    transition<EventType, SubscriptionContext, SubscriptionEvent>(
      "TRIGGER_PAYMENT",
      "pendingPayment",
      reduce((ctx) => ({
        ...ctx,
        status: "PENDING_PAYMENT",
      })),
    ),
    transition<EventType, SubscriptionContext, SubscriptionEvent>(
      "SELECT_PLAN",
      "pending",
      guard(guards.canTransitionPlan),
      guard(guards.hasBillingOrFree),
      reduce((ctx, ev) => {
        if (ev.type === "SELECT_PLAN") {
          return {
            ...ctx,
            selectedPlan: ev.plan,
            status: "PENDING",
          };
        }
        return ctx;
      }),
    ),
    transition<EventType, SubscriptionContext, SubscriptionEvent>(
      "CREATE_SUBSCRIPTION",
      "creating",
    ),
    transition<EventType, SubscriptionContext, SubscriptionEvent>(
      "UPDATE_SUBSCRIPTION",
      "changing",
    ),
    transition<EventType, SubscriptionContext, SubscriptionEvent>(
      "CANCEL_PLAN_SELECTION",
      "inactive",
      reduce((ctx) => ({
        ...ctx,
        selectedPlan: null,
        status: ctx.subscription?.status || null,
      })),
    ),
    transition<EventType, SubscriptionContext, SubscriptionEvent>(
      "BILLING_VALID",
      "pending",
      reduce((ctx, ev) => {
        if (ev.type === "BILLING_VALID") {
          return {
            ...ctx,
            billing: ev.billing,
          };
        }
        return ctx;
      }),
    ),
    transition<EventType, SubscriptionContext, SubscriptionEvent>(
      "CANCEL_SUBSCRIPTION",
      "canceling",
      reduce((ctx) => ({
        ...ctx,
        status: "CANCELING",
      })),
    ),
    transition<EventType, SubscriptionContext, SubscriptionEvent>(
      "ABORT_CANCELLATION",
      "idle",
      reduce((ctx) => ({
        ...ctx,
        subscription: null,
        selectedPlan: null,
        status: null,
        payment: null,
        error: null,
        refresh: false
      })),
    ),
  ),

  // Creating new subscription
  creating: state(
    transition<EventType, SubscriptionContext, SubscriptionEvent>(
      "SUBSCRIPTION_CREATED",
      "pendingPayment",
      guard((ctx, ev) => {
        if (ev.type === "SUBSCRIPTION_CREATED") {
          return ev.subscription?.plan?.is_free === false;
        }
        return false;
      }),
      reduce((ctx, ev) => {
        if (ev.type === "SUBSCRIPTION_CREATED") {
          return {
            ...ctx,
            subscription: ev.subscription,
            selectedPlan: null,
            status: "PENDING",
            payment: ev.subscription.payment ?? null,
            billing: ctx.billing,
            error: ctx.error,
          };
        }
        return ctx;
      }),
    ),
    transition<EventType, SubscriptionContext, SubscriptionEvent>(
      "SUBSCRIPTION_CREATED",
      "active",
      guard((ctx, ev) => {
        if (ev.type === "SUBSCRIPTION_CREATED") {
          return ev.subscription?.plan?.is_free === true;
        }
        return false;
      }),
      reduce((ctx, ev) => {
        if (ev.type === "SUBSCRIPTION_CREATED") {
          return {
            ...ctx,
            subscription: ev.subscription,
            selectedPlan: null,
            status: "ACTIVE",
            refresh: false
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
          };
        }
        return ctx;
      }),
    ),
  ),

  // Changing existing subscription
  changing: state(
    transition<EventType, SubscriptionContext, SubscriptionEvent>(
      "SUBSCRIPTION_UPDATED",
      "active",
      reduce((ctx, ev) => {
        if (ev.type === "SUBSCRIPTION_UPDATED") {
          return {
            ...ctx,
            subscription: ev.subscription,
            selectedPlan: null,
            status: "ACTIVE",
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
          };
        }
        return ctx;
      }),
    ),
  ),

  // Waiting for payment completion
  pendingPayment: state(
    transition<EventType, SubscriptionContext, SubscriptionEvent>(
      "PAYMENT_COMPLETE",
      "active",
      reduce((ctx) => ({
        ...ctx,
        status: "ACTIVE",
        payment: null,
      })),
    ),
    transition<EventType, SubscriptionContext, SubscriptionEvent>(
      "PAYMENT_CLOSE",
      "pending",
      reduce((ctx) => ({
        ...ctx,
        status: "PENDING",
      })),
    ),
    transition<EventType, SubscriptionContext, SubscriptionEvent>(
      "ERROR",
      "error",
      reduce((ctx, ev) => {
        if (ev.type === "ERROR") {
          return {
            ...ctx,
            subscription: ctx.subscription,
            selectedPlan: null,
            status: "PENDING",
            payment: null,
            billing: ctx.billing,
            error: ev.error,
          };
        }
        return ctx;
      }),
    ),
    transition<EventType, SubscriptionContext, SubscriptionEvent>(
      "CANCEL_SUBSCRIPTION",
      "canceling",
      reduce((ctx) => ({
        ...ctx,
        status: "CANCELING",
      })),
    ),
  ),

  // Subscription is active
  active: state(
    transition<EventType, SubscriptionContext, SubscriptionEvent>(
      "SELECT_PLAN",
      "pending",
      guard(guards.canTransitionPlan),
      guard(guards.hasBillingOrFree),
      reduce((ctx, ev) => {
        if (ev.type === "SELECT_PLAN") {
          return {
            ...ctx,
            selectedPlan: ev.plan,
            status: "PENDING",
          };
        }
        return ctx;
      }),
    ),
    transition<EventType, SubscriptionContext, SubscriptionEvent>(
      "CANCEL_SUBSCRIPTION",
      "canceling",
      reduce((ctx) => ({
        ...ctx,
        status: "CANCELING",
      })),
    ),
  ),
  // Error state
  error: state(
    transition<EventType, SubscriptionContext, SubscriptionEvent>(
      "RETRY",
      "idle",
      reduce((ctx) => ({
        ...ctx,
        error: null,
        selectedPlan: null,
        refresh: true
      })),
    ),
  ),

  canceling: state(
    transition<EventType, SubscriptionContext, SubscriptionEvent>(
      "SUBSCRIPTION_CANCELED",
      "inactive",
      reduce((ctx) => ({
        ...ctx,
        subscription: null,
        selectedPlan: null,
        status: "INACTIVE",
        payment: null,
        error: null,
        refresh: false
      })),
    ),
    transition<EventType, SubscriptionContext, SubscriptionEvent>(
      "ABORT_CANCELLATION",
      "idle",
      reduce((ctx) => ({
        ...ctx,
        subscription: null,
        selectedPlan: null,
        status: null,
        payment: null,
        error: null,
      })),
    ),
    transition<EventType, SubscriptionContext, SubscriptionEvent>(
      "ERROR",
      "error",
      reduce((ctx, ev) => {
        if (ev.type === "ERROR") {
          return {
            ...ctx,
            error: ev.error,
            // Maintain subscription state in case of error
            status: ctx.subscription?.status || null,
          };
        }
        return ctx;
      }),
    ),
  ),
};

export const subscriptionMachine = createMachine(
  "idle",
  states,
  (context?: SubscriptionContext) => ({
    subscription: context?.subscription ?? null,
    selectedPlan: context?.selectedPlan ?? null,
    billing: context?.billing ?? null,
    error: context?.error ?? null,
    status: context?.status ?? null,
    payment: context?.payment ?? null,
  }),
);

const subscription = interpret(subscriptionMachine);

interpret(billingMachine, (service) => {
  if (service.machine.current === "complete") {
    subscription.send({
      type: "BILLING_VALID",
      billing: service.context.billing,
    });
  }
});
