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
  | { type: "PAYMENT_COMPLETE"; paymentMethodId: string }
  | { type: "PAYMENT_FAILED" }
  | { type: "PAYMENT_METHOD_UPDATE_INITIATED" }
  | { type: "PAYMENT_METHOD_UPDATED"; paymentMethodId: string }
  | { type: "PAYMENT_METHOD_UPDATE_FAILED"; error: Error }
  | { type: "SHOW_PAYMENT_DIALOG" }
  | { type: "HIDE_PAYMENT_DIALOG" }
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
      reduce((ctx, ev: { type: "done"; data: BillingContext }) => ({
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
      "SHOW_PAYMENT_DIALOG",
      "showingPaymentDialog"
    ),
    transition<EventType, SubscriptionContext, SubscriptionEvent>(
      "ERROR",
      "error",
    ),
  ),

  showingPaymentDialog: state(
    transition<EventType, SubscriptionContext, SubscriptionEvent>(
      "HIDE_PAYMENT_DIALOG",
      "pendingPayment"
    ),
    transition<EventType, SubscriptionContext, SubscriptionEvent>(
      "PAYMENT_COMPLETE",
      "active",
      reduce((ctx, ev) => ({
        ...ctx,
        payment: {
          ...ctx.payment,
          paymentMethodId: ev.paymentMethodId
        }
      }))
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
      "updatingPayment"
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

  updatingPayment: state(
    transition<EventType, SubscriptionContext, SubscriptionEvent>(
      "PAYMENT_METHOD_UPDATED",
      "active",
      reduce((ctx, ev) => ({
        ...ctx,
        payment: {
          ...ctx.payment,
          paymentMethodId: ev.paymentMethodId
        }
      }))
    ),
    transition<EventType, SubscriptionContext, SubscriptionEvent>(
      "PAYMENT_METHOD_UPDATE_FAILED",
      "active",
      reduce((ctx, ev) => ({
        ...ctx,
        error: ev.error
      }))
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
