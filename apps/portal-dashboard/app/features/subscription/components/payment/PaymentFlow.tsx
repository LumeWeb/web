import React from "react";
import { useSubscriptionContext } from "../../contexts/SubscriptionContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "portal-shared/components/ui/dialog";
import HyperPayment from "@/features/subscription/components/payment/HyperPayment";
import { ExclamationCircleIcon } from "portal-shared/components/icons";
import { usePayment } from "../../hooks/core/usePayment";

export function PaymentFlow() {
  const { 
    showPaymentDialog, 
    setShowPaymentDialog, 
    context,
    state,
    send 
  } = useSubscriptionContext();

  const { getPaymentStatus, isPaymentExpired } = usePayment();

  const handlePaymentSuccess = (paymentMethodId: string) => {
    send('PAYMENT_COMPLETE', { paymentMethodId });
    setShowPaymentDialog(false);
  };

  const handlePaymentFailure = (error: Error) => {
    send('PAYMENT_FAILED', { error: error.message });
    setShowPaymentDialog(false);
  };

  // Don't show if not in pending payment state or no payment info
  if (!current.matches('pendingPayment') || !context.payment?.clientSecret) {
    return null;
  }

  // Check if payment session is expired
  if (context.payment && isPaymentExpired(context.payment)) {
    return (
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Payment Session Expired</DialogTitle>
            <DialogDescription>
              <div className="flex items-center gap-2 text-destructive">
                <ExclamationCircleIcon className="h-5 w-5" />
                <span>Your payment session has expired. Please try again.</span>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  const paymentStatus = getPaymentStatus(context.payment);

  return (
    <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Complete Payment</DialogTitle>
          <DialogDescription>
            {paymentStatus === 'PROCESSING' ? (
              'Your payment is being processed...'
            ) : (
              'Please complete your payment to activate your subscription.'
            )}
          </DialogDescription>
        </DialogHeader>
        <HyperPayment
          mode="subscribe"
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentError={handlePaymentFailure}
        />
      </DialogContent>
    </Dialog>
  );
}
