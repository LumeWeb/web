import { createContext, ReactNode, useContext, useMemo } from "react";
import {
  BillingInfo,
  Subscription,
  SubscriptionPlan,
  SubscriptionStateValue,
} from "../types/subscription.types";
import { useSubscriptionPlans } from "../hooks/core/useSubscriptionPlans";
import { useSubscription } from "@/features/subscription/hooks/core/useSubscription";
import {
  SubscriptionEvent,
  subscriptionMachine,
} from "../machines/subscriptionMachine";
import { useMachine } from "react-robot";
import { PaymentInfo } from "../types/payment.types";
import { useHyperState } from "../hooks/useHyperState";

interface SubscriptionContext {
  subscription: Subscription | null;
  selectedPlan: SubscriptionPlan | null;
  billing: BillingInfo | null;
  payment: PaymentInfo | null;
  error: Error | null;
}

interface SubscriptionContextValue {
  plans: SubscriptionPlan[];
  isLoading: boolean;
  refetchSubscription: () => Promise<any>;
  state: SubscriptionStateValue;
  context: SubscriptionContext;
  send: (event: SubscriptionEvent) => void;
  hyperState: {
    isHyperLoaded: boolean;
    error: Error | null;
  };
  hyperPromise: Promise<any> | null;
  actions: {
    subscriptionLoaded: (subscription: Subscription) => void;
    selectPlan: (plan: SubscriptionPlan) => void;
    cancelPlanSelection: () => void;
    createSubscription: () => void;
    updateSubscription: () => void;
    subscriptionCreated: (subscription: Subscription) => void;
    subscriptionUpdated: (subscription: Subscription) => void;
    updateBilling: (billing: BillingInfo) => void;
    billingFailed: (error: Error) => void;
    completePayment: (paymentMethodId: string) => void;
    complete: () => void;
    cancel: () => void;
    reactivate: () => void;
    retry: () => void;
    handleError: (error: Error) => void;
    editBilling: () => void;
    updatePaymentMethod: () => void;
    paymentMethodUpdated: (paymentMethodId: string) => void;
    triggerPayment: () => void;
    cancelSubscription: () => void;
    subscriptionCanceled: () => void;
    abortCancellation: () => void;
  };
}

const SubscriptionContext = createContext<SubscriptionContextValue | undefined>(
  undefined,
);

export function useSubscriptionContext() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error(
      "useSubscriptionContext must be used within a SubscriptionProvider",
    );
  }
  return context;
}

interface SubscriptionProviderProps {
  children: ReactNode;
}

export function SubscriptionProvider({ children }: SubscriptionProviderProps) {
  const [current, send] = useMachine(subscriptionMachine);
  const { plansData, plansAreLoading } = useSubscriptionPlans();
  const { refetch: refetchSubscription, isLoading: subscriptionIsLoading } =
    useSubscription();
  const { hyperState, hyperPromise } = useHyperState(
    current.context.subscription,
  );

  const actions = useMemo(
    () => ({
      subscriptionLoaded: (subscription: Subscription) =>
        send({ type: "SUBSCRIPTION_LOADED", subscription }),
      selectPlan: (plan: SubscriptionPlan) =>
        send({ type: "SELECT_PLAN", plan }),
      cancelPlanSelection: () => send({ type: "CANCEL_PLAN_SELECTION" }),
      createSubscription: () => send({ type: "CREATE_SUBSCRIPTION" }),
      updateSubscription: () => send({ type: "UPDATE_SUBSCRIPTION" }),
      subscriptionCreated: (subscription: Subscription) =>
        send({ type: "SUBSCRIPTION_CREATED", subscription }),
      subscriptionUpdated: (subscription: Subscription) =>
        send({ type: "SUBSCRIPTION_UPDATED", subscription }),
      updateBilling: (billing: BillingInfo) =>
        send({ type: "BILLING_COMPLETE", billing }),
      billingFailed: (error: Error) => send({ type: "BILLING_FAILED", error }),
      completePayment: (paymentMethodId: string) =>
        send({ type: "PAYMENT_COMPLETE", paymentMethodId }),
      complete: () => send({ type: "COMPLETE" }),
      cancel: () => send({ type: "CANCEL" }),
      reactivate: () => send({ type: "REACTIVATE" }),
      retry: () => send({ type: "RETRY" }),
      handleError: (error: Error) => send({ type: "ERROR", error }),
      editBilling: () => send({ type: "EDIT_BILLING" }),
      updatePaymentMethod: () =>
        send({ type: "PAYMENT_METHOD_UPDATE_INITIATED" }),
      paymentMethodUpdated: (paymentMethodId: string) =>
        send({ type: "PAYMENT_METHOD_UPDATED", paymentMethodId }),
      triggerPayment: () => send({ type: "TRIGGER_PAYMENT" }),
      cancelSubscription: () => send({ type: "CANCEL_SUBSCRIPTION" }),
      abortCancellation: () => send({ type: "ABORT_CANCELLATION" }),
      subscriptionCanceled: () => send({ type: "SUBSCRIPTION_CANCELED" }),
    }),
    [send],
  );

  const value = useMemo(
    () => ({
      plans: plansData?.data?.plans || [],
      isLoading: plansAreLoading || subscriptionIsLoading,
      refetchSubscription,
      state: current.name as SubscriptionStateValue,
      context: current.context,
      send,
      actions,
      hyperState,
      hyperPromise,
    }),
    [
      current,
      send,
      actions,
      plansData?.data?.plans,
      plansAreLoading,
      subscriptionIsLoading,
      refetchSubscription,
      hyperState,
      hyperPromise,
    ],
  );

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}
