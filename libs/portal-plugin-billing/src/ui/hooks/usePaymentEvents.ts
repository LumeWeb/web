import { useEffect } from "react";
import { useFragmentQueue } from "@/ui/context/FragmentQueueContext";

export interface UsePaymentEventsOptions {
  sessionId?: string;
  onCheckoutComplete?: (sessionId: string) => void;
  onPaymentSuccess?: () => void;
  onPaymentCanceled?: () => void;
  onPaymentError?: (error: string) => void;
}

export function usePaymentEvents({
  sessionId,
  onCheckoutComplete,
  onPaymentSuccess,
  onPaymentCanceled,
  onPaymentError,
}: UsePaymentEventsOptions) {
  const { runCleanup } = useFragmentQueue();

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin && !event.data?.type) return;

      if (event.data?.type === "checkout_complete" && sessionId && onCheckoutComplete) {
        onCheckoutComplete(sessionId);
      }
    }

    function handlePaymentSuccess() {
      onPaymentSuccess?.();
    }

    function handlePaymentCanceled() {
      onPaymentCanceled?.();
    }

    function handlePaymentCompleted() {
      runCleanup();
      if (sessionId && onCheckoutComplete) {
        onCheckoutComplete(sessionId);
      }
    }

    function handlePaymentError(event: CustomEvent<{ error: string }>) {
      onPaymentError?.(event.detail.error);
    }

    window.addEventListener("message", handleMessage);
    window.addEventListener("paymentSuccess", handlePaymentSuccess);
    window.addEventListener("paymentCanceled", handlePaymentCanceled);
    window.addEventListener("paymentCompleted", handlePaymentCompleted);
    window.addEventListener("paymentError", handlePaymentError as EventListener);

    return () => {
      window.removeEventListener("message", handleMessage);
      window.removeEventListener("paymentSuccess", handlePaymentSuccess);
      window.removeEventListener("paymentCanceled", handlePaymentCanceled);
      window.removeEventListener("paymentCompleted", handlePaymentCompleted);
      window.removeEventListener("paymentError", handlePaymentError as EventListener);
    };
  }, [sessionId, onCheckoutComplete, onPaymentSuccess, onPaymentCanceled, onPaymentError, runCleanup]);
}
