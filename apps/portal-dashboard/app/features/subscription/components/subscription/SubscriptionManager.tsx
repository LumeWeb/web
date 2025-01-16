import React, { useState, useEffect } from 'react';
import { useSubscriptionContext } from '../../contexts/SubscriptionContext';
import { usePayment } from '../../hooks/core/usePayment';
import { useBilling } from '../../hooks/core/useBilling';
import { SubscriptionPlan } from '../../types/subscription.types';
import { Loader2, AlertCircle } from "portal-shared/components/icons";
import { Button } from 'portal-shared/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from 'portal-shared/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from 'portal-shared/components/ui/alert-dialog';

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
    validatePlanChange
  } = useSubscriptionContext();

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
          setBillingError('Please complete billing information before changing plans');
          return;
        }
      }

      if (!subscription) {
        // New subscription
        const result = await createSubscription(selectedPlan);
        if (result.payment && !selectedPlan.is_free) {
          const paymentStatus = getPaymentStatus(result.payment);
          if (paymentStatus === 'PENDING') {
            setShowPaymentDialog(true);
          }
        }
      } else {
        // Existing subscription
        const isValid = await validatePlanChange(subscription.plan, selectedPlan);
        if (!isValid) {
          setValidationError('Invalid plan change. Please try again.');
          return;
        }

        if (selectedPlan.price > subscription.plan.price) {
          // Upgrade
          const result = await updateSubscription(selectedPlan);
          if (result.payment && !selectedPlan.is_free) {
            const paymentStatus = getPaymentStatus(result.payment);
            if (paymentStatus === 'PENDING') {
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
      const error = err instanceof Error ? err.message : 'Subscription action failed';
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
      {/* Current Subscription */}
      {subscription && (
        <Card>
          <CardHeader>
            <CardTitle>Current Subscription</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>Plan: {subscription.plan.name}</p>
              <p>Status: {subscription.status}</p>
              <p>
                Price: ${subscription.plan.price}/{subscription.plan.period.toLowerCase()}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Plans */}
      <PlanSelector onPlanSelect={handlePlanSelect} />

      {/* Confirmation Dialog */}
      <AlertDialog 
        open={showConfirmDialog} 
        onOpenChange={(open) => {
          setShowConfirmDialog(open);
          if (!open) {
            setValidationError(null);
            setBillingError(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Subscription Change</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-2">
                {subscription
                  ? `Are you sure you want to ${
                      selectedPlan && selectedPlan.price > subscription.plan.price
                        ? 'upgrade'
                        : 'downgrade'
                    } to the ${selectedPlan?.name} plan?`
                  : `Are you sure you want to subscribe to the ${selectedPlan?.name} plan?`}
                
                {validationError && (
                  <div className="flex items-center gap-2 text-destructive text-sm mt-2">
                    <AlertCircle className="h-4 w-4" />
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
            <AlertDialogAction onClick={handleConfirm}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

