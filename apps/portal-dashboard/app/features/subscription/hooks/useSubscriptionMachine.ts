import { useMachine } from "robot-hooks";
import {
  SubscriptionEvent,
  subscriptionMachine,
} from "../machines/subscriptionMachine";
import {
  SubscriptionPlan,
  SubscriptionStateValue,
} from "../types/subscription.types";

export function useSubscriptionMachine() {
  const [current, send] = useMachine(subscriptionMachine);

  return {
    state: current.name as SubscriptionStateValue,
    context: current.context,
    send,
    // Convenience methods
    selectPlan: (plan: SubscriptionPlan) =>
      send({ type: "SELECT_PLAN", plan } as SubscriptionEvent),
    complete: () => send({ type: "COMPLETE" } as SubscriptionEvent),
    cancel: () => send({ type: "CANCEL" } as SubscriptionEvent),
    retry: () => send({ type: "RETRY" } as SubscriptionEvent),
  };
}
