import { SubscriptionState, SubscriptionEvent, Subscription, SubscriptionPlan, BillingInfo } from "../types/subscription.types";
import { SubscriptionStateMachine } from "../states/SubscriptionStateMachine";

export class SubscriptionService {
  private stateMachine: SubscriptionStateMachine;

  constructor() {
    this.stateMachine = new SubscriptionStateMachine();
  }

  public getState(): SubscriptionState {
    return this.stateMachine.getState();
  }

  public async loadSubscription(subscription: Subscription | null): Promise<SubscriptionState> {
    return this.stateMachine.transition({
      type: 'SUBSCRIPTION_LOADED',
      subscription: subscription || {
        id: '',
        status: 'INACTIVE',
        plan: null
      } as Subscription
    });
  }

  public async createSubscription(plan: SubscriptionPlan): Promise<SubscriptionState> {
    return this.stateMachine.transition({
      type: 'CREATE_SUBSCRIPTION',
      plan
    });
  }

  public async updateBilling(billing: BillingInfo): Promise<SubscriptionState> {
    return this.stateMachine.transition({
      type: 'UPDATE_BILLING',
      billing
    });
  }

  public async completePayment(paymentMethodId: string): Promise<SubscriptionState> {
    return this.stateMachine.transition({
      type: 'COMPLETE_PAYMENT',
      paymentMethodId
    });
  }

  public async cancelSubscription(): Promise<SubscriptionState> {
    return this.stateMachine.transition({
      type: 'CANCEL_SUBSCRIPTION'
    });
  }

  public async handleError(error: Error): Promise<SubscriptionState> {
    return this.stateMachine.transition({
      type: 'ERROR_OCCURRED',
      error
    });
  }

  public async validatePlanChange(currentPlan: SubscriptionPlan, newPlan: SubscriptionPlan): Promise<boolean> {
    // Implement plan change validation logic
    // e.g., check if downgrade is allowed, verify resource limits, etc.
    return true; // Placeholder - implement actual validation
  }


  public getSubscriptionPeriodDates(
    plan: SubscriptionPlan,
    startDate: Date = new Date()
  ): { start: Date; end: Date } {
    const start = new Date(startDate);
    const end = new Date(startDate);
    
    if (plan.period === 'MONTHLY') {
      end.setMonth(end.getMonth() + 1);
    } else if (plan.period === 'YEARLY') {
      end.setFullYear(end.getFullYear() + 1);
    }
    
    return { start, end };
  }

  public async validateSubscriptionStatus(subscription: Subscription): Promise<boolean> {
    const validTransitions = {
      'INACTIVE': ['PENDING', 'ACTIVE'],
      'PENDING': ['ACTIVE', 'CANCELLED'],
      'ACTIVE': ['SUSPENDED', 'CANCELLED'],
      'SUSPENDED': ['ACTIVE', 'CANCELLED'],
      'CANCELLED': ['PENDING', 'ACTIVE']
    };

    const currentStatus = subscription.status;
    const allowedStatuses = validTransitions[currentStatus];
    
    return !!allowedStatuses;
  }
}
