import { useMachine } from "react-robot";
import { subscriptionMachine } from "../machines/subscriptionMachine";
import {
  BillingInfo,
  Subscription,
  SubscriptionPlan,
  SubscriptionStateValue,
} from "../types/subscription.types";
import { useRef } from "react";

export function useSubscriptionMachine() {
  const machineRef = useRef<any>();
  if (!machineRef.current) {
    machineRef.current = useMachine(subscriptionMachine);
  }

  const [current, send] = machineRef.current;

  return {
    state: current.name as SubscriptionStateValue,
    context: current.context,
    send,
    actions: {
      loadSubscription: (subscription: Subscription) =>
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
    },
    isLoading: current.name === "loading",
    isProcessing: ["pendingPayment", "editingBilling"].includes(current.name),
    hasError: current.name === "error",
  };
}
