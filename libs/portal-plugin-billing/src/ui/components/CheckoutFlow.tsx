import { CheckoutForm } from "@/ui/components/CheckoutForm";
import { CheckoutSuccess } from "@/ui/components/CheckoutSuccess";
import { GatewaySelector } from "@/ui/components/GatewaySelector";
import { Button, Spinner, cn } from "@lumeweb/portal-framework-ui-core";
import { useBillingContext, CheckoutPhase } from "@/ui/context/BillingContext";
import { usePaymentEvents } from "@/ui/hooks/usePaymentEvents";
import { useGateways } from "@/hooks/useGateways";
import { useNavigate } from "react-router";
import { useCallback, useEffect, useRef } from "react";
import { useBillingAnalytics } from "@/ui/hooks/useBillingAnalytics";

interface CheckoutFlowProps {
  className?: string;
}

export function CheckoutFlow({ className }: CheckoutFlowProps) {
  const { checkout, resetCheckout, completeCheckout, subscription, findCurrentPlan, selectGateway, payment, selection, planChangeCheckout } = useBillingContext();
  const gatewaysHook = useGateways();
  const navigate = useNavigate();
  const analytics = useBillingAnalytics();

  // Track checkoutInitiated — fire once when checkout phase leaves Idle
  const hasTrackedInitiated = useRef(false);
  useEffect(() => {
    if (checkout.phase !== CheckoutPhase.Idle && !hasTrackedInitiated.current) {
      hasTrackedInitiated.current = true;
      analytics.checkoutInitiated({
        plan_id: selection.plan?.id,
        plan_name: typeof selection.plan?.name === "string" ? selection.plan.name : undefined,
        period: selection.period?.cadence,
        gateway: payment.selectedGateway?.id,
      });
    }
    if (checkout.phase === CheckoutPhase.Idle) {
      hasTrackedInitiated.current = false;
    }
  }, [checkout.phase]);

  // Track checkoutCompleted — fire when phase transitions TO Complete
  const prevPhaseRef = useRef(checkout.phase);
  useEffect(() => {
    if (checkout.phase === CheckoutPhase.Complete && prevPhaseRef.current !== CheckoutPhase.Complete) {
      analytics.checkoutCompleted({
        plan_id: selection.plan?.id,
        plan_name: typeof selection.plan?.name === "string" ? selection.plan.name : undefined,
        period: selection.period?.cadence,
        gateway: payment.selectedGateway?.id,
        session_id: checkout.sessionId ?? undefined,
      });
    }
    prevPhaseRef.current = checkout.phase;
  }, [checkout.phase]);

  // Wrap resetCheckout to track abandonment
  const handleResetCheckout = useCallback(() => {
    if (checkout.phase !== CheckoutPhase.Idle && checkout.phase !== CheckoutPhase.Complete) {
      analytics.checkoutAbandoned({
        plan_id: selection.plan?.id,
        plan_name: typeof selection.plan?.name === "string" ? selection.plan.name : undefined,
      });
    }
    resetCheckout();
  }, [checkout.phase, analytics, selection.plan, resetCheckout]);

  // Wire payment event hooks per js_payment_events.md spec:
  // - paymentCompleted (detail: null) dispatched by embedded_checkout.tpl onComplete
  // - sessionId comes from the API response (checkout.data.session_id), NOT from event detail
  // - onCheckoutComplete transitions Checkout -> Polling phase
  usePaymentEvents({
    sessionId: checkout.data?.session_id ?? planChangeCheckout?.sessionId,
    onCheckoutComplete: (sessionId) => {
      completeCheckout(sessionId);
    },
  });

  const handleBackToDashboard = useCallback(() => {
    handleResetCheckout();
    navigate("/account/subscription");
  }, [navigate, handleResetCheckout]);

  // Gateway Selection state
  if (checkout.phase === CheckoutPhase.GatewaySelection) {
    const gateways = gatewaysHook.data ?? [];

    return (
      <div className={cn("space-y-6", className)}>
        <div className="text-center">
          <h3 className="mb-2 text-xl font-semibold">Select Payment Method</h3>
          <p className="text-muted-foreground">
            Choose your preferred payment provider
          </p>
        </div>
        <GatewaySelector
          error={gatewaysHook.error ? new Error(String(gatewaysHook.error)) : null}
          gateways={gateways}
          isLoading={gatewaysHook.isBusy}
          onRetry={gatewaysHook.refetch}
          onSelect={selectGateway}
          selectedGatewayId={payment.selectedGateway?.id}
        />
        <div className="flex justify-center">
          <Button onClick={handleResetCheckout} variant="ghost">
            Back to Plans
          </Button>
        </div>
      </div>
    );
  }

  // Success state
  if (checkout.phase === CheckoutPhase.Complete) {
    return (
      <CheckoutSuccess
        className={className}
        currentPlan={findCurrentPlan()}
        gatewayType={subscription.data?.gateway_type}
        onBackToDashboard={handleBackToDashboard}
        subscription={subscription.data}
      />
    );
  }

  // Error state
  if (checkout.phase === CheckoutPhase.Error || checkout.hasError) {
    return (
      <div className={cn("text-center", className)}>
        <h3 className="mb-2 text-xl font-semibold text-red-600">Checkout Error</h3>
        <p className="text-muted-foreground">
          There was an error processing your checkout. Please try again.
        </p>
        <Button className="mt-4" onClick={handleResetCheckout}>
          Back to Plans
        </Button>
      </div>
    );
  }

  // Polling state - persists during background refetch, so check BEFORE isBusy
  if (checkout.phase === CheckoutPhase.Polling) {
    return (
      <div className={cn("flex flex-col items-center justify-center gap-4 py-12", className)}>
        <Spinner size="large" />
        <div className="text-center">
          <h3 className="mb-2 text-xl font-semibold">Processing Payment...</h3>
          <p className="text-muted-foreground">
            Please wait while we confirm your payment.
          </p>
        </div>
      </div>
    );
  }

  // Loading state only for Idle/Checkout phases (not Polling)
  if (checkout.isBusy) {
    return (
      <div className={cn("flex flex-col items-center justify-center gap-4 py-12", className)}>
        <Spinner size="large" />
        <div className="text-center">
          <h3 className="mb-2 text-xl font-semibold">Loading Checkout...</h3>
          <p className="text-muted-foreground">Preparing your checkout experience...</p>
        </div>
      </div>
    );
  }

  // Plan change checkout — fragments come from planChangeCheckout, not the useCheckout hook
  if (planChangeCheckout && checkout.phase === CheckoutPhase.Checkout) {
    return (
      <CheckoutForm
        className={className}
        fragments={planChangeCheckout.fragments}
        gatewayName={payment.selectedGateway?.name}
        onBack={handleResetCheckout}
        planCadence="monthly"
        planName="Plan Change"
        planPrice={0}
      />
    );
  }

  // Checkout form rendering (new subscription flow)
  if (checkout.isReady && checkout.data && selection.plan && selection.period) {
    return (
      <CheckoutForm
        className={className}
        fragments={checkout.data.fragments}
        gatewayName={payment.selectedGateway?.name}
        onBack={handleResetCheckout}
        planCadence={selection.period.cadence || "monthly"}
        planName={typeof selection.plan.name === "string" ? selection.plan.name : "Selected Plan"}
        planPrice={selection.period.price_usd ?? 0}
      />
    );
  }

  // Fallback - shouldn't reach here if used correctly
  return null;
}
