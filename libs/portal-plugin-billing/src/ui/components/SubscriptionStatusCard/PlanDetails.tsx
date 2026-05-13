import type { PublicPricingPlanResponse, PublicPricingPlanPeriodDTO } from "@/types/subscription";

interface PlanDetailsProps {
  planInfo: {
    plan: PublicPricingPlanResponse;
    period: PublicPricingPlanPeriodDTO;
  } | null;
}

export function PlanDetails({ planInfo }: PlanDetailsProps) {
  if (!planInfo) return null;

  return (
    <div className="mt-4 space-y-2">
      <div className="flex justify-between">
        <span className="text-muted-foreground text-sm">Plan</span>
        <span className="font-medium">{planInfo.plan.name}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground text-sm">Billing</span>
        <span className="font-medium capitalize">{planInfo.period.cadence}</span>
      </div>
    </div>
  );
}
