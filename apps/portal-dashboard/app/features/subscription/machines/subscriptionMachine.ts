import { createMachine, Transition } from "robot3";
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

export interface SubscriptionStates {
  idle: {
    final: false;
    transitions: Map<string, Array<Transition<string>>>;
  };
  loading: {
    final: false;
    transitions: Map<string, Array<Transition<string>>>;
  };
  inactive: {
    final: false;
    transitions: Map<string, Array<Transition<string>>>;
  };
  pending: {
    final: false;
    transitions: Map<string, Array<Transition<string>>>;
  };
  pendingPayment: {
    final: false;
    transitions: Map<string, Array<Transition<string>>>;
  };
  active: {
    final: false;
    transitions: Map<string, Array<Transition<string>>>;
  };
  cancelled: {
    final: false;
    transitions: Map<string, Array<Transition<string>>>;
  };
  error: {
    final: false;
    transitions: Map<string, Array<Transition<string>>>;
  };
}

const createTransitionMap = (transitions: Record<string, string[]>) => {
  const map = new Map<string, Array<Transition<string>>>();
  Object.entries(transitions).forEach(([event, states]) => {
    map.set(
      event,
      states.map((state) => ({
        from: "",
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
  string
>(
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
        LOADED: ["inactive"],
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
