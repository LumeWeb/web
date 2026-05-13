import type { ManagementActionResult } from "@/hooks/useManagementAction";
import { Button} from "@lumeweb/portal-framework-ui-core";

const OPERATION_LABELS: Record<string, string> = {
  cancel: "Cancel Subscription",
  customer_portal: "Manage in Portal",
  pause: "Pause Subscription",
  resume: "Resume Subscription",
};

const OPERATION_DESCRIPTIONS: Record<string, string> = {
  cancel: "Cancel your current subscription",
  customer_portal: "Access full subscription management in your customer portal",
  pause: "Temporarily pause your subscription",
  resume: "Resume your paused subscription",
};

interface OperationCardProps {
  operation: string;
  onExecute: (operation: string) => Promise<ManagementActionResult>;
  isLoading: boolean;
}

export function OperationCard({ operation, onExecute, isLoading }: OperationCardProps) {
  return (
    <div className="border-border/30 bg-secondary/30 rounded-lg border p-6">
      <h4 className="font-semibold">{OPERATION_LABELS[operation] ?? operation}</h4>
      <p className="text-muted-foreground mt-1 text-sm">
        {OPERATION_DESCRIPTIONS[operation] ?? `Manage ${operation}`}
      </p>

      <Button
        className="mt-4"
        size="sm"
        variant="outline"
        onClick={() => onExecute(operation)}
        disabled={isLoading}
      >
        {isLoading ? "Processing..." : (OPERATION_LABELS[operation] ?? operation)}
      </Button>
    </div>
  );
}
