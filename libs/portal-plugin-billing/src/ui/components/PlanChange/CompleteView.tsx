import { Button } from "@lumeweb/portal-framework-ui-core";

interface CompleteViewProps {
  creditApplied?: string;
  chargeDue?: string;
  effectiveDate?: string;
  onClose: () => void;
}

export function CompleteView({
  creditApplied,
  chargeDue,
  effectiveDate,
  onClose,
}: CompleteViewProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border/30 bg-secondary/30 p-4 space-y-1">
        <p className="text-sm font-medium">Plan change complete</p>
        {chargeDue !== undefined && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Amount due</span>
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

      <Button onClick={onClose} className="w-full">
        Done
      </Button>
    </div>
  );
}
