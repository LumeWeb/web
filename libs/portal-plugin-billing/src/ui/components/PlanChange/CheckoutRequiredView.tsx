import { Button } from "@lumeweb/portal-framework-ui-core";

interface CheckoutRequiredViewProps {
  chargeDue?: string;
  creditApplied?: string;
  effectiveDate?: string;
  gatewayName?: string;
  onContinueToCheckout: () => void;
}

export function CheckoutRequiredView({
  chargeDue,
  creditApplied,
  effectiveDate,
  gatewayName,
  onContinueToCheckout,
}: CheckoutRequiredViewProps) {
  return (
    <div className="space-y-4">
      {(creditApplied || chargeDue || effectiveDate) && (
        <div className="rounded-lg border border-border/30 bg-secondary/30 p-4 space-y-1">
          {chargeDue && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Prorated charge</span>
              <span className="font-medium">${Number(chargeDue).toFixed(2)}</span>
            </div>
          )}
          {creditApplied && Number(creditApplied) > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Credit applied</span>
              <span className="font-medium">-${Number(creditApplied).toFixed(2)}</span>
            </div>
          )}
          {effectiveDate && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Effective</span>
              <span className="font-medium">{new Date(effectiveDate).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col items-center gap-2 pt-2">
        <Button onClick={onContinueToCheckout} className="w-full">
          Continue to Checkout
        </Button>
        {gatewayName && (
          <p className="text-muted-foreground text-center text-xs">
            Securely powered by {gatewayName}
          </p>
        )}
      </div>
    </div>
  );
}
