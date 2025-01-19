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
import { PaymentProvider } from '../../contexts/PaymentContext';

export function PaymentMethod() {
  const { subscription } = useSubscriptionContext();
  const {
    state,
    context,
    actions: {
      initialize,
      handleInitialized,
      startCollection,
      validate,
      handleValidated,
      save,
      handleError
    }
  } = usePaymentMethodMachine();

  const handleUpdatePayment = () => {
    initialize();
  };

  const handlePaymentSuccess = (paymentMethodId: string) => {
    handleValidated(paymentMethodId);
    save();
  };

  const handlePaymentError = (error: Error) => {
    handleError(error);
  };

  return (
    <PaymentProvider>
      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
        </CardHeader>
        <CardContent>
        {context.error && (
          <Alert variant="destructive" className="mb-4">
            <ExclamationCircleIcon className="h-4 w-4" />
            <AlertDescription>{context.error.message}</AlertDescription>
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
                disabled={state === 'initializing' || state === 'saving'}>
                {state === 'initializing' || state === 'saving' ? (
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
    </PaymentProvider>
  );
}
