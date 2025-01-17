import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "@remix-run/react";
import {
  SubscriptionProvider,
  useSubscriptionContext,
} from "../../contexts/SubscriptionContext";
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
import {
  CloudIcon,
  ExclamationCircleIcon,
} from "portal-shared/components/icons";
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
import { useSubscriptionMachine } from "../../hooks/useSubscriptionMachine";
import { useSubscriptionDialog } from "@/features/subscription/hooks/ui/useSubscriptionDialog";
import { useSubscriptionConfirmation } from "@/features/subscription/hooks/ui/useSubscriptionConfirmation";
import { Alert, AlertDescription } from "portal-shared/components/ui/alert";

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
    actions: { selectPlan, updateBilling, complete, cancel, retry },
  } = useSubscriptionMachine();

  const { isLoading } = useSubscriptionContext();
  const [localError, setLocalError] = useState<string | null>(null);

  const { data: subscriptionData, isLoading: isLoadingSubscription } =
    useSubscription();

  useEffect(() => {
    if (!isLoadingSubscription && subscriptionData?.data) {
      send({
        type: "SUBSCRIPTION_LOADED",
        subscription: subscriptionData.data,
      });
    }
  }, [isLoadingSubscription, subscriptionData, send]);

  const selectedPlan = useMemo(() => {
    if (state === "pending" || state === "pendingPayment") {
      return context.selectedPlan;
    }
    if (state === "active" || state === "cancelled") {
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

  const {
    showConfirmDialog,
    setShowConfirmDialog,
    validationError,
    billingError,
    validatePlanChange
  } = useSubscriptionConfirmation();

  const {
    dialog,
    openPlanChangeDialog,
    openCancelDialog,
    openPaymentDialog,
    closeDialog
  } = useSubscriptionDialog();

  const handlePlanSelect = async (plan: SubscriptionPlan) => {
    try {
      setLocalError(null);

      if (plan.is_free) {
        selectPlan(plan);
        complete();
        return;
      }

      const isValid = await validatePlanChange(
        context.subscription?.plan,
        plan,
        context.billing
      );

      if (isValid) {
        selectPlan(plan);
        setShowConfirmDialog(true);
      }
    } catch (err) {
      setLocalError(
        err instanceof Error ? err.message : "Failed to select plan"
      );
    }
  };

  const handleConfirm = async () => {
    if (!selectedPlan) return;
    setValidationError(null);
    setBillingError(null);
    setLocalError(null);

    try {
      // Validate billing info if required
      if (!selectedPlan.is_free) {
        const billingErrors = await validateBillingInfo(context.billing);
        if (billingErrors) {
          setBillingError(
            "Please complete billing information before changing plans",
          );
          return;
        }
      }

      // Send events to state machine with proper payloads
      send("SELECT_PLAN", {
        plan: selectedPlan,
        billing: !selectedPlan.is_free ? context.billing : null,
      });

      if (selectedPlan.is_free) {
        send("COMPLETE");
      }

      setShowConfirmDialog(false);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Subscription action failed";
      setValidationError(errorMessage);
      send("ERROR", { error: new Error(errorMessage) });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <CloudIcon className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading subscription details...</span>
      </div>
    );
  }

  if (localError) {
    return (
      <Alert variant="destructive" className="m-4">
        <ExclamationCircleIcon className="h-4 w-4" />
        <AlertDescription>{localError}</AlertDescription>
      </Alert>
    );
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
              {context.subscription
                ? "Confirm Subscription Change"
                : "Confirm Subscription"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-2">
                {context.subscription ? (
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
