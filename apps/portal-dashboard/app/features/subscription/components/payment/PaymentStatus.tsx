import React from 'react';
import { SubscriptionPlan, Subscription } from '../../types/subscription.types';
import { Alert, AlertDescription, AlertTitle } from 'portal-shared/components/ui/alert';
import { Button } from 'portal-shared/components/ui/button';
import { Clock, AlertCircle, CheckCircle } from 'portal-shared/components/icons';
import { useSubscriptionContext } from '../../contexts/SubscriptionContext';

interface PaymentStatusProps {
  status: 'active' | 'ending-soon' | 'expired';
  plan?: SubscriptionPlan;
  subscription?: Subscription;
}

export function PaymentStatus({ status, plan, subscription }: PaymentStatusProps) {
  const { createSubscription } = useSubscriptionContext();

  const handleRetry = async () => {
    if (!plan) return;
    try {
      await createSubscription(plan);
    } catch (error) {
      console.error('Failed to retry subscription:', error);
    }
  };

  const getStatusDisplay = () => {
    switch (status) {
      case 'active':
        return {
          icon: <CheckCircle className="h-5 w-5 text-green-500" />,
          title: 'Payment Session Active',
          description: `Complete your payment to subscribe to the ${plan?.name} plan.`,
          variant: 'default' as const
        };
      case 'ending-soon':
        return {
          icon: <Clock className="h-5 w-5 text-yellow-500" />,
          title: 'Session Ending Soon',
          description: 'Please complete your payment in the next few minutes.',
          variant: 'warning' as const
        };
      case 'expired':
        return {
          icon: <AlertCircle className="h-5 w-5 text-destructive" />,
          title: 'Session Expired',
          description: 'Your payment session has expired. Please try again.',
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
        >
          Start New Payment Session
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
