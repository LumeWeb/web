import React, { useEffect, useState } from "react";
import { Button } from "portal-shared/components/ui/button";
import { usePaymentContext } from "../../contexts/PaymentContext";
import {
  DEFAULT_PAYMENT_LABELS,
  PaymentButtonState,
  PaymentMode,
} from "../../types/payment.types";
import { useElements, useHyper } from "@/routes/account/lib/hyper-react.js";

interface PaymentConfirmationButtonProps {
  onPaymentSuccess: () => void;
  onPaymentError: (error: Error) => void;
  mode: PaymentMode;
}

export const PaymentConfirmationButton = ({
  onPaymentSuccess,
  onPaymentError,
  mode,
}: PaymentConfirmationButtonProps) => {
  const hyper = useHyper();
  const elements = useElements();
  const [paymentError, setPaymentError] = React.useState<string | null>(null);
  const { state: paymentState, actions: paymentActions } = usePaymentContext();

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

  const [shouldInitiatePayment, setShouldInitiatePayment] = useState(false);
  const [triggerError, setTriggerError] = useState<Error | boolean>(false);

  // Effect to handle payment initialization
  useEffect(() => {
    if (shouldInitiatePayment && paymentState === "idle") {
      paymentActions.startPayment();
      setShouldInitiatePayment(false);
    }
  }, [shouldInitiatePayment, paymentState, paymentActions]);

  // Effect to handle payment processing
  useEffect(() => {
    let isActive = true;

    const processPayment = async () => {
      if (!hyper || !elements) {
        onPaymentError(new Error("Payment system not initialized"));
        return;
      }

      try {
        setPaymentError(null);

        const result = await hyper.confirmPayment({
          elements,
          confirmParams: {
            return_url: window.location.href,
          },
          redirect: "if_required",
        });

        if (!isActive) return;

        if (result?.error) {
          throw new Error(result.error.message || "Payment failed");
        }

        paymentActions.completePayment();
        onPaymentSuccess();
      } catch (error) {
        if (!isActive) return;
        const err =
          error instanceof Error ? error : new Error("Payment failed");
        setTriggerError(err);
        setPaymentError(err.message);
      }
    };

    if (paymentState === "processing" && !triggerError) {
      processPayment();
    }

    if (triggerError) {
      onPaymentError(triggerError as Error);
      setTriggerError(false);
    }

    return () => {
      isActive = false;
    };
  }, [
    paymentState,
    hyper,
    elements,
    onPaymentSuccess,
    onPaymentError,
    paymentActions,
    triggerError,
  ]);

  const handleClick = () => {
    setShouldInitiatePayment(true);
    if (paymentState === "error") {
      paymentActions.retry();
    }
  };

  return (
    <>
      <Button
        onClick={handleClick}
        disabled={buttonState === "processing" || buttonState === "succeeded"}
        className="w-full py-2 px-4 text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
        {buttonLabel}
      </Button>
      {paymentError && <div className="text-red-500 mt-2">{paymentError}</div>}
    </>
  );
};
