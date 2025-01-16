import React from 'react';
import { useSubscriptionContext } from '../../contexts/SubscriptionContext';
import { Button } from 'portal-shared/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from 'portal-shared/components/ui/card';
import { usePaymentMethod } from '../../hooks/usePaymentMethod';
import HyperPayment from './HyperPayment';

export function PaymentMethod() {
  const { subscription } = useSubscriptionContext();
  const { 
    clientSecret,
    isInitializing,
    isSaving,
    initializePayment,
    savePaymentMethod 
  } = usePaymentMethod();

  const handleUpdatePayment = async () => {
    await initializePayment();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Method</CardTitle>
      </CardHeader>
      <CardContent>
        {subscription?.payment?.payment_method ? (
          <div className="space-y-4">
            <div>
              Current payment method: {subscription.payment.payment_method}
            </div>
            <Button 
              onClick={handleUpdatePayment}
              disabled={isInitializing || isSaving}
            >
              Update Payment Method
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-muted-foreground">
              No payment method on file
            </div>
            <Button 
              onClick={handleUpdatePayment}
              disabled={isInitializing || isSaving}
            >
              Add Payment Method
            </Button>
          </div>
        )}

        {clientSecret && (
          <HyperPayment
            mode="setup"
            onPaymentSuccess={() => {
              // Handle successful payment method update
            }}
          />
        )}
      </CardContent>
    </Card>
  );
}
