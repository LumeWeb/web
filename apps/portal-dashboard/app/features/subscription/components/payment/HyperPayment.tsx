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
  onPaymentSuccess: (paymentMethodId: string) => void;
  onPaymentError: (error: Error) => void;
  mode: "subscribe" | "setup" | "change_payment";
}

export default function HyperPayment({
  onPaymentSuccess,
  mode,
}: HyperPaymentProps) {
  const { context, hyperState, hyperPromise } = useSubscriptionContext();
  const [clientSecret, setClientSecret] = useState<string | undefined>();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  useEffect(() => {
    if (mode === "subscribe" || mode === "setup") {
      setClientSecret(context?.payment?.client_secret);
    }
  }, [mode, context?.payment?.client_secret]);

  if (!clientSecret) {
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
          mode={mode}
          isProcessing={isProcessing}
          setIsProcessing={setIsProcessing}
          paymentError={paymentError}
          setPaymentError={setPaymentError}
        />
      </HyperElements>
    </div>
  );
}

const PaymentConfirmationButton = ({
  onPaymentSuccess,
  mode,
  isProcessing,
  setIsProcessing,
  paymentError,
  setPaymentError,
}: {
  onPaymentSuccess: (paymentMethodId: string) => void;
  mode: "subscribe" | "setup" | "change_payment";
  isProcessing: boolean;
  setIsProcessing: (value: boolean) => void;
  paymentError: string | null;
  setPaymentError: (value: string | null) => void;
}) => {
  const hyper = useHyper();
  const elements = useElements();

  const handlePayment = async () => {
    if (!hyper || !elements) {
      console.error("Hyper or elements not initialized");
      return;
    }

    setIsProcessing(true);
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
        setPaymentError(
          result.error.message || "An error occurred during payment",
        );
        console.error("Payment failed:", result.error);
      } else {
        console.log("Payment succeeded:", result);
        onPaymentSuccess(result.payment_method_id);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      setPaymentError(errorMessage);
      onPaymentError(new Error(errorMessage));
      console.error("Error confirming payment:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Button
        onClick={handlePayment}
        disabled={isProcessing}
        className="w-full py-2 px-4 text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
        {isProcessing
          ? "Processing..."
          : mode === "subscribe"
            ? "Subscribe"
            : "Update Payment Method"}
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
