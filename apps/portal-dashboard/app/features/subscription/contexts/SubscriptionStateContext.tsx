import { createContext, useContext, ReactNode } from 'react';
import { useSubscriptionState } from '../hooks/useSubscriptionState';
import { SubscriptionState, SubscriptionPlan, BillingInfo } from '../types/subscription.types';

interface SubscriptionStateContextValue {
  state: SubscriptionState;
  loadSubscription: (subscription: any) => void;
  createSubscription: (plan: SubscriptionPlan) => void;
  updateBilling: (billing: BillingInfo) => void;
  completePayment: (paymentMethodId: string) => void;
  cancelSubscription: () => void;
  handleError: (error: Error) => void;
}

const SubscriptionStateContext = createContext<SubscriptionStateContextValue | undefined>(undefined);

export function SubscriptionStateProvider({ children }: { children: ReactNode }) {
  const subscriptionState = useSubscriptionState();

  return (
    <SubscriptionStateContext.Provider value={subscriptionState}>
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
