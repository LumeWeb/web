import { createMachine, Transition } from "robot3";
import { createUseMachine } from "robot-hooks";
import { useEffect, useState } from "react";

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

export interface SubscriptionStates {
  idle: {
    final: false;
    transitions: Map<string, Array<Transition<SubscriptionEvent["type"]>>>;
  };
  loading: {
    final: false;
    transitions: Map<string, Array<Transition<SubscriptionEvent["type"]>>>;
  };
  inactive: {
    final: false;
    transitions: Map<string, Array<Transition<SubscriptionEvent["type"]>>>;
  };
  pending: {
    final: false;
    transitions: Map<string, Array<Transition<SubscriptionEvent["type"]>>>;
  };
  pendingPayment: {
    final: false;
    transitions: Map<string, Array<Transition<SubscriptionEvent["type"]>>>;
  };
  active: {
    final: false;
    transitions: Map<string, Array<Transition<SubscriptionEvent["type"]>>>;
  };
  cancelled: {
    final: false;
    transitions: Map<string, Array<Transition<SubscriptionEvent["type"]>>>;
  };
  error: {
    final: false;
    transitions: Map<string, Array<Transition<SubscriptionEvent["type"]>>>;
  };
}

const createTransitionMap = (
  transitions: Partial<Record<SubscriptionEvent["type"], string[]>>,
) => {
  const map = new Map<
    SubscriptionEvent["type"],
    Array<Transition<SubscriptionEvent["type"]>>
  >();
  Object.entries(transitions).forEach(([event, states]) => {
    map.set(
      event as SubscriptionEvent["type"],
      states.map((state) => ({
        from: null,
        to: state,
        guards: [],
        reducers: [(ctx: SubscriptionContext) => ctx],
      })),
    );
  });
  return map;
};

export const subscriptionMachine = createMachine({
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
    transition("SAVED", "active"),
    transition("FAILED", "error")
  ),
  pendingPayment: state(
    transition("PAYMENT_COMPLETE", "active"),
    transition("PAYMENT_FAILED", "error")
  ),
  active: state(
    transition("SELECT_PLAN", "pending"),
    transition("PAYMENT_METHOD_UPDATE_INITIATED", "updatingPayment"),
    transition("CANCELED", "cancelled"),
    transition("ERROR", "error")
  ),
  cancelled: state(
    transition("REACTIVATE", "pending"),
    transition("ERROR", "error")
  ),
  error: state(
    transition("RETRY", "pending")
  )
},
  () => ({
    subscription: null,
    selectedPlan: null,
    billing: null,
    payment: null,
    error: null,
  }),
);
