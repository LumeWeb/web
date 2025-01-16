import React from 'react';
import { SubscriptionPlan, Subscription } from '../../types/subscription.types';
import { Alert, AlertDescription, AlertTitle } from 'portal-shared/components/ui/alert';
import { Button } from 'portal-shared/components/ui/button';
import { Clock, AlertCircle, CheckCircle } from 'portal-shared/components/icons';
import { useSubscriptionContext } from '../../contexts/SubscriptionContext';

interface PaymentStatusProps {
  status: PaymentStatus;
  plan?: SubscriptionPlan;
  subscription?: Subscription;
}

export function PaymentStatus({ status, plan, subscription }: PaymentStatusProps) {
  const handleRetry = () => {
    if (!plan) return;
    window.location.reload(); // Simple refresh to restart payment flow
  };

  const getStatusDisplay = () => {
    switch (status) {
      case 'PENDING':
        return {
          icon: <Clock className="h-5 w-5 text-yellow-500" />,
          title: 'Payment Pending',
          description: `Complete your payment to subscribe to the ${plan?.name} plan.`,
          variant: 'default' as const
        };
      case 'PROCESSING':
        return {
          icon: <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />,
          title: 'Processing Payment',
          description: 'Please wait while we process your payment.',
          variant: 'default' as const
        };
      case 'COMPLETED':
        return {
          icon: <CheckCircle className="h-5 w-5 text-green-500" />,
          title: 'Payment Complete',
          description: 'Your payment has been processed successfully.',
          variant: 'default' as const
        };
      case 'FAILED':
        return {
          icon: <AlertCircle className="h-5 w-5 text-destructive" />,
          title: 'Payment Failed',
          description: subscription?.payment?.errorMessage || 'Your payment could not be processed. Please try again.',
          variant: 'destructive' as const
        };
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <div className="space-y-4">
      <Alert variant={statusDisplay.variant}>
        <div className="flex items-center gap-2">
          {statusDisplay.icon}
          <div>
            <AlertTitle>{statusDisplay.title}</AlertTitle>
            <AlertDescription>{statusDisplay.description}</AlertDescription>
          </div>
        </div>
      </Alert>

      {status === 'expired' && (
        <Button 
          onClick={handleRetry}
          className="w-full"
          variant="outline"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Renewing Session...
            </>
          ) : (
            'Start New Payment Session'
          )}
        </Button>
      )}

      {subscription?.plan && (
        <div className="text-sm text-muted-foreground">
          <p>Plan: {subscription.plan.name}</p>
          <p>Amount: ${subscription.plan.price}/{subscription.plan.period.toLowerCase()}</p>
        </div>
      )}
    </div>
  );
}
