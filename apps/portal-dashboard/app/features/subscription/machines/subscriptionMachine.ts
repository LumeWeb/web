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

// Define all possible event types as a union of string literals
type SubscriptionEventType = 
  | "SUBSCRIPTION_LOADED" 
  | "PLAN_SELECTED"
  | "SELECT_PLAN"
  | "COMPLETE"
  | "CANCEL"
  | "RETRY"
  | "ERROR"
  | "SAVED"
  | "FAILED"
  | "PAYMENT_COMPLETE"
  | "PAYMENT_FAILED"
  | "PAYMENT_METHOD_UPDATE_INITIATED"
  | "CANCELED"
  | "REACTIVATE";

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
    idle: state<SubscriptionEventType>(
      transition<SubscriptionEventType>("SUBSCRIPTION_LOADED", "loading"),
      transition<SubscriptionEventType>("ERROR", "error")
    ),
    loading: state<SubscriptionEventType>(
      transition<SubscriptionEventType>("SUBSCRIPTION_LOADED", "inactive"),
      transition<SubscriptionEventType>("ERROR", "error")
    ),
    inactive: state<SubscriptionEventType>(
      transition<SubscriptionEventType>("PLAN_SELECTED", "pending"),
      transition<SubscriptionEventType>("ERROR", "error")
    ),
    pending: state<SubscriptionEventType>(
      transition<SubscriptionEventType>("SELECT_PLAN", "pendingPayment"),
      transition<SubscriptionEventType>("COMPLETE", "active"),
      transition<SubscriptionEventType>("ERROR", "error")
    ),
    pendingPayment: state<SubscriptionEventType>(
      transition<SubscriptionEventType>("PAYMENT_COMPLETE", "active"),
      transition<SubscriptionEventType>("ERROR", "error")
    ),
    active: state<SubscriptionEventType>(
      transition<SubscriptionEventType>("SELECT_PLAN", "pending"),
      transition<SubscriptionEventType>("PAYMENT_METHOD_UPDATE_INITIATED", "updatingPayment"),
      transition<SubscriptionEventType>("CANCEL", "cancelled"),
      transition<SubscriptionEventType>("ERROR", "error")
    ),
    cancelled: state<SubscriptionEventType>(
      transition<SubscriptionEventType>("REACTIVATED", "pending"),
      transition<SubscriptionEventType>("ERROR", "error")
    ),
    error: state<SubscriptionEventType>(
      transition<SubscriptionEventType>("RETRIED", "pending")
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
