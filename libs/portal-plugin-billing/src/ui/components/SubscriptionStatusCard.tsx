import { useBillingContext } from "@/ui/context/BillingContext";
import { useManagementCapabilities } from "@/hooks/useManagementCapabilities";
import { cn } from "@lumeweb/portal-framework-ui-core";
import { StatusHeader } from "./SubscriptionStatusCard/StatusHeader";
import { PlanDetails } from "./SubscriptionStatusCard/PlanDetails";
import { PausedStatus } from "./SubscriptionStatusCard/PausedStatus";
import { CancellationStatus } from "./SubscriptionStatusCard/CancellationStatus";

interface SubscriptionStatusCardProps {
  className?: string;
}

export function SubscriptionStatusCard({ className }: SubscriptionStatusCardProps) {
  const { subscription, findCurrentPlan } = useBillingContext();
  const { data: capabilities, isLoading: capabilitiesLoading } = useManagementCapabilities(
    {},
    { isSubscribed: subscription.data?.is_subscribed }
  );

  const subscriptionData = subscription.data;
  const currentPlan = findCurrentPlan();

  if (subscription.isBusy) {
    return (
      <div className={cn("border-border/30 bg-secondary/30 rounded-lg border p-6", className)}>
        <p className="text-muted-foreground">Loading subscription...</p>
      </div>
    );
  }

  if (!subscriptionData?.is_subscribed) {
    return (
      <div className={cn("border-border/30 bg-secondary/30 rounded-lg border p-6", className)}>
        <p className="text-muted-foreground">No active subscription</p>
      </div>
    );
  }

  return (
    <div className={cn("border-border/30 bg-secondary/30 rounded-lg border p-6", className)}>
      <StatusHeader
        gatewayType={subscriptionData.gateway_type}
        managementMode={capabilities?.management_mode}
        isLoading={capabilitiesLoading}
      />

      <PlanDetails planInfo={currentPlan} />

      {subscriptionData.paused_at && (
        <PausedStatus pausedAt={subscriptionData.paused_at} />
      )}

      {subscriptionData.will_cancel_at && !subscriptionData.paused_at && (
        <CancellationStatus willCancelAt={subscriptionData.will_cancel_at} onAborted={subscription.silentRefetch} />
      )}
    </div>
  );
}
