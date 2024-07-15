import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  SubscriptionPlan,
  SubscriptionResponse,
} from "portal-shared/dataProviders/accountProvider";
import {
  QueryObserverResult,
  RefetchOptions,
  RefetchQueryFilters,
} from "@tanstack/react-query";
import { CustomResponse, HttpError } from "@refinedev/core";
import useSubscription from "@/hooks/useSubscription.js";
import useSubscriptionPlans from "@/routes/account/hooks/useSubscriptionPlans.js";
import useSubmitSubscriptionChange from "@/routes/account/hooks/useSubmitSubscriptionChange.js";
// @ts-ignore
import { loadHyper } from "../lib/hyper.js";

export interface SubscriptionContextType {
  subscription: SubscriptionResponse | undefined;
  isLoading: boolean;
  plans: SubscriptionPlan[];
  selectedPlan: SubscriptionPlan | null;
  handlePlanSelection: (plan: SubscriptionPlan) => void;
  isPlanChanging: boolean;
  submitPlanChange: (
    plan: SubscriptionPlan,
    paymentMethodId?: string,
  ) => Promise<void>;
  refetchSubscription: <TPageData>(
    options?: RefetchOptions & RefetchQueryFilters<TPageData>,
  ) => Promise<
    QueryObserverResult<CustomResponse<SubscriptionResponse>, HttpError>
  >;
  hyperState: {
    isHyperLoaded: boolean;
    error: Error | null;
  };
  hyperPromise?: Promise<any> | null;
  setEphemeralKey: (key: string) => void;
}

const defaultContextValue: SubscriptionContextType = {
  subscription: undefined,
  isLoading: false,
  plans: [],
  selectedPlan: null,
  handlePlanSelection: () => {},
  isPlanChanging: false,
  submitPlanChange: async () => {},
  refetchSubscription: async () => ({}) as any, // This is a placeholder and will be overwritten in the provider
  hyperState: {
    isHyperLoaded: false,
    error: null,
  },
  setEphemeralKey: (key: string) => {},
};

export const SubscriptionContext =
  createContext<SubscriptionContextType>(defaultContextValue);

export function useSubscriptionContext(): SubscriptionContextType {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error(
      "useSubscriptionContext must be used within a SubscriptionProvider",
    );
  }

  return context;
}

interface SubscriptionProviderProps {
  children: ReactNode;
}

export function SubscriptionProvider({ children }: SubscriptionProviderProps) {
  const { subscriptionData, subscriptionIsLoading, refetchSubscription } =
    useSubscription();
  const { plansData, plansAreLoading } = useSubscriptionPlans();
  const { isPlanChanging, submitPlanChange } =
    useSubmitSubscriptionChange(true);

  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(
    null,
  );
  const [ephemeralKey, setEphemeralKey] = useState<string | null>(null);

  const handlePlanSelection = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
  };

  const hyperPromiseRef = useRef<Promise<any> | null>(null);
  const [hyperState, setHyperState] = useState({
    isHyperLoaded: false,
    error: null as Error | null,
  });

  const initializeHyper = useCallback(() => {
    if (subscriptionData?.payment_info?.publishable_key) {
      setHyperState((prev) => ({ ...prev, isLoading: true, error: null }));
      const promise = loadHyper(subscriptionData.payment_info.publishable_key, {
        env: "SANDBOX",
        ephemeralKey,
      });
      if (promise) {
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
      } else {
        setHyperState((prev) => ({ ...prev, isLoading: false }));
      }
    }
  }, [subscriptionIsLoading]);

  useEffect(() => {
    if (!hyperPromiseRef.current) {
      initializeHyper();
    }
  }, [initializeHyper]);

  useEffect(() => {
    // Refresh subscription data when the component mounts
    refetchSubscription();
  }, [refetchSubscription]);

  const value = {
    subscription: subscriptionData,
    isLoading: subscriptionIsLoading || plansAreLoading,
    plans: plansData?.data?.plans ?? [],
    selectedPlan,
    isPlanChanging,
    handlePlanSelection,
    submitPlanChange,
    refetchSubscription,
    hyperState: {
      isHyperLoaded: hyperState.isHyperLoaded,
      error: hyperState.error,
    },
    hyperPromise: hyperPromiseRef.current,
    setEphemeralKey,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}
