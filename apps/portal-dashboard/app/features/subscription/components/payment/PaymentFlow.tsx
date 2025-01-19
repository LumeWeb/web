import React, { useEffect, useState } from "react";
import { useSubscriptionContext } from "../../contexts/SubscriptionContext";
import { usePaymentContext } from "../../contexts/PaymentContext";
import { MAX_RETRIES } from "../../machines/paymentMachine";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "portal-shared/components/ui/dialog";
import HyperPayment from "@/features/subscription/components/payment/HyperPayment";
import { ExclamationCircleIcon } from "portal-shared/components/icons";
import { usePayment } from "../../hooks/core/usePayment";
import { useDialogState } from "../../hooks/useDialogState";
import { Button } from "portal-shared/components/ui/button";

export function PaymentFlow() {
  const { state, context, send } = useSubscriptionContext();

  const { getPaymentStatus, isPaymentExpired } = usePayment();

  const {
    state: paymentState,
    context: paymentContext,
    actions: paymentActions,
  } = usePaymentContext();

  const handlePaymentSuccess = () => {
    paymentActions.completePayment();
    send({ type: "PAYMENT_COMPLETE" });
  };

  const handlePaymentFailure = (error: Error) => {
    paymentActions.handleError(error);
    setIsOpen(true); // Keep dialog open on error
  };

  const handleRetry = () => {
    paymentActions.retry();
  };

  const [isOpen, setIsOpen] = useState(false);
  const { handleOpenChange } = useDialogState({
    isOpen,
    onOpenChange: (open: boolean) => {
      if (!open) {
        send({ type: "PAYMENT_CLOSE" });
      }
      setIsOpen(open);
    },
    shouldPreventClose: paymentState === "processing",
  });

  useEffect(() => {
    if (state === "pendingPayment") {
      setIsOpen(true);
    } else if (paymentState !== "error") {
      setIsOpen(false);
    }
  }, [state, paymentState]);

  // Don't render if no payment info
  if (!context.payment?.client_secret) {
    return null;
  }

  // Check if payment session is expired
  if (context.payment && isPaymentExpired(context.payment)) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">
              Payment Session Expired
            </DialogTitle>
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
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Complete Payment</DialogTitle>
          <DialogDescription>
            {paymentStatus === "PROCESSING"
              ? "Your payment is being processed..."
              : paymentState === "error"
                ? `Payment failed. ${paymentContext.retryCount < MAX_RETRIES ? "Please try again." : "Maximum retry attempts reached."}`
                : "Please complete your payment to activate your subscription."}
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
