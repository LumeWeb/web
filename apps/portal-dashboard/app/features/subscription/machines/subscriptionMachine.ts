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

export type SubscriptionMachineState = State<
  SubscriptionContext,
  SubscriptionEvent,
  {
    loading: {};
    inactive: {};
    pending: {};
    pendingPayment: {};
    active: {};
    cancelled: {};
    error: {};
  }
>;

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
  SubscriptionContext,
  SubscriptionEvent,
  SubscriptionService
>(
  {
    idle: state(
      transition(
        "SUBSCRIPTION_LOADED",
        "loading",
        reduce((ctx, ev) => ({
          ...ctx,
          subscription: ev.subscription,
          error: null,
        })),
      ),
      transition(
        "ERROR",
        "error",
        reduce((ctx, ev) => ({ ...ctx, error: ev.error })),
      ),
    ),

    inactive: state(
      transition(
        "PLAN_SELECTED",
        "pending",
        reduce((ctx, ev) => ({
          ...ctx,
          selectedPlan: ev.plan,
          error: null,
        })),
      ),
      transition(
        "ERROR",
        "error",
        reduce((ctx, ev) => ({ ...ctx, error: ev.error })),
      ),
    ),

    pending: invoke(billingMachine,
      transition("SAVED", "pendingPayment",
        guard((ctx) => !ctx.selectedPlan?.is_free),
        reduce((ctx) => ({ ...ctx, error: null }))
      ),
      transition("SAVED", "active",
        guard((ctx) => !!ctx.selectedPlan?.is_free),
        reduce((ctx) => ({
          ...ctx,
          subscription: {
            ...ctx.subscription,
            plan: ctx.selectedPlan!,
            status: SubscriptionPlanStatus.ACTIVE,
          },
          error: null,
        }))
      ),
      transition("FAILED", "error",
        reduce((ctx, ev) => ({ ...ctx, error: ev.error }))
      )
    ),

    pendingPayment: invoke(
      initiatePayment,
      transition(
        "resolved",
        "active",
        reduce((ctx, ev) => ({
          ...ctx,
          subscription: {
            ...ctx.subscription,
            plan: ctx.selectedPlan!,
            status: SubscriptionPlanStatus.ACTIVE,
            payment: ev.data.payment,
          },
          error: null,
        })),
      ),
      transition(
        "rejected",
        "error",
        reduce((ctx, ev) => ({ ...ctx, error: ev.error })),
      ),
      transition(
        "PAYMENT_COMPLETE",
        "active",
        reduce((ctx, ev) => ({
          ...ctx,
          subscription: {
            ...ctx.subscription,
            plan: ctx.selectedPlan!,
            status: SubscriptionPlanStatus.ACTIVE,
            payment: {
              ...ctx.subscription?.payment,
              paymentMethodId: ev.paymentMethodId,
            },
          },
          error: null,
        })),
      ),
      transition(
        "PAYMENT_FAILED",
        "error",
        reduce((ctx, ev) => ({
          ...ctx,
          error: new Error(ev.error || "Payment failed"),
        })),
      ),
    ),

    active: state(
      transition(
        "SELECT_PLAN",
        "pending",
        reduce((ctx, ev) => ({
          ...ctx,
          selectedPlan: ev.plan,
          error: null,
        })),
      ),
      transition("PAYMENT_METHOD_UPDATE_INITIATED", "updatingPayment"),
      transition(
        "CANCELED",
        "canceled",
        reduce((ctx) => ({
          ...ctx,
          subscription: {
            ...ctx.subscription!,
            status: SubscriptionPlanStatus.CANCELLED,
          },
          error: null,
        })),
      ),
      transition(
        "ERROR",
        "error",
        reduce((ctx, ev) => ({ ...ctx, error: ev.error })),
      ),
    ),

    updatingPayment: invoke(
      paymentMethodMachine,
      transition(
        "resolved",
        "active",
        reduce((ctx, ev) => ({
          ...ctx,
          subscription: ctx.subscription
            ? {
                ...ctx.subscription,
                payment: {
                  ...ctx.subscription.payment,
                  paymentMethodId: ev.data.paymentMethodId,
                },
              }
            : null,
          error: null,
        })),
      ),
      transition(
        "rejected",
        "error",
        reduce((ctx, ev) => ({ ...ctx, error: ev.error })),
      ),
    ),

    cancelled: state(
      transition(
        "REACTIVATE",
        "pending",
        reduce((ctx) => ({ ...ctx, error: null })),
      ),
      transition(
        "ERROR",
        "error",
        reduce((ctx, ev) => ({ ...ctx, error: ev.error })),
      ),
    ),

    error: state(
      transition(
        "RETRY",
        "pending",
        reduce((ctx) => ({ ...ctx, error: null })),
      ),
    ),
  },
  () => ({
    subscription: null,
    selectedPlan: null,
    billing: null,
    payment: null,
    error: null,
  }),
);
