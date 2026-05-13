import { Button, cn } from "@lumeweb/portal-framework-ui-core";
import type { PublicPricingPlanPeriodDTO, PublicPricingPlanResponse } from "@/types/subscription";
import { formatAmount } from "@/utils/formatAmount";
import { FeaturesList } from "./FeaturesList";

interface PlanCardProps {
  plan: PublicPricingPlanResponse;
  period?: PublicPricingPlanPeriodDTO;
  isCurrentPlan: boolean;
  onSubscribe: (plan: PublicPricingPlanResponse, period: PublicPricingPlanPeriodDTO) => void;
}

export function PlanCard({ plan, period, isCurrentPlan, onSubscribe }: PlanCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border p-6 transition-all",
        isCurrentPlan && "ring-primary ring-2",
      )}
    >
      <h3 className="text-lg font-semibold">{plan.name}</h3>
      <p className="text-muted-foreground mt-1 text-sm">{plan.description}</p>
      <div className="mt-4">
        {period ? (
          <>
            <span className="text-3xl font-bold">{formatAmount(period.price_usd)}</span>
            <span className="text-muted-foreground text-sm">
              /{period.cadence === "monthly" ? "mo" : "yr"}
            </span>
          </>
        ) : (
          <span className="text-3xl font-bold">Free</span>
        )}
      </div>
      <Button
        className="mt-4 w-full"
        disabled={isCurrentPlan}
        onClick={() => period && onSubscribe(plan, period)}
        variant={isCurrentPlan ? "outline" : "default"}
      >
        {isCurrentPlan ? "Current Plan" : "Subscribe"}
      </Button>
      <div className="mt-6">
        <FeaturesList features={plan.features} />
      </div>
    </div>
  );
}
