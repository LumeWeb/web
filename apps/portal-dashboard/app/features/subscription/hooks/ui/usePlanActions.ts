import { useSubscriptionContext } from "@/features/subscription/contexts/SubscriptionContext";
import { SubscriptionPlan } from "../../types/subscription.types";
import { usePayment } from "@/features/subscription/hooks/core/usePayment";

export function usePlanActions(plan: SubscriptionPlan) {
  const { context, state, actions } = useSubscriptionContext();
  const { isPaymentExpired } = usePayment();

  const getPlanId = (plan?: SubscriptionPlan | null) => plan?.id ?? null;

  const isIdle = state === "idle";
  const isProcessing = state === "creating" || state === "changing" || isIdle;
  const isPending = context.subscription?.status === "PENDING";
  const needsPayment = Boolean(context.subscription?.payment?.client_secret);
  const currentPlan = context.subscription?.plan;
  const isSelected = getPlanId(currentPlan) === getPlanId(plan);
  const isSelectedForProcessing =
    getPlanId(context.selectedPlan) === getPlanId(plan);

  const getButtonLabel = () => {
    if (isProcessing && isSelectedForProcessing) {
      return "Processing...";
    }

    if (isSelected) {
      return "Current Plan";
    }

    if (!currentPlan) {
      return "Select Plan";
    }

    return plan?.price > currentPlan?.price ? "Upgrade" : "Downgrade";
  };

  return {
    isPending,
    needsPayment,
    isProcessing,
    isSelected,
    isPaymentExpired: context.payment
      ? isPaymentExpired(context.payment)
      : false,
    buttonProps: {
      label: getButtonLabel(),
      variant: isSelected ? ("outline" as const) : ("default" as const),
      disabled: (isProcessing && isSelectedForProcessing) || isSelected,
    },
    actions,
  };
}
