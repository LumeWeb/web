import { useState } from "react";
import { useManagementAction } from "@/hooks/useManagementAction";
import { useManagementCapabilities } from "@/hooks/useManagementCapabilities";
import type { ManagementActionResult } from "@/hooks/useManagementAction";
import { ManagementAction } from "@/types/subscription";
import { useGateways } from "@/hooks/useGateways";
import { useBillingContext } from "@/ui/context/BillingContext";
import { PlanChangeDialog } from "./PlanChangeDialog";
import type { PublicPricingPlanPeriodDTO, CheckoutUIResponse } from "@/types/subscription";
import { useBillingAnalytics } from "@/ui/hooks/useBillingAnalytics";

interface PlanChangeDialogContainerProps {
  onClose: () => void;
}

export function PlanChangeDialogContainer({ onClose }: PlanChangeDialogContainerProps) {
  const { plans, subscription, startPlanChangeCheckout } = useBillingContext();
  const { execute, isLoading: actionLoading } = useManagementAction({
    onSuccess: () => subscription.silentRefetch(),
  });
  const { data: capabilities } = useManagementCapabilities(
    {},
    { isSubscribed: subscription.data?.is_subscribed }
  );
  const gatewaysHook = useGateways();
  const analytics = useBillingAnalytics();
  const [result, setResult] = useState<ManagementActionResult | null>(null);
  const [selectedPeriodId, setSelectedPeriodId] = useState<number | null>(null);
  const [confirmingPeriodId, setConfirmingPeriodId] = useState<number | null>(null);

  const currentPeriodId = subscription.data?.pricing_plan_period_id;
  const gatewayName = subscription.data?.gateway_type;
  const managementMode = capabilities?.management_mode === "portal" ? "portal" : "api";
  const [checkoutRequiredData, setCheckoutRequiredData] = useState<{
    fragments: CheckoutUIResponse["fragments"];
    sessionId: string;
  } | null>(null);

  function handleSelectPlan(periodId: number) {
    setConfirmingPeriodId(periodId);
    const isUpgrade = currentPeriodId != null && periodId > currentPeriodId;
    if (isUpgrade) {
      analytics.upgradeInitiated({ current_plan_id: currentPeriodId ?? undefined, target_plan_id: periodId });
    } else if (currentPeriodId != null && periodId < currentPeriodId) {
      analytics.downgradeInitiated({ current_plan_id: currentPeriodId, target_plan_id: periodId });
    } else {
      analytics.upgradeInitiated({ current_plan_id: currentPeriodId ?? undefined, target_plan_id: periodId });
    }
  }

  function handleCancelConfirm() {
    setConfirmingPeriodId(null);
  }

  async function handleConfirmChange() {
    if (!confirmingPeriodId) return;
    const periodId = confirmingPeriodId;
    setSelectedPeriodId(periodId);
    setConfirmingPeriodId(null);
    setResult(null);
    setCheckoutRequiredData(null);

    const res = await execute("change_plan", { period_id: periodId });
    setResult(res);

    if (res.type === "redirect" && res.url) {
      window.open(res.url, "_blank");
      return;
    }

    if (res.type === ManagementAction.CheckoutRequired) {
      const data = res.data as Record<string, unknown>;
      const sessionId = data?.checkout_link as string | undefined;
      const fragments = data?.fragments as CheckoutUIResponse["fragments"] | undefined;

      if (sessionId && fragments) {
        setCheckoutRequiredData({ fragments, sessionId });
      }
      return;
    }

    if (res.type === ManagementAction.Complete) {
      analytics.upgradeCompleted({
        old_plan_id: currentPeriodId ?? undefined,
        new_plan_id: periodId,
      });
      subscription.silentRefetch();
      onClose();
      return;
    }

    if (res.type === "api_required" || res.type === "show_ui" || res.type === "unsupported") {
      return;
    }
  }

  function handleContinueToCheckout() {
    if (!checkoutRequiredData) return;
    const gateway = gatewaysHook.gateways?.find((g) => g.id === gatewayName);
    if (!gateway) return;
    onClose();
    startPlanChangeCheckout({
      fragments: checkoutRequiredData.fragments,
      sessionId: checkoutRequiredData.sessionId,
      gateway,
    });
  }

  async function handleOpenPortal(): Promise<string | null> {
    const res = await execute("change_plan");
    if (res.type === "redirect" && res.url) {
      return res.url;
    }
    return null;
  }

  return (
    <PlanChangeDialog
      confirmingPeriodId={confirmingPeriodId}
      currentPeriodId={currentPeriodId}
      gatewayName={gatewayName}
      isLoading={actionLoading}
      managementMode={managementMode}
      onCancelConfirm={handleCancelConfirm}
      onChangePlan={handleSelectPlan}
      onConfirmChange={handleConfirmChange}
      onClose={onClose}
      onContinueToCheckout={handleContinueToCheckout}
      onOpenPortal={handleOpenPortal}
      plans={plans.all}
      result={result}
      selectedPeriodId={selectedPeriodId}
    />
  );
}
