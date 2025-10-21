import React from "react";
import {
  GeneralLayout,
  PageHeader,
  SkeletonLoader,
  usePluginMeta,
  withTheme,
} from "@lumeweb/portal-framework-ui";
import { ExternalLink, Settings, ArrowRight } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { useCustomerPortal } from "@/hooks/useCustomerPortal";
import { StripePricingTable } from "@/ui/components/StripePricingTable";
import type { BillingPluginMeta } from "@/types/subscription";
import { Authenticated, useGetIdentity } from "@refinedev/core";
import type { Identity } from "@lumeweb/portal-framework-core";
import { getCurrentLocation } from "@lumeweb/portal-framework-core";
import { Button } from "@lumeweb/portal-framework-ui-core";
import { Card, CardHeader, CardContent } from "@lumeweb/portal-framework-ui-core";
import "@lumeweb/portal-framework-ui-core/tailwind-plugin.css";

const SubscriptionContainer = ({ children }: { children: React.ReactNode }) => (
  <div className="flex min-h-[30rem] items-center justify-center">
    <div className="w-full">
      <div className="mx-auto max-w-5xl">{children}</div>
    </div>
  </div>
);

const ActiveSubscriptionCard = ({ handleManageSubscription, isPortalLoading }: { 
  handleManageSubscription: () => void;
  isPortalLoading: boolean;
}) => (
  <Card className="p-12 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 shadow-lg">
    <div className="text-center space-y-6">
      <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
        <Settings className="h-8 w-8 text-primary" />
      </div>

      <div className="space-y-2">
        <h3 className="text-2xl font-semibold">Customer Portal</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Access your secure customer portal to manage all aspects of your subscription.
        </p>
      </div>

      <Button
        onClick={handleManageSubscription}
        size="lg"
        className="gap-2 px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
        disabled={isPortalLoading}
      >
        {isPortalLoading ? "Opening..." : "Open Customer Portal"}
        <ArrowRight className="h-5 w-5" />
      </Button>

      <div className="pt-4 flex items-center justify-center gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <span>Secure Access</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>Cancel Anytime</span>
        </div>
      </div>
    </div>
  </Card>
);

function AccountSubscriptionsInner() {
  const { data: subscriptionData, isLoading, error } = useSubscription();
  const { data: identity, isLoading: isIdentityLoading } = useGetIdentity<Identity>();
  
  // Get current URL for return_url
  const returnUrl = getCurrentLocation().href;

  const {
    mutate: createCustomerPortal,
    isLoading: isPortalLoading,
    data: portalData,
    error: portalError,
  } = useCustomerPortal({ return_url: returnUrl });

  // Get Stripe configuration from plugin meta
  const billingMeta = usePluginMeta<BillingPluginMeta>("billing");

  const handleManageSubscription = () => {
    createCustomerPortal();
  };

  // Handle portal response effect
  React.useEffect(() => {
    if (portalData?.url) {
      // Redirect in the same window instead of opening a new tab
      window.location.href = portalData.url;
    }
  }, [portalData]);

  // Handle portal error effect
  React.useEffect(() => {
    if (portalError) {
      console.error("Failed to create customer portal session:", portalError);
    }
  }, [portalError]);

  // Show loading state
  if (isLoading || isIdentityLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <SkeletonLoader layout="card" rows={3} />
      </div>
    );
  }

  // Show error state
  if (error) {
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

  const isSubscribed = subscriptionData?.data?.is_subscribed;
  const hasStripeConfig =
    billingMeta?.stripe_pricing_table_id && billingMeta?.stripe_publishable_key;

  return (
    <>
      <PageHeader
        title={isSubscribed ? "Manage Your Subscription" : "Choose Your Plan"}
        description={
          isSubscribed
            ? "Manage your subscription, update payment methods, view invoices, and more."
            : "Select the perfect plan for your needs. Upgrade, downgrade, or cancel anytime."
        }
      />

      {/* Portal Button for Subscribed Users */}
      {isSubscribed && (
        <SubscriptionContainer>
          <ActiveSubscriptionCard 
            handleManageSubscription={handleManageSubscription} 
            isPortalLoading={isPortalLoading} 
          />
        </SubscriptionContainer>
      )}

      {/* Pricing Table Embed Section - Only show if not subscribed and config is available */}
      {!isSubscribed && hasStripeConfig && (
        <SubscriptionContainer>
          <Card>
            <CardHeader className="text-center">
              <p className="text-muted-foreground text-sm">
                Secure payment powered by Stripe
              </p>
            </CardHeader>
            <CardContent>
              <StripePricingTable
                pricingTableId={billingMeta.stripe_pricing_table_id}
                publishableKey={billingMeta.stripe_publishable_key}
                customerEmail={identity?.email}
                clientReferenceId={identity?.id?.toString()}
              />
            </CardContent>
          </Card>
        </SubscriptionContainer>
      )}

      {/* Fallback message when Stripe config is not available */}
      {!isSubscribed && !hasStripeConfig && (
        <SubscriptionContainer>
          <Card className="bg-muted/30 border-2 border-dashed">
            <CardContent className="p-8">
              <h3 className="mb-2 text-lg font-semibold">
                Subscription Plans Unavailable
              </h3>
              <p className="text-muted-foreground">
                Subscription plans are currently not available. Please contact
                support for assistance.
              </p>
            </CardContent>
          </Card>
        </SubscriptionContainer>
      )}
    </>
  );
}
function AccountSubscriptions() {
  return (
    <Authenticated key="account" v3LegacyAuthProviderCompatible>
      <GeneralLayout>
        <AccountSubscriptionsInner />
      </GeneralLayout>
    </Authenticated>
  );
}

export default withTheme(AccountSubscriptions);
