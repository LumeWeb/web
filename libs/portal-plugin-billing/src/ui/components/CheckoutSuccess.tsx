import type { SubscriptionStatusResponse } from "@/types/subscription";
import {
  Button,
  Card,
  CardContent,
  cn,
} from "@lumeweb/portal-framework-ui-core";
import { CheckCircle } from "lucide-react";
import { useState } from "react";
interface CheckoutSuccessProps {
  subscription: SubscriptionStatusResponse | undefined;
  currentPlan: { plan: { name: string }; period: { cadence: string } } | null;
  gatewayType?: string;
  className?: string;
  onBackToDashboard: () => void;
}

function GatewayLogo({
  gatewayType,
  fallback,
}: {
  gatewayType?: string;
  fallback?: React.ReactNode;
}) {
  const [failed, setFailed] = useState(false);

  if (!gatewayType || failed) {
    return (
      <span className="text-xs font-medium">
        {fallback ?? gatewayType?.toUpperCase() ?? "Subscription"}
      </span>
    );
  }

  return (
    <span className="text-xs font-medium uppercase">{gatewayType}</span>
  );
}

export function CheckoutSuccess({
  subscription,
  currentPlan,
  gatewayType,
  className,
  onBackToDashboard,
}: CheckoutSuccessProps) {
  return (
    <div className={cn("mx-auto max-w-lg text-center", className)}>
      <div className="mb-6 flex justify-center">
        <div className="rounded-full bg-green-100 p-4 dark:bg-green-900/20">
          <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
        </div>
      </div>

      <h3 className="mb-2 text-2xl font-semibold text-green-600">
        Subscription Activated!
      </h3>
      <p className="text-muted-foreground mb-6">
        Your subscription is now active. Thank you for your purchase!
      </p>

      {currentPlan && (
        <Card className="mb-6 text-left">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between border-b pb-4">
              <span className="text-muted-foreground text-sm">Plan</span>
              <span className="font-semibold">{currentPlan.plan.name}</span>
            </div>
            <div className="mb-4 flex items-center justify-between border-b pb-4">
              <span className="text-muted-foreground text-sm">Billing</span>
              <span className="capitalize">{currentPlan.period.cadence}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">
                Payment via
              </span>
              <GatewayLogo gatewayType={gatewayType} />
            </div>
            {subscription?.created_at && (
              <div className="mt-4 flex items-center justify-between border-t pt-4">
                <span className="text-muted-foreground text-sm">
                  Activated on
                </span>
                <span>
                  {new Date(subscription.created_at).toLocaleDateString()}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button onClick={onBackToDashboard}>
          Back to Subscription Overview
        </Button>
      </div>
    </div>
  );
}
