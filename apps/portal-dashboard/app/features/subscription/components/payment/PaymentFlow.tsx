import React from "react";
import { useSubscriptionContext } from "../../contexts/SubscriptionContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "portal-shared/components/ui/dialog";
import HyperPayment from "@/features/subscription/components/payment/HyperPayment";

export function PaymentFlow() {
  const { showPaymentDialog, setShowPaymentDialog, subscription, state } =
    useSubscriptionContext();

  console.log("PaymentFlow - state:", state);
  console.log("PaymentFlow - subscription:", subscription);

  // Show payment dialog for both active and pending subscriptions with payment details
  const hasPaymentDetails = subscription?.payment?.client_secret;
  
  if (!hasPaymentDetails || state.type === "LOADING" || state.type === "ERROR") {
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
