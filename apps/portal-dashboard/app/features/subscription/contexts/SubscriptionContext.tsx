import { createContext, ReactNode, useContext, useMemo, useState } from "react";
import {
  BillingInfo,
  Subscription,
  SubscriptionPlan,
  SubscriptionState,
} from "../types/subscription.types";
import { useSubscription } from "../hooks/core/useSubscription";
import { useSubscriptionMutations } from "../hooks/mutations/useSubscriptionMutations";
import { useSubscriptionPlans } from "../hooks/core/useSubscriptionPlans";
import useSubscriptionState from "@/features/subscription/hooks/useSubscriptionState";

interface SubscriptionContextValue {
  // State management
  state: SubscriptionState;
  loadSubscription: (subscription: Subscription | null) => void;
  updateBilling: (billing: BillingInfo) => void;
  completePayment: (paymentMethodId: string) => void;
  handleError: (error: Error) => void;
  isTransitioning: boolean;

  // Current subscription
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
  const {
    state,
    loadSubscription: loadSubscriptionState,
    updateBilling: updateBillingState,
    completePayment: completePaymentState,
    handleError: handleErrorState,
    isTransitioning,
  } = useSubscriptionState();
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
    () => {
      // Get current state once at the start of memo
      const currentState = state;
      
      return {
        // State management
        state: currentState,
        loadSubscription: loadSubscriptionState,
        updateBilling: updateBillingState,
        completePayment: completePaymentState,
        handleError: handleErrorState,
        isTransitioning,

        // Current subscription
        subscription:
          currentState.type === "ACTIVE"
            ? currentState.subscription
            : currentState.type === "CANCELLED"
              ? currentState.subscription
              : undefined,
        isLoading: currentState.type === "LOADING" || plansAreLoading,
        error: currentState.type === "ERROR" ? currentState.error : null,

        // Plan management
        plans: (() => {
          return plansData?.data?.plans || [];
        })(),
        selectedPlan,
        setSelectedPlan,

      // Actions
      createSubscription: async (plan: SubscriptionPlan) => {
        try {
          console.log("Creating subscription in context with plan:", plan);
          const response = await createSubscription(plan);
          console.log("Subscription creation response:", response);

          if (!response?.subscription) {
            throw new Error(
              "Invalid server response - missing subscription data",
            );
          }

          return response.subscription;
        } catch (error) {
          console.error("Error in subscription context:", error);
          throw error;
        }
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
      isProcessing
    };
    [
      state,
      plansAreLoading,
      plansData?.data ?? [],
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
