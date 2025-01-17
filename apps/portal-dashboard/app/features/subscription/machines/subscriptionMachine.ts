import { createMachine, state, transition, reduce, guard, invoke } from 'robot3';
import { 
  Subscription,
  SubscriptionPlan,
  BillingInfo,
  PaymentInfo
} from '../types/subscription.types';
import { SubscriptionPlanStatus } from 'portal-shared/dataProviders/accountProvider';

interface SubscriptionContext {
  subscription: Subscription | null;
  selectedPlan: SubscriptionPlan | null;
  billing: BillingInfo | null;
  payment: PaymentInfo | null;
  error: Error | null;
}

const initiatePayment = async (plan: SubscriptionPlan) => {
  // Payment initiation logic will go here
  return { success: true };
};

export const subscriptionMachine = createMachine({
  loading: state(
    transition('LOADED', 'inactive')
  ),

  inactive: state(
    transition('SELECT_PLAN', 'pending', 
      reduce((ctx: SubscriptionContext, ev) => ({ 
        ...ctx, 
        selectedPlan: ev.plan 
      }))
    )
  ),

  pending: state(
    transition('UPDATE_BILLING', 'pending',
      reduce((ctx: SubscriptionContext, ev) => ({ 
        ...ctx, 
        billing: ev.billing 
      }))
    ),
    transition('COMPLETE', 'pendingPayment', 
      guard((ctx: SubscriptionContext) => !ctx.selectedPlan?.is_free)
    ),
    transition('COMPLETE', 'active',
      guard((ctx: SubscriptionContext) => !!ctx.selectedPlan?.is_free)
    )
  ),

  pendingPayment: invoke(
    initiatePayment,
    transition('done', 'active'),
    transition('error', 'error')
  ),

  active: state(
    transition('CHANGE_PLAN', 'pending'),
    transition('CANCEL', 'cancelled')
  ),

  cancelled: state(
    transition('REACTIVATE', 'pending')
  ),

  error: state(
    transition('RETRY', 'pending')
  )
}, () => ({
  subscription: null,
  selectedPlan: null,
  billing: null,
  payment: null,
  error: null
}));
