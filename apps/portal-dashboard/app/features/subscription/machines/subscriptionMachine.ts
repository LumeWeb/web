import { createMachine, state, transition, Transition } from "robot3";

import {
  BillingInfo,
  Subscription,
  SubscriptionPlan,
} from "../types/subscription.types";
import { PaymentInfo } from "../types/payment.types";

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
  | { type: "REACTIVATE" };


export const subscriptionMachine = createMachine<SubscriptionContext, SubscriptionEvent>(
  {
    idle: state(
      transition("SUBSCRIPTION_LOADED", "loading"),
      transition("ERROR", "error")
    ),
    loading: state(
      transition("SUBSCRIPTION_LOADED", "inactive"),
      transition("ERROR", "error")
    ),
    inactive: state(
      transition("PLAN_SELECTED", "pending"),
      transition("ERROR", "error")
    ),
    pending: state(
      transition("SELECT_PLAN", "pendingPayment"),
      transition("COMPLETE", "active"),
      transition("ERROR", "error")
    ),
    pendingPayment: state(
      transition("PAYMENT_COMPLETE", "active"),
      transition("ERROR", "error")
    ),
    active: state(
      transition("SELECT_PLAN", "pending"),
      transition("PAYMENT_METHOD_UPDATE_INITIATED", "updatingPayment"),
      transition("CANCEL", "cancelled"),
      transition("ERROR", "error")
    ),
    cancelled: state(
      transition("REACTIVATED", "pending"),
      transition("ERROR", "error")
    ),
    error: state(
      transition("RETRIED", "pending")
    )
  },
  (context?: SubscriptionContext) => ({
    subscription: context?.subscription ?? null,
    selectedPlan: context?.selectedPlan ?? null,
    billing: context?.billing ?? null,
    payment: context?.payment ?? null,
    error: context?.error ?? null,
  })
);
