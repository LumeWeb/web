import React from "react";
import { useSubscriptionContext } from "../../contexts/SubscriptionContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "portal-shared/components/ui/dialog";
import HyperPayment from "@/features/subscription/components/payment/HyperPayment";
import { SubscriptionPlanStatus } from "portal-shared/dataProviders/accountProvider";

export function PaymentFlow() {
  const { 
    showPaymentDialog, 
    setShowPaymentDialog, 
    context,
    state,
    send 
  } = useSubscriptionContext();

  const handlePaymentSuccess = (paymentMethodId: string) => {
    send('PAYMENT_COMPLETE', { paymentMethodId });
    setShowPaymentDialog(false);
  };

  const handlePaymentFailure = (error: Error) => {
    send('PAYMENT_FAILED', { error: error.message });
    setShowPaymentDialog(false);
  };

  if (state !== 'pendingPayment' || !context.payment?.clientSecret) {
    return null;
  }

  return (
    <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Complete Payment</DialogTitle>
        </DialogHeader>
        <HyperPayment
          mode="subscribe"
          onPaymentSuccess={() => setShowPaymentDialog(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
