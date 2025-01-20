import { useSubscriptionContext } from "../../contexts/SubscriptionContext";
import { usePayment } from "../core/usePayment";

export function usePlanActions() {
  const { context } = useSubscriptionContext();
  const { isPaymentExpired } = usePayment();

  return {
    isPending: context.subscription?.status === "PENDING",
    needsPayment: Boolean(context.subscription?.payment?.client_secret),
    isPaymentExpired: context.payment ? isPaymentExpired(context.payment) : false
  };
}
