import {
  createContext,
  ReactNode,
  useContext,
  useMemo,
  useState,
  useRef,
  useEffect,
} from "react";
import { SubscriptionService } from "../services/SubscriptionService";
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
  refetchSubscription: () => Promise<any>;

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
  createSubscription: (
    plan: SubscriptionPlan,
  ) => Promise<{ subscription: Subscription }>;
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
  const machine = useSubscriptionMachine();
  const { plansData, plansAreLoading } = useSubscriptionPlans();
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const { refetch: refetchSubscription } = useSubscription();
  const { mutate: createMutation } = useCreateSubscriptionMutation();
  const { mutate: updateMutation } = useUpdateSubscriptionMutation();
  const { mutate: cancelMutation } = useCancelSubscriptionMutation();

  const handlePaymentSuccess = useCallback((paymentMethodId: string) => {
    machine.send('PAYMENT_COMPLETE', { paymentMethodId });
    setShowPaymentDialog(false);
    refetchSubscription();
  }, [machine, refetchSubscription]);

  const handlePaymentFailure = useCallback((error: Error) => {
    machine.send('PAYMENT_FAILED', { error: error.message });
    setShowPaymentDialog(false);
  }, [machine]);

  const value = useMemo(
    () => ({
      // State management
      state: machine.state,
      context: machine.context,
      send: machine.send,
      refetchSubscription,

      // Current subscription
      subscription: machine.context.subscription,
      payment: machine.context.payment,
      isLoading: machine.state === "loading" || plansAreLoading,
      error: machine.context.error,

      // Plan management
      plans: plansData?.data?.plans || [],
      selectedPlan: machine.context.selectedPlan,

      // Actions
      createSubscription: async (plan: SubscriptionPlan) => {
        try {
          console.log("Creating subscription in context with plan:", plan);

          // First validate the plan change using service
          if (state.type === "ACTIVE") {
            const isValid = await subscriptionService.validatePlanChange(
              state.subscription.plan,
              plan,
            );
            if (!isValid) {
              throw new Error("Invalid plan change");
            }
          }

          // Call API to create subscription
          const response = await createSubscription(plan);
          console.log("Subscription creation response:", response);

          if (!response?.subscription) {
            throw new Error("Invalid server response - missing subscription data");
          }

          // Update state machine AFTER successful API call
          await subscriptionService.createSubscription(plan);

          // Refetch subscription data to ensure we have latest state
          await refetchSubscription();

          return response;
        } catch (error) {
          console.error("Error in subscription context:", error);
          await subscriptionService.handleError(
            error instanceof Error ? error : new Error(String(error)),
          );
          throw error;
        }
      },
      updateSubscription: async (plan: SubscriptionPlan) => {
        try {
          // Validate and update state first
          await subscriptionService.updateSubscription(plan);

          // Then call API
          const response = await updateSubscription(plan);

          // Update state with response
          await subscriptionService.loadSubscription(
            response.data.subscription,
          );

          return response.data.subscription;
        } catch (error) {
          await subscriptionService.handleError(
            error instanceof Error ? error : new Error(String(error)),
          );
          throw error;
        }
      },
      cancelSubscription: async () => {
        try {
          // Update state first
          await subscriptionService.cancelSubscription();

          // Then call API
          await cancelSubscription();
        } catch (error) {
          await subscriptionService.handleError(
            error instanceof Error ? error : new Error(String(error)),
          );
          throw error;
        }
      },
      validatePlanChange: async (
        currentPlan: SubscriptionPlan,
        newPlan: SubscriptionPlan,
      ) => {
        return subscriptionService.validatePlanChange(currentPlan, newPlan);
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
