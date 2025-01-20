import React, { useRef, useState } from "react";
import { useSubscriptionContext } from "../../contexts/SubscriptionContext";
import { SubscriptionPlan } from "../../types/subscription.types";
import { usePayment } from "../../hooks/core/usePayment";
import { Button } from "portal-shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "portal-shared/components/ui/card";
import {
  CloudIcon,
  CloudUploadIcon,
  DownloadIcon,
} from "portal-shared/components/icons";
import { formatBytes } from "../../utils/formatters";
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

interface PlanSelectorProps {
  onPlanSelect: (plan: SubscriptionPlan) => void;
  onSubscriptionRefresh: () => void;
}

export function PlanSelector({
  onPlanSelect,
  onSubscriptionRefresh,
}: PlanSelectorProps) {
  const { context, state, send, plans, isLoading, actions } =
    useSubscriptionContext();
  const isIdle = state === "idle";
  const isProcessing = state === "creating" || state === "changing" || isIdle;
  const { isPaymentExpired } = usePayment();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const handleCancelClick = () => {
    setShowCancelConfirm(true);
  };

  const handleConfirmCancel = () => {
    setShowCancelConfirm(false);
    actions.cancelSubscription();
  };

  const handleAbortCancel = () => {
    setShowCancelConfirm(false);
    onSubscriptionRefresh();
    actions.abortCancellation();
  };

  if (isLoading || !plans) {
    return (
      <div className="grid md:grid-cols-3 gap-8">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-8 bg-muted rounded" />
              <div className="h-12 bg-muted rounded mt-2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="h-6 bg-muted rounded" />
                <div className="h-6 bg-muted rounded" />
                <div className="h-6 bg-muted rounded" />
              </div>
              <div className="h-10 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!plans?.length) {
    return (
      <div className="text-center p-4">
        <p className="text-muted-foreground">No subscription plans available</p>
      </div>
    );
  }

  const getButtonLabel = (plan: SubscriptionPlan) => {
    if (isProcessing && context.selectedPlan?.id === plan.id) {
      return (
        <>
          <CloudIcon className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      );
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

  const getButtonVariant = (plan: SubscriptionPlan) => {
    return context.subscription?.plan?.id === plan.id ? "outline" : "default";
  };

  const handlePlanClick = (plan: SubscriptionPlan) => {
    if (context.subscription?.plan?.id !== plan.id && !isProcessing) {
      onPlanSelect(plan);
    }
  };

  return (
    <>
      <div className="grid md:grid-cols-3 gap-8">
        {(plans || []).map((plan) => (
          <Card
            key={plan.id}
            className={
              context.subscription?.plan?.id === plan.id
                ? "ring-2 ring-primary"
                : ""
            }>
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <div className="text-4xl font-medium">
                ${plan.price}
                <span className="text-lg font-normal text-muted-foreground">
                  /{plan.period.toLowerCase()}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CloudIcon className="h-5 w-5 text-primary" />
                  <span>
                    <b>Storage:</b> {formatBytes(plan.resources.storage)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CloudUploadIcon className="h-5 w-5 text-primary" />
                  <span>
                    <b>Upload:</b> {formatBytes(plan.resources.upload)}/month
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <DownloadIcon className="h-5 w-5 text-primary" />
                  <span>
                    <b>Download:</b> {formatBytes(plan.resources.download)}
                    /month
                  </span>
                </div>
              </div>

              {context.subscription?.status === "PENDING" &&
              context.subscription?.plan?.id === plan.id &&
              !plan.is_free &&
              context.subscription.payment?.client_secret
                ? // Only show Complete Payment button if not processing
                  !isProcessing && (
                    <>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => actions.triggerPayment()}
                        disabled={isPaymentExpired(context.payment!)}>
                        {isPaymentExpired(context.payment!)
                          ? "Session Expired"
                          : "Complete Payment"}
                      </Button>
                      <Button
                        variant="destructive"
                        className="w-full"
                        onClick={handleCancelClick}
                        disabled={isProcessing}>
                        Cancel Subscription
                      </Button>
                    </>
                  )
                : // Only show plan selection button if not processing OR if this is the selected plan
                  (!isProcessing ||
                    isIdle ||
                    context.selectedPlan?.id === plan.id) && (
                    <Button
                      className="w-full"
                      variant={getButtonVariant(plan)}
                      onClick={() => handlePlanClick(plan)}
                      disabled={
                        (isProcessing &&
                          context.selectedPlan?.id === plan.id) ||
                        context.subscription?.plan?.id === plan.id
                      }>
                      {getButtonLabel(plan)}
                    </Button>
                  )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Cancellation Confirmation Dialog */}
      <AlertDialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
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
