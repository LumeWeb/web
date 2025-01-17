import { createMachine, Transition } from "robot3";
import { createUseMachine } from "robot-hooks";
import { useEffect, useState } from "react";

export const useMachine = createUseMachine(useEffect, useState);
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

const createTransitionMap = (transitions: Partial<Record<SubscriptionEvent["type"], string[]>>) => {
  const map = new Map<SubscriptionEvent["type"], Array<Transition<SubscriptionEvent["type"]>>>();
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

export const subscriptionMachine = createMachine<
  SubscriptionStates,
  SubscriptionContext,
  SubscriptionEvent["type"]
>(
  "idle",
  {
    idle: {
      final: false,
      transitions: createTransitionMap({
        SUBSCRIPTION_LOADED: ["loading"],
        ERROR: ["error"],
      }),
    },
    loading: {
      final: false,
      transitions: createTransitionMap({
        SUBSCRIPTION_LOADED: ["inactive"],
        ERROR: ["error"],
      }),
    },
    inactive: {
      final: false,
      transitions: createTransitionMap({
        PLAN_SELECTED: ["pending"],
        ERROR: ["error"],
      }),
    },
    pending: {
      final: false,
      transitions: createTransitionMap({
        SELECT_PLAN: ["pendingPayment"],
        SAVED: ["pendingPayment", "active"],
        FAILED: ["error"],
      }),
    },
    pendingPayment: {
      final: false,
      transitions: createTransitionMap({
        PAYMENT_COMPLETE: ["active"],
        PAYMENT_FAILED: ["error"],
      }),
    },
    active: {
      final: false,
      transitions: createTransitionMap({
        SELECT_PLAN: ["pending"],
        PAYMENT_METHOD_UPDATE_INITIATED: ["updatingPayment"],
        CANCELED: ["cancelled"],
        ERROR: ["error"],
      }),
    },
    cancelled: {
      final: false,
      transitions: createTransitionMap({
        REACTIVATE: ["pending"],
        ERROR: ["error"],
      }),
    },
    error: {
      final: false,
      transitions: createTransitionMap({
        RETRY: ["pending"],
      }),
    },
  },
  () => ({
    subscription: null,
    selectedPlan: null,
    billing: null,
    payment: null,
    error: null,
  }),
);
