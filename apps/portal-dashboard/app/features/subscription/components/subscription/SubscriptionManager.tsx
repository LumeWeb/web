import React from 'react';
import { useSubscriptionContext } from '../../contexts/SubscriptionContext';
import { useSubscriptionStateContext } from '../../contexts/SubscriptionStateContext';
import { SubscriptionPlan } from '../../types/subscription.types';
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
    setShowPaymentDialog
  } = useSubscriptionContext();

  const {
    state: subscriptionState,
    createSubscription,
    updateBilling,
    completePayment,
    cancelSubscription,
    isTransitioning
  } = useSubscriptionStateContext();

  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);

  const handlePlanSelect = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setShowConfirmDialog(true);
  };

  const handleConfirm = async () => {
    if (!selectedPlan) return;

    try {
      if (!subscription) {
        await createSubscription(selectedPlan);
      } else {
        // Handle plan change logic
        if (selectedPlan.price > subscription.plan.price) {
          // Upgrade
          await createSubscription(selectedPlan);
        } else {
          // Downgrade
          await cancelSubscription();
          await createSubscription(selectedPlan);
        }
      }
    } catch (err) {
      console.error('Subscription action failed:', err);
    } finally {
      setShowConfirmDialog(false);
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
      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.id}>
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p>${plan.price}/{plan.period.toLowerCase()}</p>
                <p>Storage: {formatBytes(plan.resources.storage)}</p>
                <p>Upload: {formatBytes(plan.resources.upload)}/month</p>
                <p>Download: {formatBytes(plan.resources.download)}/month</p>
                <Button
                  onClick={() => handlePlanSelect(plan)}
                  disabled={isProcessing || isTransitioning}
                  variant={subscription?.plan.id === plan.id ? 'outline' : 'default'}
                >
                  {subscription?.plan.id === plan.id 
                    ? 'Current Plan'
                    : subscription
                      ? plan.price > subscription.plan.price
                        ? 'Upgrade'
                        : 'Downgrade'
                      : 'Select Plan'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Subscription Change</AlertDialogTitle>
            <AlertDialogDescription>
              {subscription
                ? `Are you sure you want to ${
                    selectedPlan && selectedPlan.price > subscription.plan.price
                      ? 'upgrade'
                      : 'downgrade'
                  } to the ${selectedPlan?.name} plan?`
                : `Are you sure you want to subscribe to the ${selectedPlan?.name} plan?`}
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

function formatBytes(bytes: number): string {
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 B';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${Math.round(bytes / Math.pow(1024, i))} ${sizes[i]}`;
}
