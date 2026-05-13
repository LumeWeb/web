import React from "react";
import {
  GeneralLayout,
  PageHeader,
  SkeletonLoader,
  withTheme,
} from "@lumeweb/portal-framework-ui";
import { Authenticated } from "@refinedev/core";
import {
  SubscriptionStatusCard,
  SubscriptionManagement,
  PricingTableContainer,
  CheckoutFlow,
} from "@/ui/components";
import { BillingProvider, CheckoutPhase, useBillingContext } from "@/ui/context/BillingContext";
import { FragmentQueueProvider } from "@/ui/context/FragmentQueueContext";
// @ts-ignore
import "@lumeweb/portal-framework-ui-core/tailwind-plugin.css";

function SubscriptionContentInner() {
  const { subscription, plans, checkout } = useBillingContext();
  const isSubscribed = subscription.data?.is_subscribed;
  const isCheckoutActive = checkout.phase !== CheckoutPhase.Idle;

  if (subscription.isBusy || plans.isBusy) {
    return (
      <div className="container mx-auto px-4 py-12">
        <SkeletonLoader layout="card" rows={3} />
      </div>
    );
  }

  if (subscription.hasError) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-semibold text-red-600">
            Error Loading Subscription
          </h2>
          <p className="text-muted-foreground">
            Unable to load your subscription information. Please try again
            later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title={isCheckoutActive ? "Checkout" : isSubscribed ? "Manage Your Subscription" : "Choose Your Plan"}
        description={
          isCheckoutActive
            ? "Complete your plan change"
            : isSubscribed
              ? "Manage your subscription, update payment methods, view invoices, and more."
              : "Select the perfect plan for your needs. Upgrade, downgrade, or cancel anytime."
        }
      />

      {isCheckoutActive ? (
        <div className="container mx-auto max-w-5xl px-4 py-6">
          <FragmentQueueProvider>
            <CheckoutFlow />
          </FragmentQueueProvider>
        </div>
      ) : isSubscribed ? (
        <div className="container mx-auto max-w-5xl px-4 py-6 space-y-6">
          <SubscriptionStatusCard />
          <SubscriptionManagement />
        </div>
      ) : (
        <FragmentQueueProvider>
          <PricingTableContainer />
        </FragmentQueueProvider>
      )}
    </>
  );
}

function AccountSubscriptionsInner() {
  return (
    <BillingProvider>
      <SubscriptionContentInner />
    </BillingProvider>
  );
}

function AccountSubscriptions() {
  return (
    <Authenticated key="account">
      <GeneralLayout>
        <AccountSubscriptionsInner />
      </GeneralLayout>
    </Authenticated>
  );
}

export default withTheme(AccountSubscriptions);
