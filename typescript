import { useState, useCallback, useRef, useEffect } from "react";
import { Subscription } from "../types/subscription.types";
// @ts-ignore
import { loadHyper } from "../lib/hyper";

interface HyperState {
  isHyperLoaded: boolean;
  error: Error | null;
}

export function useHyperState(subscription: Subscription | null) {
  const hyperPromiseRef = useRef<Promise<any> | null>(null);
  const [hyperState, setHyperState] = useState<HyperState>({
    isHyperLoaded: false,
    error: null,
  });

  const initializeHyper = useCallback(() => {
    // Only initialize if we have a pending subscription with a client secret and publishable key
    if (
      !subscription?.payment?.publishable_key ||
      !subscription?.payment?.client_secret ||
      subscription.status !== "PENDING" ||
      !subscription.plan?.id ||
      subscription.plan.is_free ||
      (subscription.payment.expires_at &&
        new Date(subscription.payment.expires_at) <= new Date())
    ) {
      return;
    }

    setHyperState((prev) => ({ ...prev, isLoading: true, error: null }));
    const promise = loadHyper(subscription.payment.publishable_key, {
      env: "SANDBOX",
      clientSecret: subscription.payment.client_secret,
    });

    if (!promise) {
      setHyperState((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    hyperPromiseRef.current = promise;
    promise
      .then(() => {
        setHyperState((prev) => ({
          ...prev,
          isLoading: false,
          isHyperLoaded: true,
        }));
      })
      .catch((error: Error) => {
        console.error("Failed to load Hyper instance:", error);
        hyperPromiseRef.current = null;
        setHyperState((prev) => ({ ...prev, isLoading: false, error }));
      });
  }, [subscription?.payment?.publishable_key]);

  useEffect(() => {
    const shouldInitialize =
      !hyperPromiseRef.current &&
      subscription?.payment?.publishable_key &&
      (!subscription.status || subscription.status === "PENDING"
        ? subscription.payment.client_secret
        : true);

    if (shouldInitialize) {
      initializeHyper();
    }
  }, [
    initializeHyper,
    subscription?.payment?.publishable_key,
    subscription?.status,
    subscription?.payment?.client_secret,
  ]);

  return {
    hyperState,
    hyperPromise: hyperPromiseRef.current,
  };
}
