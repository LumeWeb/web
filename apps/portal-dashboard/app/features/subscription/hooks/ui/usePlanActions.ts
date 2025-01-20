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
  const isCurrent = getPlanId(currentPlan) === getPlanId(plan);
  const isSelectedForProcessing =
    getPlanId(context.selectedPlan) === getPlanId(plan);

  const getButtonLabel = () => {
    if (isProcessing && (isSelectedForProcessing || isCurrent)) {
      return {
        text: "Processing...",
        showSpinner: true,
      };
    }

    if (isSelected && !isPending) {
      return {
        text: "Current Plan",
        showSpinner: false,
      };
    }

    if (
      !currentPlan ||
      (currentPlan && isPending && isPaymentExpired(context.payment))
    ) {
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

  const getButtonVariant = () => {
    if (
      !currentPlan ||
      (currentPlan && isPending && isPaymentExpired(context.payment))
    ) {
      return "";
    }

    if (isSelected) {
      return "outline";
    }

    return "default";
  };

  const getButtonDisabled = () => {
    return (isProcessing && isSelectedForProcessing) || isSelected;
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
      variant: getButtonVariant(),
      disabled: getButtonDisabled(),
    },
    actions,
  };
}
