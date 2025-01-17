import React, { useState } from 'react';
import { useSubscriptionContext } from '../../contexts/SubscriptionContext';
import { Button } from 'portal-shared/components/ui/button';
import { CloudIcon, ExclamationCircleIcon } from 'portal-shared/components/icons';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from 'portal-shared/components/ui/card';
import { usePaymentMethod } from '../../hooks/usePaymentMethod';
import HyperPayment from '@/features/subscription/components/payment/HyperPayment';
import { Alert, AlertDescription } from 'portal-shared/components/ui/alert';

export function PaymentMethod() {
  const { subscription, state, send } = useSubscriptionContext();
  const [error, setError] = useState<string | null>(null);
  const { 
    clientSecret,
    isInitializing,
    isSaving,
    initializePayment,
    savePaymentMethod 
  } = usePaymentMethod();

  const handleUpdatePayment = async () => {
    try {
      setError(null);
      await initializePayment();
      send('PAYMENT_METHOD_UPDATE_INITIATED');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize payment update');
    }
  };

  const handlePaymentSuccess = async (paymentMethodId: string) => {
    try {
      setError(null);
      await savePaymentMethod(paymentMethodId);
      send('PAYMENT_METHOD_UPDATED', { paymentMethodId });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save payment method');
      send('PAYMENT_METHOD_UPDATE_FAILED', { error: err });
    }
  };

  const handlePaymentError = (err: Error) => {
    setError(err.message);
    send('PAYMENT_METHOD_UPDATE_FAILED', { error: err });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Method</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <ExclamationCircleIcon className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-4">
          {subscription?.payment?.payment_method ? (
            <>
              <div className="flex flex-col gap-1">
                <div className="font-medium">Current Payment Method</div>
                <div className="text-sm text-muted-foreground">
                  {subscription.payment.brand} •••• {subscription.payment.lastFour}
                </div>
              </div>
              <Button 
                onClick={handleUpdatePayment}
                disabled={isInitializing || isSaving || current.matches('updatingPayment')}>
                {isInitializing || isSaving || state === 'updatingPayment' ? (
                  <>
                    <CloudIcon className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Update Payment Method'
                )}
              </Button>
            </>
          ) : (
            <>
              <div className="text-muted-foreground">
                No payment method on file
              </div>
              <Button 
                onClick={handleUpdatePayment}
                disabled={isInitializing || isSaving || state === 'updatingPayment'}>
                {isInitializing || isSaving || state === 'updatingPayment' ? (
                  <>
                    <CloudIcon className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Add Payment Method'
                )}
              </Button>
            </>
          )}

          {clientSecret && (
            <div className="mt-4">
              <CardDescription className="mb-4">
                Please enter your payment details below
              </CardDescription>
              <HyperPayment
                mode="setup"
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentError={handlePaymentError}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
