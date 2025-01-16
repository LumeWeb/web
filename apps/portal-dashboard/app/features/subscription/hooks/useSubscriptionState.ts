import { useCallback, useEffect, useRef, useState } from 'react';
import { SubscriptionStateMachine } from '../states/SubscriptionStateMachine';
import { SubscriptionState, SubscriptionEvent, Subscription, SubscriptionPlan, BillingInfo } from '../types/subscription.types';

export function useSubscriptionState() {
  const stateMachine = useRef(new SubscriptionStateMachine());
  const [state, setState] = useState<SubscriptionState>(stateMachine.current.getState());

  const dispatch = useCallback((event: SubscriptionEvent) => {
    const newState = stateMachine.current.transition(event);
    setState(newState);
    return newState;
  }, []);

  const loadSubscription = useCallback((subscription: Subscription | null) => {
    if (subscription) {
      dispatch({ type: 'SUBSCRIPTION_LOADED', subscription });
    } else {
      dispatch({ type: 'SUBSCRIPTION_LOADED', subscription: { 
        id: '', 
        status: 'INACTIVE',
        plan: null
      } as Subscription });
    }
  }, [dispatch]);

  const createSubscription = useCallback((plan: SubscriptionPlan) => {
    dispatch({ type: 'CREATE_SUBSCRIPTION', plan });
  }, [dispatch]);

  const updateBilling = useCallback((billing: BillingInfo) => {
    dispatch({ type: 'UPDATE_BILLING', billing });
  }, [dispatch]);

  const completePayment = useCallback((paymentMethodId: string) => {
    dispatch({ type: 'COMPLETE_PAYMENT', paymentMethodId });
  }, [dispatch]);

  const cancelSubscription = useCallback(() => {
    dispatch({ type: 'CANCEL_SUBSCRIPTION' });
  }, [dispatch]);

  const handleError = useCallback((error: Error) => {
    dispatch({ type: 'ERROR_OCCURRED', error });
  }, [dispatch]);

  return {
    state,
    loadSubscription,
    createSubscription,
    updateBilling,
    completePayment,
    cancelSubscription,
    handleError
  };
}
