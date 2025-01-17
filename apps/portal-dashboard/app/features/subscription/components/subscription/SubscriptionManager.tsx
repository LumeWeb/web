import React, { useEffect, useState } from "react";
import { useSearchParams } from "@remix-run/react";
import {
  SubscriptionProvider,
  useSubscriptionContext,
} from "../../contexts/SubscriptionContext";
import { useBilling } from "../../hooks/core/useBilling";
import {
  DEFAULT_SUBSCRIPTION,
  SubscriptionPlan,
} from "../../types/subscription.types";
import { SubscriptionStatus } from "./SubscriptionStatus";
import { PlanSelector } from "./PlanSelector";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "portal-shared/components/ui/tabs";
import useIsPaidBillingEnabled from "portal-shared/hooks/useIsPaidBillingEnabled";
import useOnFreePlan from "portal-shared/hooks/useOnFreePlan";
import { ExclamationCircleIcon } from "portal-shared/components/icons";
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
import { BillingForm } from "../billing/BillingForm";
import { PaymentHistory } from "../payment/PaymentHistory";
import { PaymentMethod } from "@/features/subscription/components/payment/PaymentMethod";
import { PaymentFlow } from "@/features/subscription/components/payment/PaymentFlow";
import Addons from "@/routes/account/components/Addons";
import { useSubscription } from "@/features/subscription/hooks/core/useSubscription";
import { SubscriptionPlanStatus } from "portal-shared/dataProviders/accountProvider";

export function SubscriptionManager() {
  return (
    <SubscriptionProvider>
      <SubscriptionContent />
    </SubscriptionProvider>
  );
}

export default SubscriptionManager;

function SubscriptionContent() {
  const {
    state,
    context,
    send,
    selectPlan,
    updateBilling,
    complete,
    cancel,
    retry
  } = useSubscriptionMachine();

  const { subscription, plans, error, isLoading } = useSubscriptionContext();

  const { data: subscriptionData, isLoading: isLoadingSubscription } =
    useSubscription();

  useEffect(() => {
    if (!isLoadingSubscription && subscriptionData?.data) {
      send('LOADED', { subscription: subscriptionData.data });
    }
  }, [isLoadingSubscription, subscriptionData, send]);

  const selectedPlan = useMemo(() => {
    if (state === 'pending' || state === 'pendingPayment') {
      return context.selectedPlan;
    }
    if (state === 'active' || state === 'cancelled') {
      return context.subscription?.plan;
    }
    return null;
  }, [state, context]);

  const [searchParams, setSearchParams] = useSearchParams();
  const paidBillingEnabled = useIsPaidBillingEnabled();
  const onFreePlan = useOnFreePlan();

  interface Tab {
    id: string;
    label: string;
    component: React.ReactNode;
    show: () => boolean;
  }

  const SUBSCRIPTION_TABS: Tab[] = [
    {
      id: "billing",
      label: "Billing Information",
      component: <BillingForm />,
      show: () => paidBillingEnabled,
    },
    {
      id: "payment-history",
      label: "Payment History",
      component: <PaymentHistory />,
      show: () => paidBillingEnabled && !onFreePlan,
    },
    {
      id: "payment-method",
      label: "Payment Method",
      component: <PaymentMethod />,
      show: () => paidBillingEnabled && !onFreePlan,
    },
    {
      id: "addons",
      label: "Add-ons",
      component: <Addons />,
      show: () => false, // Currently disabled
    },
  ];

  const searchTab = searchParams.get("tab") ?? "billing";

  const [validationError, setValidationError] = useState<string | null>(null);
  const [billingError, setBillingError] = useState<string | null>(null);
  const { validateBillingInfo, formatBillingInfo } = useBilling();

  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);

  const handlePlanSelect = (plan: SubscriptionPlan) => {
    if (plan.is_free) {
      return;
    }
    
    // Validate plan change if needed
    if (subscription?.plan) {
      const isDowngrade = plan.price < subscription.plan.price;
      if (isDowngrade) {
        setValidationError("Downgrades are not allowed");
        return;
      }
    }
    
    selectPlan(plan);
    setShowConfirmDialog(true);
  };

  const handleConfirm = async () => {
    if (!selectedPlan) return;
    setValidationError(null);
    setBillingError(null);

    try {
      // Validate billing info if required
      if (subscription?.billing) {
        const billingErrors = await validateBillingInfo(subscription.billing);
        if (billingErrors) {
          setBillingError(
            "Please complete billing information before changing plans",
          );
          return;
        }
      }

      selectPlan(selectedPlan);
      
      if (state === 'pendingPayment') {
        setShowPaymentDialog(true);
      }

      setShowConfirmDialog(false);
    } catch (err) {
      const error =
        err instanceof Error ? err.message : "Subscription action failed";
      setValidationError(error);
    }
  };

  if (isLoading) {
    return <div>Loading subscription details...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Subscription Status */}
      <SubscriptionStatus />

      {/* Available Plans */}
      <PlanSelector onPlanSelect={handlePlanSelect} />

      {/* Billing Tabs */}
      <div className="border-t border-border/30 pt-4">
        <Tabs
          defaultValue={searchTab}
          onValueChange={(value) => setSearchParams({ tab: value })}
          className="space-y-4">
          <TabsList>
            {SUBSCRIPTION_TABS.map(
              (tab) =>
                tab.show() && (
                  <TabsTrigger key={tab.id} value={tab.id}>
                    {tab.label}
                  </TabsTrigger>
                ),
            )}
          </TabsList>

          {SUBSCRIPTION_TABS.map(
            (tab) =>
              tab.show() && (
                <TabsContent key={tab.id} value={tab.id}>
                  {tab.component}
                </TabsContent>
              ),
          )}
        </Tabs>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog
        open={showConfirmDialog}
        onOpenChange={(open) => {
          setShowConfirmDialog(open);
          if (!open) {
            setValidationError(null);
            setBillingError(null);
          }
        }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {subscription
                ? "Confirm Subscription Change"
                : "Confirm Subscription"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-2">
                {subscription ? (
                  <>
                    Are you sure you want to change to the {selectedPlan?.name}{" "}
                    plan?
                  </>
                ) : (
                  <>
                    You are about to subscribe to the {selectedPlan?.name} plan.
                    {!selectedPlan?.is_free &&
                      " Payment information will be required."}
                  </>
                )}

                {validationError && (
                  <div className="flex items-center gap-2 text-destructive text-sm mt-2">
                    <ExclamationCircleIcon className="h-4 w-4" />
                    <span>{validationError}</span>
                  </div>
                )}

                {billingError && (
                  <div className="flex items-center gap-2 text-destructive text-sm mt-2">
                    <ExclamationCircleIcon className="h-4 w-4" />
                    <span>{billingError}</span>
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Payment Flow Dialog */}
      <PaymentFlow />
    </div>
  );
}
