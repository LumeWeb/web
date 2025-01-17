import { useCallback, useEffect, useRef, useState } from 'react';
import { SubscriptionStateMachine } from '../states/SubscriptionStateMachine';
import { SubscriptionState, SubscriptionEvent, Subscription, SubscriptionPlan, BillingInfo } from '../types/subscription.types';

export function useSubscriptionState() {
  const stateMachine = useRef(new SubscriptionStateMachine());
  const [state, setState] = useState<SubscriptionState>(stateMachine.current.getState());
  const [isTransitioning, setIsTransitioning] = useState(false);

  const dispatch = useCallback(async (event: SubscriptionEvent) => {
    setIsTransitioning(true);
    try {
      const newState = stateMachine.current.transition(event);
      setState(newState);
      return newState;
    } catch (error) {
      if (error instanceof Error) {
        handleError(error);
      } else {
        handleError(new Error('Unknown error occurred during state transition'));
      }
      throw error;
    } finally {
      setIsTransitioning(false);
    }
  }, []);

  const loadSubscription = useCallback((subscription: Subscription | null) => {
    if (subscription) {
      dispatch({ type: 'SUBSCRIPTION_LOADED', subscription });
    } else {
      dispatch({ type: 'SUBSCRIPTION_LOADED', subscription: { 
        id: '', 
        status: 'INACTIVE',
        plan: {
          id: '',
          name: '',
          period: 'MONTHLY',
          price: 0,
          is_free: true,
          resources: {
            storage: 0,
            upload: 0,
            download: 0
          }
        }
      } });
    }
  }, [dispatch]);

  const createSubscription = useCallback(async (plan: SubscriptionPlan) => {
    await dispatch({ type: 'CREATE_SUBSCRIPTION', plan });
  }, [dispatch]);

  const updateBilling = useCallback(async (billing: BillingInfo) => {
    await dispatch({ type: 'UPDATE_BILLING', billing });
  }, [dispatch]);

  const completePayment = useCallback(async (paymentMethodId: string) => {
    await dispatch({ type: 'COMPLETE_PAYMENT', paymentMethodId });
  }, [dispatch]);

  const cancelSubscription = useCallback(async () => {
    await dispatch({ type: 'CANCEL_SUBSCRIPTION' });
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
    handleError,
    isTransitioning
  };
}

export default useSubscriptionState;
