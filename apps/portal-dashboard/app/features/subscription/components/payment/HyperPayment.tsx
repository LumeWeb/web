import React, { useEffect, useState, useRef } from "react";
import {
  HyperElements,
  UnifiedCheckout,
} from "@/routes/account/lib/hyper-react.js";
import { Skeleton } from "portal-shared/components/ui/skeleton";
import { useSubscriptionContext } from "../../contexts/SubscriptionContext";
import { PaymentConfirmationButton } from "./PaymentConfirmationButton";

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
  const { forceRemount } = usePaymentContext();
  const [clientSecret, setClientSecret] = useState<string | undefined>();
  const [isRetrying, setIsRetrying] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const loadStartTimeRef = useRef<number>();

  useEffect(() => {
    if (isRetrying) {
      setClientSecret(context?.payment?.client_secret);
      setIsRetrying(false);
    }
  }, [isRetrying, context?.payment?.client_secret]);

  useEffect(() => {
    if (mode === "subscribe" || mode === "setup") {
      setClientSecret(context?.payment?.client_secret);
    }
  }, [mode, context?.payment?.client_secret]);

  // Setup timeout when component mounts or when loading state changes
  useEffect(() => {
    if (!hyperState.isHyperLoaded && !loadStartTimeRef.current) {
      loadStartTimeRef.current = Date.now();
      
      timeoutRef.current = setTimeout(() => {
        console.warn('Payment skeleton timeout - forcing remount');
        forceRemount();
        loadStartTimeRef.current = undefined;
      }, 5000); // 5 seconds timeout
    }

    // Clear timeout if loaded successfully
    if (hyperState.isHyperLoaded && timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      loadStartTimeRef.current = undefined;
    }

    // Cleanup on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [hyperState.isHyperLoaded, forceRemount]);

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
