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
import { useSubscriptionMutations } from "../../hooks/mutations/useSubscriptionMutations";
import { Alert, AlertDescription } from "portal-shared/components/ui/alert";
import { validateBillingInfo } from "../../services/billing";

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
  const { createSubscription, updateSubscription } = useSubscriptionMutations();

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

  const [validationError, setValidationError] = useState<string | null>(null);
  const [billingError, setBillingError] = useState<string | null>(null);
  const { showConfirmDialog, setShowConfirmDialog, validatePlanChange } =
    useSubscriptionConfirmation();

  const {
    dialog,
    openPlanChangeDialog,
    openCancelDialog,
    openPaymentDialog,
    closeDialog,
  } = useSubscriptionDialog();

  // Handle plan selection state changes
  useEffect(() => {
    if (state === "pending" && context.selectedPlan) {
      setShowConfirmDialog(true);
    }
  }, [state, context.selectedPlan]);

  const handlePlanSelect = (plan: SubscriptionPlan) => {
    try {
      setLocalError(null);
      setValidationError(null);
      setBillingError(null);

      selectPlan(plan);
      openPlanChangeDialog(plan);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to select plan";
      setLocalError(errorMessage);
      setValidationError(errorMessage);
    }
  };

  // Handle subscription state changes
  useEffect(() => {
    const handleSubscriptionChange = async () => {
      if (!context.selectedPlan || !showConfirmDialog) return;

      try {
        const isValid = await validatePlanChange(
          context.subscription?.plan,
          context.selectedPlan,
          context.billing,
        );

        if (!isValid) {
          setBillingError(
            "Please complete billing information before proceeding",
          );
          setValidationError("Invalid billing information");
          return;
        }

        if (context.subscription?.plan) {
          actions.updateSubscription();
          const { subscription } = await updateSubscription(
            context.selectedPlan,
          );
          if (subscription) {
            actions.subscriptionUpdated(subscription);
          }
        } else {
          actions.createSubscription();
          const { subscription } = await createSubscription(
            context.selectedPlan,
          );
          if (subscription) {
            actions.subscriptionCreated(subscription);
          }
        }

        if (context.selectedPlan.is_free) {
          complete();
        }

        setShowConfirmDialog(false);
        closeDialog();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Subscription action failed";
        setValidationError(errorMessage);
        send({ type: "ERROR", error: new Error(errorMessage) });
      }
    };

    if (state === "pending" && showConfirmDialog) {
      handleSubscriptionChange();
    }
  }, [
    state,
    context.selectedPlan,
    showConfirmDialog,
    context.subscription,
    context.billing,
  ]);

  const handleConfirm = () => {
    if (!context.selectedPlan) {
      console.error("No plan selected in context");
      setValidationError("No plan selected");
      return;
    }

    setValidationError(null);
    setBillingError(null);
    setLocalError(null);
    setShowConfirmDialog(true);
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
            actions.cancelPlanSelection();
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
