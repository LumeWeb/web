import type {
  CheckoutUIResponse,
  PublicPricingPlanPeriodDTO,
  PublicPricingPlanResponse,
} from "@/types/subscription";
import { useState } from "react";
import { useCheckout } from "@/hooks/useCheckout";
import { usePricingPlans } from "@/hooks/usePricingPlans";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { FragmentRenderer } from "@/ui/components/FragmentRenderer";
import { Button, Card, CardContent, CardHeader, CardTitle, cn, Label, Switch, lazyIcon } from "@lumeweb/portal-framework-ui-core";
import { PlanCard } from "./PricingTable/PlanCard";
const ArrowLeft = lazyIcon("ArrowLeft");


interface PricingTableProps {
  className?: string;
}

export function PricingTable({ className }: PricingTableProps) {
  const [cadence, setCadence] = useState<string>("monthly");
  const [checkoutResponse, setCheckoutResponse] = useState<CheckoutUIResponse | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  const [selectedPeriodId, setSelectedPeriodId] = useState<number | null>(null);

  const plansHook = usePricingPlans();
  const subscriptionHook = useSubscriptionStatus();
  const checkout = useCheckout({
    planId: selectedPlanId ?? "",
    periodId: selectedPeriodId ?? undefined,
    queryOptions: { enabled: !!selectedPlanId },
  });

  const plans = plansHook.data?.data ?? [];
  const currentPlanPeriodId = subscriptionHook.data?.pricing_plan_period_id;

  function handleSubscribe(plan: PublicPricingPlanResponse, period: PublicPricingPlanPeriodDTO) {
    setSelectedPlanId(String(plan.id));
    setSelectedPeriodId(period.id);
  }

  // Render checkout fragment when ready
  if (checkout.isReady && selectedPlanId) {
    return (
      <FragmentRenderer
        fragments={checkout.data!.fragments}
      />
    );
  }

  // Render pricing plans
  return (
    <div className={cn("mx-auto max-w-4xl", className)}>
      <div className="mb-8 flex items-center justify-center gap-3">
        <Label className="text-muted-foreground text-sm">Monthly</Label>
        <Switch
          checked={cadence === "yearly"}
          onCheckedChange={(checked: boolean) => setCadence(checked ? "yearly" : "monthly")}
        />
        <Label className="text-muted-foreground text-sm">Yearly</Label>
      </div>

      {plansHook.isBusy && <div className="text-center">Loading plans...</div>}

      {plansHook.hasError && (
        <div className="text-center text-red-500">
          Failed to load pricing plans. Please try again later.
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => {
          const period = plan.pricing_periods.find((p) => p.cadence === cadence);
          if (!period) return null;

          const isCurrentPlan = currentPlanPeriodId === period.id;

          return (
            <PlanCard
              key={plan.id}
              isCurrentPlan={isCurrentPlan}
              onSubscribe={handleSubscribe}
              period={period}
              plan={plan}
            />
          );
        })}
      </div>
    </div>
  );
}
