import { useMachine } from "robot-hooks";
import { subscriptionMachine } from "../machines/subscriptionMachine";
import {
  BillingInfo,
  SubscriptionPlan,
  SubscriptionMachineState,
  SubscriptionStateValue,
} from "../types/subscription.types";

export function useSubscriptionMachine() {
  const [current, send] = useMachine(subscriptionMachine);

  return {
    state: current.name as SubscriptionStateValue,
    context: current.context,
    send,
    // Convenience methods
    selectPlan: (plan: SubscriptionPlan) => send("SELECT_PLAN", { plan }),
    updateBilling: (billing: BillingInfo) =>
      send("UPDATE_BILLING", { billing }),
    complete: () => send("COMPLETE"),
    cancel: () => send("CANCEL"),
    retry: () => send("RETRY"),
  };
}
