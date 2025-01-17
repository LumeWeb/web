import { useMachine } from "react-robot";
import { paymentMethodMachine } from "../../machines/paymentMethodMachine";

export function usePaymentMethodMachine() {
  const [current, send] = useMachine(paymentMethodMachine);

  return {
    state: current.name,
    context: current.context,
    send,
    actions: {
      initialize: () => send({ type: "INITIALIZE" }),
      handleInitialized: (clientSecret: string) =>
        send({ type: "INITIALIZED", clientSecret }),
      startCollection: () => send({ type: "COLLECT" }),
      validate: () => send({ type: "VALIDATE" }),
      handleValidated: (paymentMethodId: string) =>
        send({ type: "VALIDATED", paymentMethodId }),
      save: () => send({ type: "SAVE" }),
      handleError: (error: Error) => send({ type: "ERROR", error }),
    },
  };
}
