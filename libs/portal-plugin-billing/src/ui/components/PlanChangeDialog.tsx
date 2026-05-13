import type { ManagementActionResult } from "@/hooks/useManagementAction";
import type { PublicPricingPlanPeriodDTO, PublicPricingPlanResponse } from "@/types/subscription";
import { ManagementAction } from "@/types/subscription";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@lumeweb/portal-framework-ui-core";
import { useState, useEffect } from "react";
import {
  CheckoutRequiredView,
  PlanList,
  PortalView,
  RedirectView,
  ShowUIView,
} from "./PlanChange";

interface PlanChangeDialogProps {
  confirmingPeriodId: number | null;
  currentPeriodId?: number;
  isLoading: boolean;
  onChangePlan: (periodId: number) => void;
  onCancelConfirm: () => void;
  onConfirmChange: () => void;
  onClose: () => void;
  onContinueToCheckout?: () => void;
  plans: PublicPricingPlanResponse[];
  result: ManagementActionResult | null;
  selectedPeriodId: number | null;
  managementMode?: "portal" | "api";
  gatewayName?: string;
  onOpenPortal?: () => Promise<string | null>;
}

function getResultView(result: ManagementActionResult | null): {
  showError: boolean;
  showShowUI: boolean;
  showRedirect: boolean;
  showCheckoutRequired: boolean;
  showPlanList: boolean;
} {
  const isCheckoutRequired = result?.type === ManagementAction.CheckoutRequired;
  const isComplete = result?.type === ManagementAction.Complete;
  return {
    showError: result?.type === "error",
    showShowUI: result?.type === "show_ui",
    showRedirect: result?.type === "redirect",
    showCheckoutRequired: isCheckoutRequired,
    showPlanList: !isCheckoutRequired && !isComplete,
  };
}

export function PlanChangeDialog({
  confirmingPeriodId,
  currentPeriodId,
  isLoading,
  onChangePlan,
  onCancelConfirm,
  onConfirmChange,
  onClose,
  onContinueToCheckout,
  plans,
  result,
  selectedPeriodId,
  managementMode,
  gatewayName,
  onOpenPortal,
}: PlanChangeDialogProps) {
  const [portalUrl, setPortalUrl] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    if (managementMode === "portal" && !result && onOpenPortal && !portalUrl && !portalLoading) {
      setPortalLoading(true);
      onOpenPortal()
        .then((url) => {
          if (url) setPortalUrl(url);
        })
        .finally(() => setPortalLoading(false));
    }
  }, [managementMode, result, onOpenPortal, portalUrl, portalLoading]);

  const views = getResultView(result);

  const selectedPlan = plans.find((p) =>
    p.pricing_periods?.some((per) => per.id === confirmingPeriodId),
  );
  const selectedPeriod = selectedPlan?.pricing_periods?.find(
    (p) => p.id === confirmingPeriodId,
  );

  // Portal mode without result shows portal view
  if (managementMode === "portal" && !result) {
    return (
      <Dialog open onOpenChange={(open: boolean) => !open && onClose()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Plan</DialogTitle>
            <DialogDescription>
              Plan changes are managed through your payment provider
            </DialogDescription>
          </DialogHeader>
          <PortalView loading={portalLoading} url={portalUrl} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open onOpenChange={(open: boolean) => !open && onClose()}>
        <DialogContent className="max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Change Plan</DialogTitle>
            <DialogDescription>Select a new plan to switch to</DialogDescription>
          </DialogHeader>

          {views.showError && (
            <div className="bg-destructive/10 text-destructive rounded p-3 text-sm">
              {(result as Extract<ManagementActionResult, { type: "error" }>).message}
            </div>
          )}

          {views.showShowUI && (() => {
            const data = (result as Extract<ManagementActionResult, { type: "show_ui" }>).data;
            return (
              <ShowUIView
                canAbort={data.can_abort as boolean}
                confirmationMessage={data.confirmation_message as string | undefined}
                effectiveTime={data.effective_time as string | undefined}
              />
            );
          })()}

          {views.showRedirect && (
            <RedirectView
              url={(result as Extract<ManagementActionResult, { type: "redirect" }>).url}
            />
          )}

          {views.showCheckoutRequired && (() => {
            const data = (result as Extract<ManagementActionResult, { type: ManagementAction.CheckoutRequired }>).data;
            return (
              <CheckoutRequiredView
                chargeDue={data.charge_due as string | undefined}
                creditApplied={data.credit_applied as string | undefined}
                effectiveDate={data.effective_date as string | undefined}
                gatewayName={gatewayName}
                onContinueToCheckout={() => onContinueToCheckout?.()}
              />
            );
          })()}

          {views.showPlanList && (
            <PlanList
              currentPeriodId={currentPeriodId}
              isLoading={isLoading}
              onSelectPeriod={onChangePlan}
              plans={plans}
              selectedPeriodId={selectedPeriodId}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmingPeriodId !== null} onOpenChange={(open: boolean) => !open && onCancelConfirm()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change Plan?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to switch to {selectedPlan?.name ?? "the selected plan"}
              {selectedPeriod ? ` (${selectedPeriod.cadence} — $${selectedPeriod.price_usd.toFixed(2)})` : ""}?
              This change will take effect immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={onCancelConfirm}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onConfirmChange}>Confirm Change</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
