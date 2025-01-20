import { useSubscriptionContext } from "@/features/subscription/contexts/SubscriptionContext";
import { usePayment } from "@/features/subscription/hooks/core/usePayment";
import { SubscriptionPlan } from "../../types/subscription.types";

export function usePlanActions(plan: SubscriptionPlan) {
  const { context, state, actions } = useSubscriptionContext();
  const { isPaymentExpired } = usePayment();

  const getPlanId = (plan?: SubscriptionPlan | null) => plan?.id ?? null;

  const isIdle = state === "idle";
  const isProcessing =
    state === "creating" ||
    state === "changing" ||
    state === "canceling" ||
    isIdle;
  const isPending = context.subscription?.status === "PENDING";
  const needsPayment = Boolean(context.subscription?.payment?.client_secret);
  const currentPlan = context.subscription?.plan;
  const isSelected = getPlanId(currentPlan) === getPlanId(plan);
  const isSelectedForProcessing =
    getPlanId(context.selectedPlan) === getPlanId(plan);

  const getButtonLabel = () => {
    if (isProcessing && isSelectedForProcessing) {
      return {
        text: "Processing...",
        showSpinner: true,
      };
    }

    if (isSelected) {
      return {
        text: "Current Plan",
        showSpinner: false,
      };
    }

    if (!currentPlan) {
      return {
        text: "Select Plan",
        showSpinner: false,
      };
    }

    return {
      text: plan.price > currentPlan.price ? "Upgrade" : "Downgrade",
      showSpinner: false,
    };
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
