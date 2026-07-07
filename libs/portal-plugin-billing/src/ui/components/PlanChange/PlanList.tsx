import type { PublicPricingPlanPeriodDTO, PublicPricingPlanResponse } from "@/types/subscription";
import {
  cn,
  lazyIcon,
  Skeleton,
  Spinner,
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@lumeweb/portal-framework-ui-core";
import { FeaturesList } from "../PricingTable/FeaturesList";

const ChevronDown = lazyIcon("ChevronDown");

interface PlanListProps {
  currentPeriodId?: number;
  isLoading: boolean;
  onSelectPeriod: (periodId: number) => void;
  plans: PublicPricingPlanResponse[];
  selectedPeriodId?: number | null;
}

export function PlanList({ currentPeriodId, isLoading, onSelectPeriod, plans, selectedPeriodId }: PlanListProps) {
  function isCurrentPlan(period: PublicPricingPlanPeriodDTO): boolean {
    return period.id === currentPeriodId;
  }

  if (plans.length === 0) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {plans.map((plan: PublicPricingPlanResponse) => (
        <div key={plan.id} className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">{plan.name}</h4>
            <span className="text-muted-foreground text-xs">{plan.description}</span>
          </div>
          <div className="grid gap-2">
            {plan.pricing_periods?.map((period: PublicPricingPlanPeriodDTO) => (
              <button
                key={period.id}
                className={cn(
                  "flex items-center justify-between rounded-lg border p-3 text-left transition-colors",
                  isCurrentPlan(period)
                    ? "border-primary bg-primary/5 cursor-default"
                    : "hover:bg-secondary border-border/30 hover:border-primary/50",
                )}
                disabled={isCurrentPlan(period) || isLoading}
                onClick={() => onSelectPeriod(period.id)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm capitalize font-medium">{period.cadence}</span>
                  {!isCurrentPlan(period) && !isLoading && (
                    <span className="text-xs text-muted-foreground">Click to select</span>
                  )}
                  {isLoading && selectedPeriodId === period.id && (
                    <Spinner className="text-primary" size="small" />
                  )}
                </div>
                <span className="text-sm font-semibold">
                  ${period.price_usd.toFixed(2)}
                  {isCurrentPlan(period) && (
                    <span className="text-primary ml-2 text-xs">(Current)</span>
                  )}
                </span>
              </button>
            ))}
          </div>
          {plan.features && plan.features.length > 0 && (
            <Collapsible>
              <CollapsibleTrigger className="text-primary flex items-center gap-1 text-xs font-medium hover:underline">
                <ChevronDown className="h-3 w-3" />
                View details
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-2">
                  <FeaturesList features={plan.features} />
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      ))}
    </div>
  );
}
