import React from "react";
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

interface PlanSelectorProps {
  onPlanSelect: (plan: SubscriptionPlan) => void;
}

export function PlanSelector({ onPlanSelect }: PlanSelectorProps) {
  const { context, state, send, plans } = useSubscriptionContext();
  const isProcessing = state === "creating" || state === "changing";
  const isLoading = state === "idle";
  const { isPaymentExpired } = usePayment();

  if (isLoading || !context.subscription?.plan) {
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
    if (isProcessing) {
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

    if (!context.subscription) {
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
                  <b>Download:</b> {formatBytes(plan.resources.download)}/month
                </span>
              </div>
            </div>

            {context.subscription?.status === "PENDING" &&
            context.subscription?.plan?.id === plan.id &&
            !plan.is_free &&
            context.subscription.payment?.client_secret ? (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => send({ type: "TRIGGER_PAYMENT" })}
                disabled={isPaymentExpired(context.payment!)}>
                {isPaymentExpired(context.payment!)
                  ? "Session Expired"
                  : "Complete Payment"}
              </Button>
            ) : (
              <Button
                className="w-full"
                variant={getButtonVariant(plan)}
                onClick={() => handlePlanClick(plan)}
                disabled={
                  isProcessing || context.subscription?.plan.id === plan.id
                }>
                {getButtonLabel(plan)}
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
