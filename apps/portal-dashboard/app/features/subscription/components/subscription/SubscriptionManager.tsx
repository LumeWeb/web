import React, { useState } from "react";
import { SubscriptionProvider } from "../../contexts/SubscriptionContext";
import { useSearchParams } from "@remix-run/react";
import { useSubscriptionContext } from "../../contexts/SubscriptionContext";
import { usePayment } from "../../hooks/core/usePayment";
import { useBilling } from "../../hooks/core/useBilling";
import { SubscriptionPlan } from "../../types/subscription.types";
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
    subscription,
    plans,
    selectedPlan,
    setSelectedPlan,
    error,
    isLoading,
    isProcessing,
    createSubscription,
    updateSubscription,
    cancelSubscription,
    validatePlanChange,
  } = useSubscriptionContext();

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
      id: 'billing',
      label: 'Billing Information',
      component: <BillingForm />,
      show: () => paidBillingEnabled
    },
    {
      id: 'payment-history',
      label: 'Payment History',
      component: <PaymentHistory />,
      show: () => paidBillingEnabled && !onFreePlan
    },
    {
      id: 'payment-method',
      label: 'Payment Method',
      component: <PaymentMethod />,
      show: () => paidBillingEnabled && !onFreePlan
    },
    {
      id: 'addons',
      label: 'Add-ons',
      component: <Addons />,
      show: () => false // Currently disabled
    }
  ];

  const searchTab = searchParams.get("tab") ?? "billing";

  const [validationError, setValidationError] = useState<string | null>(null);
  const [billingError, setBillingError] = useState<string | null>(null);
  const { validateBillingInfo, formatBillingInfo } = useBilling();

  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);

  const handlePlanSelect = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
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

      if (!subscription) {
        try {
          console.log('Creating subscription with plan:', selectedPlan);
          const newSubscription = await createSubscription(selectedPlan);
          console.log('Created subscription:', newSubscription);
          
        } catch (error) {
          console.error('Error creating subscription:', error);
          throw error;
        }
      } else {
        // Existing subscription
        const isValid = await validatePlanChange(
          subscription.plan,
          selectedPlan,
        );
        if (!isValid) {
          setValidationError("Invalid plan change. Please try again.");
          return;
        }

        // Let the backend handle the plan change logic
        await updateSubscription(selectedPlan);
        
        // Show payment dialog if needed (backend will indicate this via response)
        if (!selectedPlan.is_free && subscription.payment?.client_secret) {
          setShowPaymentDialog(true);
        }
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
            {SUBSCRIPTION_TABS.map(tab => 
              tab.show() && (
                <TabsTrigger key={tab.id} value={tab.id}>
                  {tab.label}
                </TabsTrigger>
              )
            )}
          </TabsList>

          {SUBSCRIPTION_TABS.map(tab =>
            tab.show() && (
              <TabsContent key={tab.id} value={tab.id}>
                {tab.component}
              </TabsContent>
            )
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
              {subscription ? 'Confirm Subscription Change' : 'Confirm Subscription'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-2">
                {subscription ? (
                  <>
                    Are you sure you want to change to the {selectedPlan?.name} plan?
                  </>
                ) : (
                  <>
                    You are about to subscribe to the {selectedPlan?.name} plan.
                    {!selectedPlan?.is_free && ' Payment information will be required.'}
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
