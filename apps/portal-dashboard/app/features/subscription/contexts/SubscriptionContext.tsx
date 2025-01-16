import React, { createContext, ReactNode, useContext, useState } from "react";
import { SubscriptionPlan, Subscription } from "portal-shared/dataProviders/accountProvider";
import { useSubscription } from "../hooks/core/useSubscription";
import { useSubscriptionMutations } from "../hooks/mutations/useSubscriptionMutations";
import { useSubscriptionPlans } from "../hooks/core/useSubscriptionPlans";

interface SubscriptionContextValue {
  // Current state
  subscription?: Subscription;
  isLoading: boolean;
  error: Error | null;
  
  // Plan management
  plans: SubscriptionPlan[];
  selectedPlan: SubscriptionPlan | null;
  setSelectedPlan: (plan: SubscriptionPlan | null) => void;
  
  // Actions
  createSubscription: (plan: SubscriptionPlan) => Promise<void>;
  updateSubscription: (plan: SubscriptionPlan) => Promise<void>;
  cancelSubscription: () => Promise<void>;
  validatePlanChange: (currentPlan: SubscriptionPlan, newPlan: SubscriptionPlan) => Promise<boolean>;
  
  // Payment Dialog
  showPaymentDialog: boolean;
  setShowPaymentDialog: (show: boolean) => void;
  
  // Status flags
  isProcessing: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextValue | undefined>(undefined);

export function useSubscriptionContext() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error("useSubscriptionContext must be used within a SubscriptionProvider");
  }
  return context;
}

interface SubscriptionProviderProps {
  children: ReactNode;
}

export function SubscriptionProvider({ children }: SubscriptionProviderProps) {
  // Core subscription state
  const { state, error, isLoading } = useSubscription();
  const { plansData, plansAreLoading } = useSubscriptionPlans();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  // Mutations
  const { 
    createSubscription,
    updateSubscription,
    cancelSubscription,
    isLoading: isProcessing 
  } = useSubscriptionMutations();

  const value = React.useMemo(() => ({
    // Current state
    subscription: state.type === 'ACTIVE' ? state.subscription : undefined,
    isLoading: isLoading || plansAreLoading,
    error,

    // Plan management  
    plans: plansData?.data?.plans ?? [],
    selectedPlan,
    setSelectedPlan,

    // Actions
    createSubscription,
    updateSubscription,
    cancelSubscription,

    // Status flags
    isProcessing
  }), [
    state,
    error,
    isLoading,
    plansAreLoading,
    plansData?.data?.plans,
    selectedPlan,
    isProcessing
  ]);

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}
