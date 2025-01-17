import {
  createContext,
  ReactNode,
  useContext,
  useMemo,
  useState,
  useCallback,
  useEffect,
} from "react";
import {
  Subscription,
  SubscriptionPlan,
  SubscriptionStateValue,
} from "../types/subscription.types";
import { useSubscriptionPlans } from "../hooks/core/useSubscriptionPlans";
import { useSubscription } from "@/features/subscription/hooks/core/useSubscription";
import { useSubscriptionMachine } from "../hooks/useSubscriptionMachine";
import {
  SubscriptionEvent,
  subscriptionMachine,
} from "../machines/subscriptionMachine";
import { useMachine } from "react-robot";

interface SubscriptionContextValue {
  state: SubscriptionStateValue;
  context: SubscriptionContext;
  send: (event: SubscriptionEvent) => void;
  plans: SubscriptionPlan[];
  isLoading: boolean;
  refetchSubscription: () => Promise<any>;
}

const SubscriptionContext = createContext<SubscriptionContextValue | undefined>(
  undefined,
);

export function useSubscriptionContext() {
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
  const [current, send] = useMachine(subscriptionMachine);
  const { plansData, plansAreLoading } = useSubscriptionPlans();
  const { refetch: refetchSubscription } = useSubscription();

  const value = useMemo(
    () => ({
      state: current.name as SubscriptionStateValue,
      context: current.context,
      send,
      plans: plansData?.data?.plans || [],
      isLoading: current.name === "loading" || plansAreLoading,
      refetchSubscription,
    }),
    [
      current.name,
      current.context,
      send,
      plansData?.data?.plans,
      plansAreLoading,
      refetchSubscription,
    ],
  );

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}
