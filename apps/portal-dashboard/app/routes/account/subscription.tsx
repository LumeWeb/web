import { Skeleton } from "portal-shared/components/ui/skeleton";
import useIsPaidBillingEnabled from "portal-shared/hooks/useIsPaidBillingEnabled";
import useOnFreePlan from "portal-shared/hooks/useOnFreePlan";
import React from "react";
import Addons from "./components/Addons";
import BillingInformation from "./components/BillingInformation";
import ChangePaymentMethod from "./components/ChangePaymentMethod";
import PaymentHistory from "./components/PaymentHistory";
import PricingPlans from "./components/PricingPlans";
import {
  SubscriptionProvider,
  useSubscriptionContext,
} from "./contexts/SubscriptionContext";

export default function Subscription() {
  return (
    <SubscriptionProvider>
      <SubscriptionContent />
    </SubscriptionProvider>
  );
}

function SubscriptionContent() {
  const { isLoading } = useSubscriptionContext();

  const paidBillingEnabled = useIsPaidBillingEnabled();

  const onFreePlan = useOnFreePlan();

  if (isLoading) return <SkeletonSubscription />;

  return (
    <div className="grid lg:grid-cols-3 gap-6 pt-4">
      <div className="lg:col-span-3">
        <PricingPlans />
      </div>
      <div className="lg:col-span-3 border-t border-border/30 pt-4 flex flex-col gap-6">
        {paidBillingEnabled && !onFreePlan && <PaymentHistory />}
        {paidBillingEnabled && !onFreePlan && <ChangePaymentMethod />}
        {false && <Addons />}
      {paidBillingEnabled && (
        <div className="lg:col-span-3">
          <BillingInformation />
        </div>
      )}
      </div>
    </div>
  );
}

function SkeletonSubscription() {
  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 flex flex-col gap-6">
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </div>
      <div className="lg:col-span-2">
        <Skeleton className="h-48" />
      </div>
    </div>
  );
}
