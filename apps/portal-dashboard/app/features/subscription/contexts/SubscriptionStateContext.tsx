import { createContext, useContext, ReactNode } from 'react';
import { useSubscriptionState } from '../hooks/useSubscriptionState';
import { SubscriptionState, SubscriptionPlan, BillingInfo } from '../types/subscription.types';

interface SubscriptionStateContextValue {
  state: SubscriptionState;
  loadSubscription: (subscription: Subscription | null) => void;
  createSubscription: (plan: SubscriptionPlan) => Promise<void>;
  updateBilling: (billing: BillingInfo) => Promise<void>;
  completePayment: (paymentMethodId: string) => Promise<void>;
  cancelSubscription: () => Promise<void>;
  handleError: (error: Error) => void;
  isTransitioning: boolean;
}

const SubscriptionStateContext = createContext<SubscriptionStateContextValue | undefined>(undefined);

export function SubscriptionStateProvider({ children }: { children: ReactNode }) {
  const {
    state,
    loadSubscription,
    createSubscription,
    updateBilling,
    completePayment,
    cancelSubscription,
    handleError,
    isTransitioning
  } = useSubscriptionState();

  const contextValue = React.useMemo(
    () => ({
      state,
      loadSubscription,
      createSubscription,
      updateBilling,
      completePayment,
      cancelSubscription,
      handleError,
      isTransitioning
    }),
    [
      state,
      loadSubscription,
      createSubscription,
      updateBilling,
      completePayment,
      cancelSubscription,
      handleError,
      isTransitioning
    ]
  );

  return (
    <SubscriptionStateContext.Provider value={contextValue}>
      {children}
    </SubscriptionStateContext.Provider>
  );
}

export function useSubscriptionStateContext() {
  const context = useContext(SubscriptionStateContext);
  if (!context) {
    throw new Error('useSubscriptionStateContext must be used within a SubscriptionStateProvider');
  }
  return context;
}
