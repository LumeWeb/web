import { createMachine, state, transition, reduce, guard, invoke } from 'robot3';
import { 
  Subscription,
  SubscriptionPlan,
  BillingInfo,
  PaymentInfo,
  SubscriptionEvent
} from '../types/subscription.types';
import { SubscriptionPlanStatus } from 'portal-shared/dataProviders/accountProvider';
import { PaymentService } from '../services/PaymentService';

interface SubscriptionContext {
  subscription: Subscription | null;
  selectedPlan: SubscriptionPlan | null;
  billing: BillingInfo | null;
  payment: PaymentInfo | null;
  error: Error | null;
}

const paymentService = new PaymentService();

const initiatePayment = async (context: SubscriptionContext) => {
  if (!context.selectedPlan) {
    throw new Error('No plan selected');
  }
  
  // Initialize payment session
  const payment = await paymentService.getPaymentStatus({
    clientSecret: '',
    publishableKey: '',
    expiresAt: new Date().toISOString()
  });
  
  return { payment };
};

export const subscriptionMachine = createMachine<SubscriptionContext, SubscriptionEvent>({
  loading: state(
    transition('LOADED', 'inactive', 
      reduce((ctx, ev) => ({
        ...ctx,
        subscription: ev.subscription,
        error: null
      }))
    ),
    transition('ERROR', 'error',
      reduce((ctx, ev) => ({ ...ctx, error: ev.error }))
    )
  ),

  inactive: state(
    transition('SELECT_PLAN', 'pending', 
      reduce((ctx, ev) => ({ 
        ...ctx, 
        selectedPlan: ev.plan,
        error: null
      }))
    ),
    transition('ERROR', 'error',
      reduce((ctx, ev) => ({ ...ctx, error: ev.error }))
    )
  ),

  pending: state(
    transition('UPDATE_BILLING', 'pending',
      reduce((ctx, ev) => ({ 
        ...ctx, 
        billing: ev.billing,
        error: null
      }))
    ),
    transition('COMPLETE', 'pendingPayment', 
      guard((ctx) => !ctx.selectedPlan?.is_free),
      reduce((ctx) => ({ ...ctx, error: null }))
    ),
    transition('COMPLETE', 'active',
      guard((ctx) => !!ctx.selectedPlan?.is_free),
      reduce((ctx) => ({
        ...ctx,
        subscription: {
          ...ctx.subscription,
          plan: ctx.selectedPlan!,
          status: SubscriptionPlanStatus.ACTIVE
        },
        error: null
      }))
    ),
    transition('ERROR', 'error',
      reduce((ctx, ev) => ({ ...ctx, error: ev.error }))
    )
  ),

  pendingPayment: invoke(
    initiatePayment,
    transition('done', 'active',
      reduce((ctx, ev) => ({
        ...ctx,
        subscription: {
          ...ctx.subscription,
          plan: ctx.selectedPlan!,
          status: SubscriptionPlanStatus.ACTIVE,
          payment: ev.data.payment
        },
        error: null
      }))
    ),
    transition('error', 'error',
      reduce((ctx, ev) => ({ ...ctx, error: ev.error }))
    )
  ),

  active: state(
    transition('SELECT_PLAN', 'pending',
      reduce((ctx, ev) => ({ 
        ...ctx, 
        selectedPlan: ev.plan,
        error: null
      }))
    ),
    transition('CANCEL', 'cancelled',
      reduce((ctx) => ({
        ...ctx,
        subscription: {
          ...ctx.subscription!,
          status: SubscriptionPlanStatus.CANCELLED
        },
        error: null
      }))
    ),
    transition('ERROR', 'error',
      reduce((ctx, ev) => ({ ...ctx, error: ev.error }))
    )
  ),

  cancelled: state(
    transition('REACTIVATE', 'pending',
      reduce((ctx) => ({ ...ctx, error: null }))
    ),
    transition('ERROR', 'error',
      reduce((ctx, ev) => ({ ...ctx, error: ev.error }))
    )
  ),

  error: state(
    transition('RETRY', 'pending',
      reduce((ctx) => ({ ...ctx, error: null }))
    )
  )
}, () => ({
  subscription: null,
  selectedPlan: null,
  billing: null,
  payment: null,
  error: null
}));
