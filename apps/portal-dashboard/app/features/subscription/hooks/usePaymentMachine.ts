import { useMachine } from "react-robot";
import { paymentMachine } from "../machines/paymentMachine";

export function usePaymentMachine() {
  const [current, send] = useMachine(paymentMachine);

  return {
    state: current.name,
    context: current.context,
    send,
    actions: {
      startPayment: () => send({ type: "START" }),
      processPayment: () => send({ type: "PROCESSING" }),
      completePayment: () => send({ type: "COMPLETE" }),
      handleError: (error: Error) => send({ type: "ERROR", error }),
      retry: () => send({ type: "RETRY" })
    }
  };
}
