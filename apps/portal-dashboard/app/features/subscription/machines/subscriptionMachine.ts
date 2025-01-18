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

type SubscriptionStatus = "ACTIVE" | "PENDING" | "CANCELLED";

interface SubscriptionContext {
  subscription: Subscription | null;
  selectedPlan: SubscriptionPlan | null;
  billing: BillingInfo | null;
  error: Error | null;
  status: SubscriptionStatus | null;
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
  | { type: "CANCEL" }
  | { type: "RETRY" }
  | { type: "ERROR"; error: Error };

type EventType = SubscriptionEvent["type"];

const states = {
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
          ev.subscription?.status === "PENDING"
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

  pending: state(
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
      "active",
      reduce((ctx) => ({
        ...ctx,
        selectedPlan: null,
        status: "ACTIVE",
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
  ),

  creating: state(
    transition<EventType, SubscriptionContext, SubscriptionEvent>(
      "SUBSCRIPTION_CREATED",
      "active",
      reduce((ctx, ev) => {
        if (ev.type === "SUBSCRIPTION_CREATED") {
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
      "CANCEL",
      "cancelled",
      reduce((ctx) => ({
        ...ctx,
        status: "CANCELLED",
      })),
    ),
  ),

  cancelled: state(),

  error: state(
    transition<EventType, SubscriptionContext, SubscriptionEvent>(
      "RETRY",
      "idle",
      reduce((ctx) => ({
        ...ctx,
        error: null,
        selectedPlan: null,
      })),
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
