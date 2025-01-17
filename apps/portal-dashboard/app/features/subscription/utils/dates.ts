import { SubscriptionPlan, SubscriptionPlanPeriod } from '../types/subscription.types';

export function getSubscriptionPeriodDates(
  plan: SubscriptionPlan,
  startDate: Date = new Date()
): { start: Date; end: Date } {
  const start = new Date(startDate);
  const end = new Date(startDate);

  if (plan.period === SubscriptionPlanPeriod.MONTHLY) {
    end.setMonth(end.getMonth() + 1);
  } else if (plan.period === SubscriptionPlanPeriod.YEARLY) {
    end.setFullYear(end.getFullYear() + 1);
  }

  return { start, end };
}
