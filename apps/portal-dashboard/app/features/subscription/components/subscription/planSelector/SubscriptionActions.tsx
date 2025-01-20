import React from "react";
import { Button } from "portal-shared/components/ui/button";
import { CloudIcon } from "portal-shared/components/icons";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "portal-shared/components/ui/alert-dialog";
import { SubscriptionPlan } from "../../../types/subscription.types";
import { usePlanActions } from "../../../hooks/ui/usePlanActions";

interface SubscriptionActionsProps {
  plan: SubscriptionPlan;
  onSelect: (plan: SubscriptionPlan) => void;
  buttonProps: {
    label: {
      text: string;
      showSpinner: boolean;
    };
    variant: "outline" | "default";
    disabled: boolean;
  };
}

export function SubscriptionActions({
  plan,
  onSelect,
  buttonProps,
}: SubscriptionActionsProps) {
  const {
    isPending,
    needsPayment,
    isPaymentExpired,
    showCancelConfirm,
    handleCancelClick,
    handleConfirmCancel,
    handleAbortCancel,
    actions,
  } = usePlanActions(plan);

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
          onClick={handleCancelClick}
          disabled={buttonProps.disabled}>
          Cancel Subscription
        </Button>

        <AlertDialog open={showCancelConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to cancel your subscription? This action
                cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleAbortCancel}>
                No, Keep Subscription
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmCancel}
                className="bg-destructive hover:bg-destructive/90">
                Yes, Cancel Subscription
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  return (
    <Button
      className="w-full"
      variant={buttonProps.variant}
      onClick={() => onSelect(plan)}
      disabled={buttonProps.disabled}>
      {buttonProps.label.showSpinner && (
        <CloudIcon className="mr-2 h-4 w-4 animate-spin" />
      )}
      {buttonProps.label.text}
    </Button>
  );
}
