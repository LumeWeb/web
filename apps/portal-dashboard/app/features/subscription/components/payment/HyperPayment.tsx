import React, { useState, useEffect } from "react";
import {
  HyperElements,
  UnifiedCheckout,
  useElements,
  useHyper,
  //@ts-ignore
} from "@/routes/account/lib/hyper-react.js";
import { Skeleton } from "portal-shared/components/ui/skeleton";
import { Button } from "portal-shared/components/ui/button";
import { useSubscriptionContext } from "../../contexts/SubscriptionContext";

interface HyperPaymentProps {
  onPaymentSuccess: () => void;
  onPaymentError: (error: Error) => void;
  mode: "subscribe" | "setup" | "change_payment";
}

export default function HyperPayment({
  onPaymentSuccess,
  onPaymentError,
  mode,
}: HyperPaymentProps) {
  const { context, hyperState, hyperPromise } = useSubscriptionContext();
  const [clientSecret, setClientSecret] = useState<string | undefined>();

  useEffect(() => {
    if (mode === "subscribe" || mode === "setup") {
      setClientSecret(context?.payment?.client_secret);
    }
  }, [mode, context?.payment?.client_secret]);

  if (!hyperState.isHyperLoaded || !clientSecret) {
    return <StyledPaymentSkeleton />;
  }

  return (
    <div className="relative min-h-[300px] w-full max-w-md mx-auto">
      <HyperElements
        options={{
          manual_retry_allowed: true,
          clientSecret: clientSecret,
        }}
        hyper={hyperPromise}>
        <UnifiedCheckout
          options={{
            displaySavedPaymentMethods: false,
            displaySavedPaymentMethodsCheckbox: false,
            hideCardNicknameField: true,
            layout: {
              type: "accordion",
            },
          }}
        />
        <PaymentConfirmationButton
          onPaymentSuccess={onPaymentSuccess}
          onPaymentError={onPaymentError}
          mode={mode}
        />
      </HyperElements>
    </div>
  );
}

const PaymentConfirmationButton = ({
  onPaymentSuccess,
  onPaymentError,
  mode,
}: {
  onPaymentSuccess: () => void;
  onPaymentError: (error: Error) => void;
  mode: "subscribe" | "setup" | "change_payment";
}) => {
  const hyper = useHyper();
  const elements = useElements();
  const [buttonState, setButtonState] = useState<PaymentButtonState>("idle");
  const [paymentError, setPaymentError] = useState<string | null>(null);
  
  const buttonLabel = DEFAULT_PAYMENT_LABELS[mode][buttonState];

  const handlePaymentError = (error: Error) => {
    const errorMessage = error.message || "An unexpected error occurred";
    setPaymentError(errorMessage);
    onPaymentError(error);
  };

  const handlePayment = async () => {
    if (!hyper || !elements) {
      handlePaymentError(new Error("Payment system not initialized"));
      return;
    }

    setButtonState("processing");
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
        // Keep dialog open and show error
        handlePaymentError(new Error(result.error.message || "Payment failed"));
        setButtonState("failed");
        return; // Don't close dialog, allow retry
      }

      console.log("Payment succeeded:", result);
      setButtonState("succeeded");
      onPaymentSuccess();
    } catch (error) {
      handlePaymentError(
        error instanceof Error ? error : new Error("Payment failed"),
      );
      setButtonState("failed");
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

const StyledPaymentSkeleton = () => {
  return (
    <div className="flex items-start justify-center min-h-[300px] p-4">
      <div className="w-full max-w-md space-y-2">
        <Skeleton className="h-4 w-3/4 mx-auto" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6 mx-auto" />
        <Skeleton className="h-4 w-2/3 mx-auto" />
      </div>
    </div>
  );
};
