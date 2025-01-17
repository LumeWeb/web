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
  const { showPaymentDialog, setShowPaymentDialog, payment, state } =
    useSubscriptionContext();

  // Show payment dialog when in PENDING_PAYMENT state and has payment details
  const hasPaymentDetails = payment?.client_secret;

  if (
    !hasPaymentDetails ||
    state.type !== SubscriptionPlanStatus.PENDING_PAYMENT
  ) {
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
