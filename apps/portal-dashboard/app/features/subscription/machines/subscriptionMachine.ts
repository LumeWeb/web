import {
  createMachine,
  state,
  transition,
  reduce,
  guard,
  invoke,
  State,
  Machine
} from "robot3";
import { billingMachine } from "./billingMachine";
import {
  Subscription,
  SubscriptionPlan,
  BillingInfo,
  SubscriptionEvent,
} from "../types/subscription.types";
import { PaymentInfo } from "../types/payment.types";

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

type SubscriptionService = {
  initiatePayment: (
    context: SubscriptionContext,
  ) => Promise<{ payment: PaymentInfo }>;
};
import { SubscriptionPlanStatus } from "portal-shared/dataProviders/accountProvider";
import { PaymentService } from "../services/PaymentService";

interface SubscriptionContext {
  subscription: Subscription | null;
  selectedPlan: SubscriptionPlan | null;
  billing: BillingInfo | null;
  payment: PaymentInfo | null;
  error: Error | null;
}

const createTransitionMap = (transitions: Record<string, string[]>) => {
  const map = new Map<string, Array<Transition<string>>>();
  Object.entries(transitions).forEach(([event, states]) => {
    map.set(event, states.map(state => ({
      from: '',  // Will be set by Robot3
      to: state,
      guards: [],
      reducers: [(ctx: SubscriptionContext) => ctx]
    })));
  });
  return map;
};

const paymentService = new PaymentService();

// Validation guards
const hasBillingInfo = (ctx: SubscriptionContext) => {
  return !!ctx.billing?.name && !!ctx.billing?.address?.line1;
};

const isValidPlanChange = (ctx: SubscriptionContext) => {
  if (!ctx.subscription || !ctx.selectedPlan) return true;

  // Don't allow downgrades if current plan has higher resources
  if (
    ctx.selectedPlan.resources.storage <
      ctx.subscription.plan.resources.storage ||
    ctx.selectedPlan.resources.upload <
      ctx.subscription.plan.resources.upload ||
    ctx.selectedPlan.resources.download <
      ctx.subscription.plan.resources.download
  ) {
    return false;
  }
  return true;
};

const initiatePayment = async (context: SubscriptionContext) => {
  if (!context.selectedPlan) {
    throw new Error("No plan selected");
  }

  if (!hasBillingInfo(context)) {
    throw new Error("Billing information is required");
  }

  // Initialize payment session
  const payment = await paymentService.initializePayment({
    planId: context.selectedPlan.id,
    billingInfo: context.billing!,
  });

  return { payment };
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
        ERROR: ["error"]
      })
    },

    loading: {
      final: false,
      transitions: createTransitionMap({
        LOADED: ["inactive"],
        ERROR: ["error"]
      })
    },

    inactive: {
      final: false,
      transitions: createTransitionMap({
        PLAN_SELECTED: ["pending"],
        ERROR: ["error"]
      })
    },

    pending: {
      final: false,
      transitions: createTransitionMap({
        SAVED: ["pendingPayment", "active"],
        FAILED: ["error"]
      })
    },

    pendingPayment: {
      final: false,
      transitions: createTransitionMap({
        PAYMENT_COMPLETE: ["active"],
        PAYMENT_FAILED: ["error"]
      })
    },

    active: {
      final: false,
      transitions: createTransitionMap({
        SELECT_PLAN: ["pending"],
        PAYMENT_METHOD_UPDATE_INITIATED: ["updatingPayment"],
        CANCELED: ["cancelled"],
        ERROR: ["error"]
      })
    },

    cancelled: {
      final: false,
      transitions: createTransitionMap({
        REACTIVATE: ["pending"],
        ERROR: ["error"]
      })
    },

    error: {
      final: false,
      transitions: createTransitionMap({
        RETRY: ["pending"]
      })
    }
  },
  () => ({
    subscription: null,
    selectedPlan: null,
    billing: null,
    payment: null,
    error: null,
  }),
);
