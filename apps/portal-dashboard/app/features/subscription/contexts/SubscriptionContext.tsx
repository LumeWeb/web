import {
  createContext,
  ReactNode,
  useContext,
  useMemo,
  useState,
  useCallback
} from "react";
import {
  Subscription,
  SubscriptionPlan,
} from "../types/subscription.types";
import { useSubscriptionPlans } from "../hooks/core/useSubscriptionPlans";
import { useSubscription } from "@/features/subscription/hooks/core/useSubscription";
import { useSubscriptionMachine } from "../hooks/useSubscriptionMachine";

interface SubscriptionContextValue {
  // Machine state and actions
  state: SubscriptionStateValue;
  context: SubscriptionContext;
  send: (type: SubscriptionEvent['type'], payload?: any) => void;
  
  // Subscription data
  subscription: Subscription | null;
  plans: SubscriptionPlan[];
  isLoading: boolean;
  error: Error | null;

  // Payment handling
  showPaymentDialog: boolean;
  setShowPaymentDialog: (show: boolean) => void;
  
  // Utility functions
  refetchSubscription: () => Promise<any>;
}

// Helper type to extract subscription from response
type ExtractSubscription<T> = T extends { data: { subscription: infer S } }
  ? S
  : never;

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

  const value = useMemo(() => ({
    // Machine state and actions
    state: current.value,
    context: current.context,
    send,
    
    // Subscription data
    subscription: current.context.subscription,
    plans: plansData?.data?.plans || [],
    isLoading: current.name === "loading" || plansAreLoading,
    error: current.context.error,

    // Payment handling
    showPaymentDialog,
    setShowPaymentDialog,
    
    // Utility functions
    refetchSubscription
  }), [
    current,
    send,
    plansData?.data?.plans,
    plansAreLoading,
    showPaymentDialog,
    refetchSubscription
  ]);

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}
