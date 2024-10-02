import React from "react";
import PricingPlans from "./components/PricingPlans";
import PaymentHistory from "./components/PaymentHistory";
import ChangePaymentMethod from "./components/ChangePaymentMethod";
import Addons from "./components/Addons";
import BillingInformation from "./components/BillingInformation";
import { Skeleton } from "@/components/ui/skeleton";
import {
  SubscriptionProvider,
  useSubscriptionContext,
} from "./contexts/SubscriptionContext";
import useIsPaidBillingEnabled from "@/hooks/useIsPaidBillingEnabled";
import usePluginMeta from "@/hooks/usePluginMeta";

export default function Subscription() {
  return (
    <SubscriptionProvider>
      <SubscriptionContent />
    </SubscriptionProvider>
  );
}

function SubscriptionContent() {
  const { isLoading, subscription } = useSubscriptionContext();

  const freePlanName = usePluginMeta("billing", "free_plan_name");

  const paidBillingEnabled = useIsPaidBillingEnabled();

  const onFreePlan =
    paidBillingEnabled &&
    freePlanName &&
    subscription?.plan.name === freePlanName;

  if (isLoading) return <SkeletonSubscription />;

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-3">
        <PricingPlans />
      </div>
      <div className="lg:col-span-1 flex flex-col gap-6">
        {paidBillingEnabled && !onFreePlan && <PaymentHistory />}
        {paidBillingEnabled && !onFreePlan && <ChangePaymentMethod />}
        {false && <Addons />}
      </div>
      {paidBillingEnabled && (
        <div className="lg:col-span-2">
          <BillingInformation />
        </div>
      )}
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
