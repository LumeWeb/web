import { useSearchParams } from "@remix-run/react";
import { Skeleton } from "portal-shared/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "portal-shared/components/ui/tabs";
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
const TABS = {
  BILLING: "billing",
  PAYMENT_HISTORY: "payment-history",
  PAYMENT_METHOD: "payment-method",
  ADDONS: "addons",
} as const;

function SubscriptionContent() {
  const { isLoading } = useSubscriptionContext();
  const [searchParams, setSearchParams] = useSearchParams();

  const paidBillingEnabled = useIsPaidBillingEnabled();

  const onFreePlan = useOnFreePlan();
  const searchTab = TABS[searchParams.get("tab") as keyof typeof TABS] ?? TABS.BILLING;

  if (isLoading) return <SkeletonSubscription />;

  return (
    <div className="grid lg:grid-cols-3 gap-6 pt-4">
      <div className="lg:col-span-3">
        <PricingPlans />
      </div>
      <div className="lg:col-span-3 border-t border-border/30 pt-4">
        <Tabs defaultValue={searchTab} onValueChange={(value) => setSearchParams({ tab: value })} className="space-y-4">
          <TabsList>
            {paidBillingEnabled && <TabsTrigger value="billing">Billing Information</TabsTrigger>}
            {paidBillingEnabled && !onFreePlan && <TabsTrigger value="payment-history">Payment History</TabsTrigger>}
            {paidBillingEnabled && !onFreePlan && <TabsTrigger value="payment-method">Payment Method</TabsTrigger>}
            {false && <TabsTrigger value="addons">Add-ons</TabsTrigger>}
          </TabsList>

          {paidBillingEnabled && !onFreePlan && (
            <TabsContent value="payment-history">
              <PaymentHistory />
            </TabsContent>
          )}

          {paidBillingEnabled && !onFreePlan && (
            <TabsContent value="payment-method">
              <ChangePaymentMethod />
            </TabsContent>
          )}

          {paidBillingEnabled && (
            <TabsContent value="billing">
              <BillingInformation />
            </TabsContent>
          )}

          {false && (
            <TabsContent value="addons">
              <Addons />
            </TabsContent>
          )}
        </Tabs>
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
