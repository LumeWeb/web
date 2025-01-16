import { createContext, ReactNode, useContext, useMemo, useState } from "react";
import { SubscriptionPlan, Subscription } from "../types/subscription.types";
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
  createSubscription: (plan: SubscriptionPlan) => Promise<Subscription>;
  updateSubscription: (plan: SubscriptionPlan) => Promise<Subscription>;
  cancelSubscription: () => Promise<void>;
  validatePlanChange: (
    currentPlan: SubscriptionPlan,
    newPlan: SubscriptionPlan,
  ) => Promise<boolean>;

  // Payment Dialog
  showPaymentDialog: boolean;
  setShowPaymentDialog: (show: boolean) => void;

  // Status flags
  isProcessing: boolean;
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
  // Core subscription state
  const { state, error, isLoading } = useSubscription();
  const { plansData, plansAreLoading } = useSubscriptionPlans();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(
    null,
  );
  // Mutations
  const {
    createSubscription,
    updateSubscription,
    cancelSubscription,
    isLoading: isProcessing,
  } = useSubscriptionMutations();

  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  const value = useMemo(
    () => ({
      // Current state
      subscription: state.type === "ACTIVE" ? state.subscription : undefined,
      isLoading: isLoading || plansAreLoading,
      error,

      // Plan management
      plans: plansData?.data?.plans ?? [],
      selectedPlan,
      setSelectedPlan,

      // Actions
      createSubscription: async (plan: SubscriptionPlan) => {
        const response = await createSubscription(plan);
        return response.data.subscription;
      },
      updateSubscription: async (plan: SubscriptionPlan) => {
        const response = await updateSubscription(plan);
        return response.data.subscription;
      },
      cancelSubscription,
      validatePlanChange: async (
        currentPlan: SubscriptionPlan,
        newPlan: SubscriptionPlan,
      ) => {
        // Implement validation logic here
        return true;
      },

      // Payment Dialog
      showPaymentDialog,
      setShowPaymentDialog,

      // Status flags
      isProcessing,
    }),
    [
      state,
      error,
      isLoading,
      plansAreLoading,
      plansData?.data?.plans,
      selectedPlan,
      isProcessing,
      showPaymentDialog,
    ],
  );

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}
