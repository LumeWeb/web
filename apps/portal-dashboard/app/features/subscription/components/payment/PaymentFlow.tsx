import React, { useEffect, useState } from "react";
import { useSubscriptionContext } from "../../contexts/SubscriptionContext";
import { usePaymentMachine } from "../../hooks/usePaymentMachine";
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
    actions: paymentActions 
  } = usePaymentMachine();

  const handlePaymentSuccess = () => {
    paymentActions.completePayment();
    send({ type: "PAYMENT_COMPLETE" });
  };

  const handlePaymentFailure = (error: Error) => {
    paymentActions.handleError(error);
    send({
      type: "ERROR",
      error: new Error(error.message),
    });
    setIsOpen(true); // Keep dialog open on error
  };

  const handleRetry = () => {
    paymentActions.retry();
  };

  const [isOpen, setIsOpen] = useState(false);
  const { handleOpenChange } = useDialogState({
    isOpen,
    onOpenChange: setIsOpen,
    shouldPreventClose: true,
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
                ? `Payment failed. ${context.retryCount < MAX_RETRIES ? "Please try again." : "Maximum retry attempts reached."}`
                : "Please complete your payment to activate your subscription."}
          </DialogDescription>
        </DialogHeader>
        {paymentState === "error" && context.retryCount < MAX_RETRIES && (
          <div className="flex justify-end p-4">
            <Button onClick={handleRetry} variant="secondary">
              Retry Payment
            </Button>
          </div>
        )}
        <HyperPayment
          mode="subscribe"
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentError={handlePaymentFailure}
        />
      </DialogContent>
    </Dialog>
  );
}
