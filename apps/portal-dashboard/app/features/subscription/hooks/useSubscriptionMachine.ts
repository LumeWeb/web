import { useMachine } from "robot-hooks";
import { subscriptionMachine } from "../machines/subscriptionMachine";
import {
  BillingInfo,
  SubscriptionPlan,
  SubscriptionMachineState,
  SubscriptionStateValue,
} from "../types/subscription.types";

type SubscriptionEvent = 
  | "SELECT_PLAN"
  | "UPDATE_BILLING"
  | "COMPLETE"
  | "CANCEL"
  | "RETRY";

export function useSubscriptionMachine() {
  const [current, send] = useMachine(subscriptionMachine);

  return {
    state: current.name as SubscriptionStateValue,
    context: current.context,
    send,
    // Convenience methods
    selectPlan: (plan: SubscriptionPlan) => send("SELECT_PLAN"),
    updateBilling: (billing: BillingInfo) => send("UPDATE_BILLING"),
    complete: () => send("COMPLETE"),
    cancel: () => send("CANCEL"),
    retry: () => send("RETRY"),
  };
}
