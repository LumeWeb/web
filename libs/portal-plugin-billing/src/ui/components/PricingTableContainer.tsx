import { useBillingContext, CheckoutPhase } from "@/ui/context/BillingContext";
import { CadenceToggle } from "./PricingTable/CadenceToggle";
import { PlanGrid } from "./PricingTable/PlanGrid";
import { CheckoutFlow } from "./CheckoutFlow";
import { cn } from "@lumeweb/portal-framework-ui-core";
import { useBillingAnalytics } from "@/ui/hooks/useBillingAnalytics";
import { useEffect } from "react";

interface PricingTableContainerProps {
  className?: string;
}

export function PricingTableContainer({ className }: PricingTableContainerProps) {
  const { plans, subscription, checkout, cadence, setCadence, selectPlan } = useBillingContext();
  const analytics = useBillingAnalytics();

  useEffect(() => {
    if (plans.isReady) {
      analytics.pricingViewed({ plan_count: plans.all.length });
    }
  }, [plans.isReady]);

  // Show checkout flow when in checkout/polling/complete/error phases
  if (checkout.phase !== CheckoutPhase.Idle) {
    return <CheckoutFlow className={className} />;
  }

  return (
    <div className={cn("mx-auto max-w-4xl", className)}>
      <CadenceToggle cadence={cadence} onChange={setCadence} />

      {plans.isBusy && <div className="text-center">Loading plans...</div>}

      {plans.hasError && (
        <div className="text-center text-red-500">
          Failed to load pricing plans. Please try again later.
        </div>
      )}

      {plans.isReady && (
        <PlanGrid
          plans={plans.all}
          cadence={cadence}
          currentPeriodId={subscription.data?.pricing_plan_period_id}
          onSubscribe={selectPlan}
        />
      )}
    </div>
  );
}
