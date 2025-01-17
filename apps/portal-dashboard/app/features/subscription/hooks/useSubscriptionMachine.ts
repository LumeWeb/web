import { useMachine } from "react-robot";
import {
  SubscriptionEvent,
  subscriptionMachine,
} from "../machines/subscriptionMachine";
import {
  BillingInfo,
  SubscriptionPlan,
  SubscriptionStateValue,
  Subscription,
} from "../types/subscription.types";

export function useSubscriptionMachine() {
  const [current, send] = useMachine(subscriptionMachine);

  return {
    state: current.name as SubscriptionStateValue,
    context: current.context,
    send,
    actions: {
      loadSubscription: (subscription: Subscription) =>
        send({ type: "SUBSCRIPTION_LOADED", subscription }),
      selectPlan: (plan: SubscriptionPlan) =>
        send({ type: "SELECT_PLAN", plan }),
      updateBilling: (billing: BillingInfo) =>
        send({ type: "BILLING_COMPLETE", billing }),
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
    },
    isLoading: current.name === "loading",
    isProcessing: ["pendingPayment", "editingBilling"].includes(current.name),
    hasError: current.name === "error",
  };
}
