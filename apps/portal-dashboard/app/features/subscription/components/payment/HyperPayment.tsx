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

import { PaymentConfirmationButton } from './PaymentConfirmationButton';

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
