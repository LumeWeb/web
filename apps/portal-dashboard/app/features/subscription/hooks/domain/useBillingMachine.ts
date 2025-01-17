import { useMachine } from "react-robot";
import { billingMachine, BillingEvent } from "../../machines/billingMachine";
import { BillingInfo } from "../../types/billing.types";

export function useBillingMachine() {
  const [current, send] = useMachine(billingMachine);

  return {
    state: current.name,
    context: current.context,
    send,
    actions: {
      startEdit: () => send({ type: "EDIT" }),
      validate: (billing: BillingInfo) => send({ type: "VALIDATE", billing }),
      save: () => send({ type: "SAVE" }),
      handleError: (error: Error) => send({ type: "FAILED", error }),
    },
  };
}
