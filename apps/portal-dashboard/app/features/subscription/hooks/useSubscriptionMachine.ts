import {
  SubscriptionEvent,
  subscriptionMachine,
} from "../machines/subscriptionMachine";
import {
  BillingInfo,
  SubscriptionPlan,
  SubscriptionStateValue,
} from "../types/subscription.types";
import { useMachine } from "react-robot";

export function useSubscriptionMachine() {
  const [current, send] = useMachine(subscriptionMachine);

  return {
    state: current.name as SubscriptionStateValue,
    context: current.context,
    send,
    actions: {
      selectPlan: (plan: SubscriptionPlan) =>
        send({ type: "SELECT_PLAN", plan }),
      updateBilling: (billing: BillingInfo) =>
        send({ type: "UPDATE_BILLING", billing }),
      complete: () => send({ type: "COMPLETE" }),
      cancel: () => send({ type: "CANCEL" }),
      retry: () => send({ type: "RETRY" }),
    },
  };
}
