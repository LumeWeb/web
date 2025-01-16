import React, { useState } from "react";
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
import Addons from "@/routes/account/components/Addons";

export function SubscriptionManager() {
  const {
    subscription,
    plans,
    selectedPlan,
    setSelectedPlan,
    error,
    isLoading,
    isProcessing,
    showPaymentDialog,
    setShowPaymentDialog,
    createSubscription,
    updateSubscription,
    cancelSubscription,
    validatePlanChange,
  } = useSubscriptionContext();

  const [searchParams, setSearchParams] = useSearchParams();
  const paidBillingEnabled = useIsPaidBillingEnabled();
  const onFreePlan = useOnFreePlan();

  const TABS = {
    BILLING: "billing",
    PAYMENT_HISTORY: "payment-history",
    PAYMENT_METHOD: "payment-method",
    ADDONS: "addons",
  } as const;

  const searchTab =
    TABS[searchParams.get("tab") as keyof typeof TABS] ?? TABS.BILLING;

  const [validationError, setValidationError] = useState<string | null>(null);
  const [billingError, setBillingError] = useState<string | null>(null);
  const { getPaymentStatus, isPaymentExpired } = usePayment();
  const { validateBillingInfo } = useBilling();

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
        // New subscription
        const result = await createSubscription(selectedPlan);
        if (result.payment && !selectedPlan.is_free) {
          const paymentStatus = getPaymentStatus(result.payment);
          if (paymentStatus === "PENDING") {
            setShowPaymentDialog(true);
          }
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

        if (selectedPlan.price > subscription.plan.price) {
          // Upgrade
          const result = await updateSubscription(selectedPlan);
          if (result.payment && !selectedPlan.is_free) {
            const paymentStatus = getPaymentStatus(result.payment);
            if (paymentStatus === "PENDING") {
              setShowPaymentDialog(true);
            }
          }
        } else {
          // Downgrade with confirmation
          await cancelSubscription();
          await createSubscription(selectedPlan);
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
            {paidBillingEnabled && (
              <TabsTrigger value="billing">Billing Information</TabsTrigger>
            )}
            {paidBillingEnabled && !onFreePlan && (
              <TabsTrigger value="payment-history">Payment History</TabsTrigger>
            )}
            {paidBillingEnabled && !onFreePlan && (
              <TabsTrigger value="payment-method">Payment Method</TabsTrigger>
            )}
            {false && <TabsTrigger value="addons">Add-ons</TabsTrigger>}
          </TabsList>

          {paidBillingEnabled && (
            <TabsContent value="billing">
              <BillingForm />
            </TabsContent>
          )}

          {paidBillingEnabled && !onFreePlan && (
            <TabsContent value="payment-history">
              <PaymentHistory />
            </TabsContent>
          )}

          {paidBillingEnabled && !onFreePlan && (
            <TabsContent value="payment-method">
              <PaymentMethod />
            </TabsContent>
          )}

          {false && (
            <TabsContent value="addons">
              <Addons />
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* Billing Tabs */}
      <div className="border-t border-border/30 pt-4">
        <Tabs
          defaultValue={searchTab}
          onValueChange={(value) => setSearchParams({ tab: value })}
          className="space-y-4">
          <TabsList>
            {paidBillingEnabled && (
              <TabsTrigger value="billing">Billing Information</TabsTrigger>
            )}
            {paidBillingEnabled && !onFreePlan && (
              <TabsTrigger value="payment-history">Payment History</TabsTrigger>
            )}
            {paidBillingEnabled && !onFreePlan && (
              <TabsTrigger value="payment-method">Payment Method</TabsTrigger>
            )}
            {false && <TabsTrigger value="addons">Add-ons</TabsTrigger>}
          </TabsList>

          {paidBillingEnabled && (
            <TabsContent value="billing">
              <BillingForm />
            </TabsContent>
          )}

          {paidBillingEnabled && !onFreePlan && (
            <TabsContent value="payment-history">
              <PaymentHistory />
            </TabsContent>
          )}

          {paidBillingEnabled && !onFreePlan && (
            <TabsContent value="payment-method">
              <PaymentMethod />
            </TabsContent>
          )}

          {false && (
            <TabsContent value="addons">
              <Addons />
            </TabsContent>
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
            <AlertDialogTitle>Confirm Subscription Change</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-2">
                {subscription
                  ? `Are you sure you want to ${
                      selectedPlan &&
                      selectedPlan.price > subscription.plan.price
                        ? "upgrade"
                        : "downgrade"
                    } to the ${selectedPlan?.name} plan?`
                  : `Are you sure you want to subscribe to the ${selectedPlan?.name} plan?`}

                {validationError && (
                  <div className="flex items-center gap-2 text-destructive text-sm mt-2">
                    <ExclamationCircleIcon className="h-4 w-4" />
                    <span>{validationError}</span>
                  </div>
                )}

                {billingError && (
                  <div className="flex items-center gap-2 text-destructive text-sm mt-2">
                    <AlertCircle className="h-4 w-4" />
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
    </div>
  );
}
