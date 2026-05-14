import { useState } from "react";
import { OperationCard } from "./OperationCard";
import { CustomerPortalCard } from "./CustomerPortalCard";
import { ChangePlanCard } from "./ChangePlanCard";
import { UrlActionDialog } from "../dialogs/UrlActionDialog";
import type { ManagementOperation } from "@/types/subscription";
import type { ManagementActionResult, OperationState } from "@/hooks/useManagementAction";
import { ManagementAction } from "@/types/subscription";

interface ManagementGridProps {
  operations: string[];
  hasCustomerPortal: boolean;
  canChangePlan: boolean;
  onExecute: (operation: ManagementOperation) => Promise<ManagementActionResult>;
  getOperationState: (operation: ManagementOperation) => OperationState;
  onChangePlan: () => void;
}

export function ManagementGrid({
  operations,
  hasCustomerPortal,
  canChangePlan,
  onExecute,
  getOperationState,
  onChangePlan,
}: ManagementGridProps) {
  const [dialogUrl, setDialogUrl] = useState<string | null>(null);

  const handleExecute = async (operation: string): Promise<ManagementActionResult> => {
    const result = await onExecute(operation as ManagementOperation);
    
    if (result.type === ManagementAction.Redirect) {
      setDialogUrl(result.url);
    }
    
    return result;
  };

  const handleOpenPortal = async () => {
    const result = await onExecute("customer_portal");
    
    if (result.type === ManagementAction.Redirect) {
      setDialogUrl(result.url);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {operations.map((operation) => (
          <OperationCard
            key={operation}
            operation={operation}
            onExecute={handleExecute}
            isLoading={getOperationState(operation as ManagementOperation).isLoading}
          />
        ))}

        {hasCustomerPortal && (
          <CustomerPortalCard
            onOpenDialog={handleOpenPortal}
            getOperationState={() => getOperationState("customer_portal")}
          />
        )}

        {canChangePlan && <ChangePlanCard onOpen={onChangePlan} />}
      </div>

      {dialogUrl && (
        <UrlActionDialog
          open={!!dialogUrl}
          onClose={() => setDialogUrl(null)}
          title="Confirm Action"
          description="You will be redirected to complete this action."
          url={dialogUrl}
        />
      )}
    </>
  );
}
