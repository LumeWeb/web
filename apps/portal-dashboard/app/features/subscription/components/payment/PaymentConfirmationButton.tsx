import React from "react";
import { Button } from "portal-shared/components/ui/button";
import { usePaymentMachine } from "../../hooks/usePaymentMachine";
import { usePaymentButtonState } from "../../hooks/usePaymentButtonState";
import {
  PaymentMode,
  DEFAULT_PAYMENT_LABELS,
  PaymentButtonState,
} from "../../types/payment.types";
import { useHyper, useElements } from "@/routes/account/lib/hyper-react.js";

interface PaymentConfirmationButtonProps {
  onPaymentSuccess: () => void;
  onPaymentError: (error: Error) => void;
  mode: PaymentMode;
}

const PaymentConfirmationButton = ({
  onPaymentSuccess,
  onPaymentError,
  mode,
}: PaymentConfirmationButtonProps) => {
  const hyper = useHyper();
  const elements = useElements();
  const [paymentError, setPaymentError] = React.useState<string | null>(null);
  const { state: paymentState, actions: paymentActions } = usePaymentMachine();

  // Derive button state from payment machine state
  const buttonState: PaymentButtonState = React.useMemo(() => {
    switch (paymentState) {
      case "processing":
        return "processing";
      case "error":
        return "failed";
      case "retry":
        return "retry";
      case "completed":
        return "succeeded";
      default:
        return "idle";
    }
  }, [paymentState]);

  const buttonLabel = DEFAULT_PAYMENT_LABELS[mode][buttonState];

  const handlePayment = async () => {
    if (!hyper || !elements) {
      onPaymentError(new Error("Payment system not initialized"));
      return;
    }

    try {
      // Only call startPayment if we're in idle state
      if (paymentState === 'idle') {
        paymentActions.startPayment();
      }
      setPaymentError(null);

      const result = await hyper.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.href,
        },
        redirect: "if_required",
      });

      if (result?.error) {
        throw new Error(result.error.message || "Payment failed");
      }

      paymentActions.completePayment();
      onPaymentSuccess();
    } catch (error) {
      const err = error instanceof Error ? error : new Error("Payment failed");
      paymentActions.handleError(err);
      onPaymentError(err);
      setPaymentError(err.message);
    }
  };

  return (
    <>
      <Button
        onClick={handlePayment}
        disabled={buttonState === "processing" || buttonState === "succeeded"}
        className="w-full py-2 px-4 text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
        {buttonLabel}
      </Button>
      {paymentError && <div className="text-red-500 mt-2">{paymentError}</div>}
    </>
  );
};
