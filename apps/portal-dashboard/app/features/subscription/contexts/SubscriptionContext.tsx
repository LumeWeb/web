import {
  createContext,
  ReactNode,
  useContext,
  useMemo,
  useState,
  useCallback,
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

interface SubscriptionContextValue {
  subscription: Subscription | null;
  plans: SubscriptionPlan[];
  isLoading: boolean;
  error: Error | null;
  showPaymentDialog: boolean;
  setShowPaymentDialog: (show: boolean) => void;
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
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const { refetch: refetchSubscription } = useSubscription();

  const value = useMemo(
    () => ({
      subscription: current.context.subscription,
      plans: plansData?.data?.plans || [],
      isLoading: current.name === "loading" || plansAreLoading,
      error: current.context.error,
      showPaymentDialog,
      setShowPaymentDialog,
      refetchSubscription,
    }),
    [
      current.context.subscription,
      current.name,
      current.context.error,
      plansData?.data?.plans,
      plansAreLoading,
      showPaymentDialog,
      refetchSubscription,
    ],
  );

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}
