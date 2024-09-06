import React, { useState, useEffect, useRef } from "react";
import {
  HyperElements,
  UnifiedCheckout,
  useElements,
  useHyper,
  // @ts-ignore
} from "../lib/hyper-react.js";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useSubscriptionContext } from "@/routes/account/contexts/SubscriptionContext.js";
import useRequestPaymentMethodChange from "../hooks/useRequestPaymentMethodChange";
export default function HyperPayment({
  onPaymentSuccess,
  mode = "subscribe",
}: {
  onPaymentSuccess: (paymentMethodId: string) => void;
  mode: "subscribe" | "change_payment";
}) {
  const { subscription, hyperPromise, hyperState } = useSubscriptionContext();
  const [clientSecret, setClientSecret] = useState<string | undefined>();
  const {
    requestPaymentMethodChange,
    isLoading: isRequestingPaymentMethodChange,
    clientSecret: changePaymentClientSecret,
  } = useRequestPaymentMethodChange();
  const paymentRequestChangeMode = useRef(false);

  useEffect(() => {
    if (mode === "change_payment" && !clientSecret) {
      if (
        !isRequestingPaymentMethodChange &&
        !paymentRequestChangeMode.current
      ) {
        paymentRequestChangeMode.current = true;
        requestPaymentMethodChange();
      }

      if (changePaymentClientSecret) {
        setClientSecret(changePaymentClientSecret);
      }
    }

    if (mode === "subscribe" && !clientSecret) {
      setClientSecret(subscription?.payment_info?.client_secret);
    }
  }, [
    mode,
    clientSecret,
    isRequestingPaymentMethodChange,
    paymentRequestChangeMode.current,
    changePaymentClientSecret,
    requestPaymentMethodChange,
  ]);

  if (
    !hyperState.isHyperLoaded ||
    (mode === "change_payment" &&
      (isRequestingPaymentMethodChange || !clientSecret))
  ) {
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
        />
      </HyperElements>
    </div>
  );
}

const PaymentConfirmationButton = ({
  onPaymentSuccess,
  mode,
}: {
  onPaymentSuccess: (paymentMethodId: string) => void;
  mode: "subscribe" | "change_payment";
}) => {
  const hyper = useHyper();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

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
          return_url: window.location.href.toString(),
        },
        redirect: "if_required",
      });

      if (result?.status === "failed" || result.error) {
        setPaymentError(
          result.error?.message || "An error occurred during payment",
        );
        console.error("Payment failed:", result.error);
      } else {
        console.log("Payment succeeded:", result);
        onPaymentSuccess(result.payment_method_id);
      }
    } catch (error) {
      setPaymentError("An unexpected error occurred");
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
