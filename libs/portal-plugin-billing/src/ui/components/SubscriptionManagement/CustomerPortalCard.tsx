import { Button } from "@lumeweb/portal-framework-ui-core";

import type { OperationState } from "@/hooks/useManagementAction";
import { ManagementAction } from "@/types/subscription";

interface CustomerPortalCardProps {
  onOpenDialog: () => void;
  getOperationState: () => OperationState;
}

export function CustomerPortalCard({ onOpenDialog, getOperationState }: CustomerPortalCardProps) {
  const { isLoading } = getOperationState();

  return (
    <div className="border-border/30 bg-secondary/30 rounded-lg border p-6">
      <h4 className="font-semibold">Manage Subscription</h4>
      <p className="text-muted-foreground mt-1 text-sm">
        View invoices, update payment methods, and more
      </p>
      <Button
        className="mt-4 gap-2"
        size="sm"
        variant="outline"
        onClick={onOpenDialog}
        disabled={isLoading}
      >
        {isLoading ? "Loading..." : "Open Portal"}
        <span aria-hidden className="text-xs">
          →
        </span>
      </Button>
    </div>
  );
}
