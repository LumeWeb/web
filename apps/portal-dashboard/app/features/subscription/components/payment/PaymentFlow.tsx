import React, { useEffect, useState } from "react";
import { useSubscriptionContext } from "../../contexts/SubscriptionContext";
import { PaymentError } from "../../types/payment.types";
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

export function PaymentFlow() {
  const { state, context, send } = useSubscriptionContext();

  const { getPaymentStatus, isPaymentExpired } = usePayment();

  const handlePaymentSuccess = (paymentMethodId: string) => {
    send({ type: "PAYMENT_COMPLETE", paymentMethodId });
  };

  const handlePaymentFailure = (error: Error) => {
    send({
      type: "ERROR",
      error: {
        message: error.message,
        code: error instanceof PaymentError ? error.code : undefined,
        details: error instanceof PaymentError ? error.details : undefined,
      },
    });
  };

  const [isOpen, setIsOpen] = useState(false);

  // Show modal when entering pendingPayment state
  useEffect(() => {
    if (state === "pendingPayment") {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [state]);

  // Don't render if no payment info
  if (!context.payment?.clientSecret) {
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Complete Payment</DialogTitle>
          <DialogDescription>
            {paymentStatus === "PROCESSING"
              ? "Your payment is being processed..."
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
