import React from "react";
import { Button } from "portal-shared/components/ui/button";
import { usePaymentMachine } from "../../hooks/usePaymentMachine";
import { usePaymentButtonState } from "../../hooks/usePaymentButtonState";
import { PaymentMode, DEFAULT_PAYMENT_LABELS } from "../../types/payment.types";
import { useHyper, useElements } from "@/routes/account/lib/hyper-react.js";

interface PaymentConfirmationButtonProps {
  onPaymentSuccess: () => void;
  onPaymentError: (error: Error) => void;
  mode: PaymentMode;
}

export function PaymentConfirmationButton({
  onPaymentSuccess,
  onPaymentError,
  mode,
}: PaymentConfirmationButtonProps) {
  const hyper = useHyper();
  const elements = useElements();
  const { buttonState, startProcessing, handleSuccess, handleError, retry } =
    usePaymentButtonState();
  const [paymentError, setPaymentError] = React.useState<string | null>(null);

  const buttonLabel = DEFAULT_PAYMENT_LABELS[mode][buttonState];

  const handlePaymentError = (error: Error) => {
    const errorMessage = error.message || "An unexpected error occurred";
    setPaymentError(errorMessage);
    handleError();
    onPaymentError(error);
  };

  const { actions: paymentActions } = usePaymentMachine();

  const handlePayment = async () => {
    if (!hyper || !elements) {
      handlePaymentError(new Error("Payment system not initialized"));
      return;
    }

    if (buttonState === "failed") {
      retry();
      paymentActions.retry();
    }

    startProcessing();
    paymentActions.startPayment();
    setPaymentError(null);

    try {
      const result = await hyper.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.href,
        },
        redirect: "if_required",
      });

      if (result?.error) {
        handlePaymentError(new Error(result.error.message || "Payment failed"));
        return;
      }

      console.log("Payment succeeded:", result);
      handleSuccess();
      onPaymentSuccess();
    } catch (error) {
      handlePaymentError(
        error instanceof Error ? error : new Error("Payment failed"),
      );
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
}
