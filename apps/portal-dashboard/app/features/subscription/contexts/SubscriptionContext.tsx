import { createContext, ReactNode, useContext, useMemo, useState } from "react";
import {
  BillingInfo,
  Subscription,
  SubscriptionPlan,
  SubscriptionState,
} from "../types/subscription.types";
import { useSubscriptionMutations } from "../hooks/mutations/useSubscriptionMutations";
import { useSubscriptionPlans } from "../hooks/core/useSubscriptionPlans";
import useSubscriptionState from "@/features/subscription/hooks/useSubscriptionState";
import { useSubscription } from "@/features/subscription/hooks/core/useSubscription";

interface SubscriptionContextValue {
  // State management
  state: SubscriptionState;
  loadSubscription: (subscription: Subscription | null) => void;
  updateBilling: (billing: BillingInfo) => void;
  completePayment: (paymentMethodId: string) => void;
  handleError: (error: Error) => void;
  isTransitioning: boolean;
  refetchSubscription: () => Promise<void>;

  // Current subscription
  subscription?: Subscription;
  payment?: Subscription["payment"];
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
    () => ({
      // State management
      state,
      loadSubscription: loadSubscriptionState,
      updateBilling: updateBillingState,
      completePayment: completePaymentState,
      handleError: handleErrorState,
      isTransitioning,
      refetchSubscription: useSubscription().refetch,

      // Current subscription
      subscription: state?.subscription,
      payment: state?.payment,
      isLoading: state.type === "LOADING" || plansAreLoading,
      error: state.type === "ERROR" ? state.error : null,

      // Plan management
      plans: plansData?.data?.plans || [],
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

          // Update state with new subscription
          loadSubscriptionState(response.subscription);
          return { subscription: response.subscription };
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
      isProcessing,
    }),
    [
      state,
      loadSubscriptionState,
      updateBillingState,
      completePaymentState,
      handleErrorState,
      isTransitioning,
      plansAreLoading,
      plansData?.data ?? [],
      selectedPlan,
      setSelectedPlan,
      createSubscription,
      updateSubscription,
      cancelSubscription,
      showPaymentDialog,
      setShowPaymentDialog,
      isProcessing,
    ],
  );

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}
