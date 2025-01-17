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

export const subscriptionMachine = createMachine<SubscriptionContext, SubscriptionEvent>(
  {
    idle: state(
      transition<SubscriptionEvent>("SUBSCRIPTION_LOADED", "loading"),
      transition<SubscriptionEvent>("ERROR_OCCURRED", "error")
    ),
    loading: state(
      transition<SubscriptionEvent>("SUBSCRIPTION_LOADED", "inactive"),
      transition<SubscriptionEvent>("ERROR_OCCURRED", "error")
    ),
    inactive: state(
      transition<SubscriptionEvent>("PLAN_SELECTED", "pending"),
      transition<SubscriptionEvent>("ERROR_OCCURRED", "error")
    ),
    pending: state(
      transition<SubscriptionEvent>("SELECT_PLAN", "pendingPayment"),
      transition<SubscriptionEvent>("COMPLETED", "active"),
      transition<SubscriptionEvent>("ERROR_OCCURRED", "error")
    ),
    pendingPayment: state(
      transition<SubscriptionEvent>("PAYMENT_COMPLETE", "active"),
      transition<SubscriptionEvent>("ERROR_OCCURRED", "error")
    ),
    active: state(
      transition<SubscriptionEvent>("SELECT_PLAN", "pending"),
      transition<SubscriptionEvent>("PAYMENT_METHOD_UPDATE_INITIATED", "updatingPayment"),
      transition<SubscriptionEvent>("CANCELED", "cancelled"),
      transition<SubscriptionEvent>("ERROR_OCCURRED", "error")
    ),
    cancelled: state(
      transition<SubscriptionEvent>("REACTIVATED", "pending"),
      transition<SubscriptionEvent>("ERROR_OCCURRED", "error")
    ),
    error: state(
      transition<SubscriptionEvent>("RETRIED", "pending")
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
