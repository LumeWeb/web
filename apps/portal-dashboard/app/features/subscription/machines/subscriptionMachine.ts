import { createMachine, state, transition, invoke, reduce } from "robot3";

import {
  BillingInfo,
  Subscription,
  SubscriptionPlan,
} from "../types/subscription.types";
import { PaymentInfo } from "../types/payment.types";
import { billingMachine } from "./billingMachine";

interface SubscriptionContext {
  subscription: Subscription | null;
  selectedPlan: SubscriptionPlan | null;
  billing: BillingInfo | null;
  payment: PaymentInfo | null;
  error: Error | null;
}

export type SubscriptionEvent =
  | { type: "SUBSCRIPTION_LOADED"; subscription: Subscription }
  | { type: "PLAN_SELECTED"; plan: SubscriptionPlan }
  | { type: "SELECT_PLAN"; plan: SubscriptionPlan }
  | { type: "COMPLETE" }
  | { type: "CANCEL" }
  | { type: "RETRY" }
  | { type: "ERROR"; error: Error }
  | { type: "SAVED" }
  | { type: "FAILED" }
  | { type: "PAYMENT_COMPLETE" }
  | { type: "PAYMENT_FAILED" }
  | { type: "PAYMENT_METHOD_UPDATE_INITIATED" }
  | { type: "CANCELED" }
  | { type: "REACTIVATE" }
  | { type: "EDIT_BILLING" }
  | { type: "BILLING_COMPLETE"; billing: BillingInfo }
  | { type: "BILLING_FAILED"; error: Error };

type EventType = SubscriptionEvent["type"];

// Define states with their transitions
const states = {
  idle: state(
    transition<EventType, SubscriptionContext, SubscriptionEvent>(
      "SUBSCRIPTION_LOADED",
      "loading",
    ),
    transition<EventType, SubscriptionContext, SubscriptionEvent>(
      "ERROR",
      "error",
    ),
  ),
  loading: state(
    transition<EventType, SubscriptionContext, SubscriptionEvent>(
      "SUBSCRIPTION_LOADED",
      "inactive",
    ),
    transition<EventType, SubscriptionContext, SubscriptionEvent>(
      "ERROR",
      "error",
    ),
  ),
  inactive: state(
    transition<EventType, SubscriptionContext, SubscriptionEvent>(
      "PLAN_SELECTED",
      "pending",
    ),
    transition<EventType, SubscriptionContext, SubscriptionEvent>(
      "ERROR",
      "error",
    ),
  ),
  pending: state(
    transition<EventType, SubscriptionContext, SubscriptionEvent>(
      "EDIT_BILLING",
      "editingBilling"
    ),
    transition<EventType, SubscriptionContext, SubscriptionEvent>(
      "ERROR",
      "error",
    ),
  ),

  editingBilling: invoke(billingMachine,
    transition<EventType, SubscriptionContext, SubscriptionEvent>(
      "done",
      "pendingPayment",
      reduce((ctx, ev) => ({
        ...ctx,
        billing: ev.data.billing,
        error: null
      }))
    ),
    transition<EventType, SubscriptionContext, SubscriptionEvent>(
      "error",
      "error",
      reduce((ctx, ev) => ({
        ...ctx,
        error: ev.error
      }))
    )
  ),
  pendingPayment: state(
    transition<EventType, SubscriptionContext, SubscriptionEvent>(
      "PAYMENT_COMPLETE",
      "active",
    ),
    transition<EventType, SubscriptionContext, SubscriptionEvent>(
      "ERROR",
      "error",
    ),
  ),
  active: state(
    transition<EventType, SubscriptionContext, SubscriptionEvent>(
      "SELECT_PLAN",
      "pending",
    ),
    transition<EventType, SubscriptionContext, SubscriptionEvent>(
      "PAYMENT_METHOD_UPDATE_INITIATED",
      "pendingPayment",
    ),
    transition<EventType, SubscriptionContext, SubscriptionEvent>(
      "CANCEL",
      "cancelled",
    ),
    transition<EventType, SubscriptionContext, SubscriptionEvent>(
      "ERROR",
      "error",
    ),
  ),
  cancelled: state(
    transition<EventType, SubscriptionContext, SubscriptionEvent>(
      "REACTIVATE",
      "pending",
    ),
    transition<EventType, SubscriptionContext, SubscriptionEvent>(
      "ERROR",
      "error",
    ),
  ),
  error: state(
    transition<EventType, SubscriptionContext, SubscriptionEvent>(
      "RETRY",
      "pending",
    ),
  ),
} as const;

export const subscriptionMachine = createMachine(
  "idle",
  states,
  (context?: SubscriptionContext) => ({
    subscription: context?.subscription ?? null,
    selectedPlan: context?.selectedPlan ?? null,
    billing: context?.billing ?? null,
    payment: context?.payment ?? null,
    error: context?.error ?? null,
  }),
);
