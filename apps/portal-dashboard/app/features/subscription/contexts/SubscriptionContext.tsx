import { createContext, ReactNode, useContext, useMemo } from "react";
import {
  BillingInfo,
  Subscription,
  SubscriptionPlan,
  SubscriptionStateValue,
} from "../types/subscription.types";
import { useSubscriptionPlans } from "../hooks/core/useSubscriptionPlans";
import { useSubscription } from "@/features/subscription/hooks/core/useSubscription";
import {
  SubscriptionEvent,
  subscriptionMachine,
} from "../machines/subscriptionMachine";
import { useMachine } from "react-robot";
import { PaymentInfo } from "../types/payment.types";

interface SubscriptionContext {
  subscription: Subscription | null;
  selectedPlan: SubscriptionPlan | null;
  billing: BillingInfo | null;
  payment: PaymentInfo | null;
  error: Error | null;
}

interface SubscriptionContextValue {
  plans: SubscriptionPlan[];
  isLoading: boolean;
  refetchSubscription: () => Promise<any>;
  state: SubscriptionStateValue;
  context: SubscriptionContext;
  send: (event: SubscriptionEvent) => void;
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
  const { refetch: refetchSubscription, isLoading: subscriptionIsLoading } =
    useSubscription();

  const value = useMemo(
    () => ({
      plans: plansData?.data?.plans || [],
      isLoading: plansAreLoading || subscriptionIsLoading,
      refetchSubscription,
      state: current.name as SubscriptionStateValue,
      context: current.context,
      send,
    }),
    [
      current,
      send,
      plansData?.data?.plans,
      plansAreLoading,
      subscriptionIsLoading,
      refetchSubscription,
    ],
  );

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}
