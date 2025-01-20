import React from "react";
import { Button } from "portal-shared/components/ui/button";
import { SubscriptionPlan } from "../../../types/subscription.types";
import { usePlanActions } from "../../../hooks/ui/usePlanActions";

interface SubscriptionActionsProps {
  plan: SubscriptionPlan;
  onSelect: (plan: SubscriptionPlan) => void;
  buttonProps: {
    label: string;
    variant: "outline" | "default";
    disabled: boolean;
  };
}

export function SubscriptionActions({
  plan,
  onSelect,
  buttonProps,
}: SubscriptionActionsProps) {
  const { isPending, needsPayment, isPaymentExpired, actions } =
    usePlanActions();

  if (isPending && needsPayment && !plan.is_free) {
    return (
      <>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => actions.triggerPayment()}
          disabled={isPaymentExpired}>
          {isPaymentExpired ? "Session Expired" : "Complete Payment"}
        </Button>
        <Button
          variant="destructive"
          className="w-full"
          onClick={() => actions.cancelSubscription()}
          disabled={buttonProps.disabled}>
          Cancel Subscription
        </Button>
      </>
    );
  }

  return (
    <Button
      className="w-full"
      variant={buttonProps.variant}
      onClick={() => onSelect(plan)}
      disabled={buttonProps.disabled}>
      {buttonProps.label}
    </Button>
  );
}
