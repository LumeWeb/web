import React, { useEffect, useState } from 'react';
import { useSubscriptionContext } from '../../contexts/SubscriptionContext';
import { usePayment } from '../../hooks/core/usePayment';
import { PaymentStatus } from './PaymentStatus';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from 'portal-shared/components/ui/dialog';
import { Button } from 'portal-shared/components/ui/button';
import { usePaymentMutations } from '../../hooks/mutations/usePaymentMutations';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

export function PaymentFlow() {
  const {
    showPaymentDialog,
    setShowPaymentDialog,
    subscription,
    selectedPlan,
    error: subscriptionError
  } = useSubscriptionContext();
  
  const { getPaymentStatus, isPaymentExpired } = usePayment();
  const [paymentStatus, setPaymentStatus] = useState<'active' | 'ending-soon' | 'expired'>('active');
  const { connectPaymentMethod, error: paymentError } = usePaymentMutations();
  const [stripePromise, setStripePromise] = useState<Promise<any> | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    if (subscription?.payment?.publishable_key) {
      setStripePromise(loadStripe(subscription.payment.publishable_key));
    }
  }, [subscription?.payment?.publishable_key]);

  useEffect(() => {
    if (subscription?.payment?.expires_at && showPaymentDialog) {
      const checkExpiry = () => {
        const expiryDate = new Date(subscription.payment.expires_at!);
        const remaining = expiryDate.getTime() - Date.now();
        
        if (remaining <= 0) {
          setPaymentStatus('expired');
          setShowPaymentDialog(false);
        } else if (remaining < 120000) { // 2 minutes
          setPaymentStatus('ending-soon');
        }
      };

      checkExpiry();
      const interval = setInterval(checkExpiry, 1000);
      return () => clearInterval(interval);
    }
  }, [subscription?.payment?.expires_at, showPaymentDialog, setShowPaymentDialog]);

  const handlePaymentSuccess = async (paymentMethodId: string) => {
    setProcessingPayment(true);
    try {
      const result = await connectPaymentMethod(paymentMethodId);
      if (result.data.payment.status === 'SUCCEEDED') {
        setShowPaymentDialog(false);
      }
    } catch (error) {
      console.error('Payment failed:', error);
    } finally {
      setProcessingPayment(false);
    }
  };

  if (!subscription?.payment?.client_secret || !stripePromise) {
    return null;
  }

  return (
    <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Complete Payment</DialogTitle>
          <DialogDescription>
            <div className="space-y-4">
              <PaymentStatus 
                status={paymentStatus}
                plan={selectedPlan}
                subscription={subscription}
              />
              
              {paymentStatus === 'active' && !processingPayment && (
                <Elements 
                  stripe={stripePromise} 
                  options={{
                    clientSecret: subscription.payment.client_secret,
                    appearance: { theme: 'stripe' }
                  }}
                >
                  <PaymentForm 
                    onSuccess={handlePaymentSuccess}
                    error={paymentError || subscriptionError}
                    isProcessing={processingPayment}
                  />
                </Elements>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

interface PaymentFormProps {
  onSuccess: (paymentMethodId: string) => Promise<void>;
  error?: Error | null;
  isProcessing?: boolean;
}

function PaymentForm({ onSuccess, error: externalError, isProcessing }: PaymentFormProps) {
  const { subscription } = useSubscriptionContext();
  const [internalError, setInternalError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const error = externalError?.message || internalError;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setProcessing(true);
    setError(null);

    try {
      // Handle Stripe payment submission
      // This is a placeholder - implement actual Stripe payment logic
      const paymentMethodId = 'pm_123'; // This would come from Stripe
      await onSuccess(paymentMethodId);
    } catch (err) {
      setInternalError(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Stripe Elements would go here */}
      {error && (
        <div className="text-destructive text-sm">
          {error}
        </div>
      )}
      <Button 
        type="submit" 
        disabled={processing}
        className="w-full"
      >
        {processing ? 'Processing...' : `Pay $${subscription?.plan.price}`}
      </Button>
    </form>
  );
}
