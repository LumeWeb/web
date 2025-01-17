import { useCallback, useEffect, useState } from 'react';
import { interpret } from 'robot3';
import { subscriptionMachine } from '../machines/subscriptionMachine';
import { BillingInfo, SubscriptionPlan } from '../types/subscription.types';

export function useSubscriptionMachine() {
  const [current, setCurrent] = useState(() => subscriptionMachine.initialState);
  
  useEffect(() => {
    const service = interpret(subscriptionMachine, (state) => {
      setCurrent(state);
    });
    
    return () => service.stop();
  }, []);

  const send = useCallback((type: string, payload?: any) => {
    setCurrent(current => subscriptionMachine.transition(current, { type, ...payload }));
  }, []);

  return {
    state: current.name,
    context: current.context,
    send,
    // Convenience methods
    selectPlan: (plan: SubscriptionPlan) => send('SELECT_PLAN', { plan }),
    updateBilling: (billing: BillingInfo) => send('UPDATE_BILLING', { billing }),
    complete: () => send('COMPLETE'),
    cancel: () => send('CANCEL'),
    retry: () => send('RETRY')
  };
}
