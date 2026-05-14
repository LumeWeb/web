import type { PublicPricingPlanPeriodDTO, PublicPricingPlanResponse } from "@/types/subscription";
import { PlanCard } from "./PlanCard";

interface PlanGridProps {
  plans: PublicPricingPlanResponse[];
  cadence: string;
  currentPeriodId?: number;
  onSubscribe: (plan: PublicPricingPlanResponse, period: PublicPricingPlanPeriodDTO) => void;
}

export function PlanGrid({ plans, cadence, currentPeriodId, onSubscribe }: PlanGridProps) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {plans.map((plan) => {
        const period = plan.pricing_periods.find((p) => p.cadence === cadence);

        // Free/default plans may have no pricing periods — still render them
        // so users can see every tier. A plan with no period is free.
        if (!period && plan.pricing_periods.length > 0) return null;

        const isCurrentPlan = period ? currentPeriodId === period.id : false;

        return (
          <PlanCard
            key={plan.id}
            isCurrentPlan={isCurrentPlan}
            onSubscribe={onSubscribe}
            period={period}
            plan={plan}
          />
        );
      })}
    </div>
  );
}
