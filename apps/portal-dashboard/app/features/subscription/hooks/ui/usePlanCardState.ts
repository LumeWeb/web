import { useSubscriptionContext } from "../../contexts/SubscriptionContext";
import { SubscriptionPlan } from "../../types/subscription.types";

export function usePlanCardState(plan: SubscriptionPlan) {
  const { context, state } = useSubscriptionContext();
  const isIdle = state === "idle";
  const isProcessing = state === "creating" || state === "changing" || isIdle;

  const isSelected = context.subscription?.plan?.id === plan.id;

  const getButtonLabel = () => {
    if (isProcessing && context.selectedPlan?.id === plan.id) {
      return "Processing...";
    }

    if (context.subscription?.plan?.id === plan.id) {
      return "Current Plan";
    }

    if (!context.subscription?.plan) {
      return "Select Plan";
    }

    return plan.price > context.subscription.plan.price
      ? "Upgrade"
      : "Downgrade";
  };

  return {
    isSelected,
    buttonProps: {
      label: getButtonLabel(),
      variant: isSelected ? "outline" : "default",
      disabled: (isProcessing && context.selectedPlan?.id === plan.id) || 
                context.subscription?.plan?.id === plan.id
    } as const
  };
}
