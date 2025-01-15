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
  Billing,
  Subscription,
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
import useCreateSubscription from "@/routes/account/hooks/useCreateSubscription.js";
// @ts-ignore
import { loadHyper } from "../lib/hyper.js";

export interface SubscriptionContextType {
  subscription?: Subscription;
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
  const { isPlanChanging, submitPlanChange } = useSubmitSubscriptionChange();
  const { isCreating, createSubscription } = useCreateSubscription(refetchSubscription);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);

  const handlePlanSelection = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
  };

  const hyperPromiseRef = useRef<Promise<any> | null>(null);
  const [hyperState, setHyperState] = useState({
    isHyperLoaded: false,
    error: null as Error | null,
  });

  const initializeHyper = useCallback(() => {
    if (!subscriptionData?.payment?.publishable_key) {
      return;
    }

    // Don't initialize if there's no client secret for a pending subscription
    if (subscriptionData.status === "PENDING" && !subscriptionData.payment.client_secret) {
      return;
    }
    
    setHyperState((prev) => ({ ...prev, isLoading: true, error: null }));
    const promise = loadHyper(
      subscriptionData.payment.publishable_key,
      {
        env: "SANDBOX",
        clientSecret: subscriptionData.payment.client_secret,
      },
    );
    
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
  }, [subscriptionData?.payment?.publishable_key]);

  useEffect(() => {
    const shouldInitialize = 
      !hyperPromiseRef.current && 
      subscriptionData?.payment?.publishable_key &&
      (!subscriptionData.status || subscriptionData.status === "PENDING" ? subscriptionData.payment.client_secret : true);

    if (shouldInitialize) {
      initializeHyper();
    }
  }, [initializeHyper, subscriptionData?.payment?.publishable_key, subscriptionData?.status, subscriptionData?.payment?.client_secret]);


  const value = React.useMemo(() => ({
    subscription: subscriptionData,
    isLoading: subscriptionIsLoading || plansAreLoading,
    plans: plansData?.data?.plans ?? [],
    selectedPlan,
    isPlanChanging: isPlanChanging || isCreating,
    handlePlanSelection,
    submitPlanChange: async (plan: SubscriptionPlan) => {
      if (!plan?.id) return;
      
      if (subscriptionData) {
        const paymentExpired = new Date(subscriptionData.payment?.expires_at ?? "") <= new Date();
        if (subscriptionData.status === "PENDING" && !paymentExpired) {
          console.warn("Cannot change plan while subscription is pending and payment is still valid");
          return;
        }
        await submitPlanChange(plan);
      } else {
        await createSubscription(plan);
      }
    },
    refetchSubscription,
    hyperState: {
      isHyperLoaded: hyperState.isHyperLoaded,
      error: hyperState.error,
    },
    hyperPromise: hyperPromiseRef.current,
  }), [
    subscriptionData,
    subscriptionIsLoading,
    plansAreLoading,
    plansData?.data?.plans,
    selectedPlan,
    isPlanChanging,
    isCreating,
    handlePlanSelection,
    submitPlanChange,
    createSubscription,
    refetchSubscription,
    hyperState.isHyperLoaded,
    hyperState.error,
    hyperPromiseRef.current,
  ]);

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}
