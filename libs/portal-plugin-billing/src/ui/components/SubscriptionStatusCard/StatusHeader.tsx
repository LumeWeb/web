import { GatewayBadge } from "./GatewayBadge";
import { Skeleton } from "@lumeweb/portal-framework-ui-core";

interface StatusHeaderProps {
  gatewayType?: string;
  managementMode?: string;
  isLoading?: boolean;
}

export function StatusHeader({ gatewayType, managementMode, isLoading }: StatusHeaderProps) {
  return (
    <div className="flex items-start justify-between">
      <h3 className="text-lg font-semibold">Subscription</h3>
      {isLoading ? (
        <Skeleton className="h-6 w-24" />
      ) : (
        <GatewayBadge
          gatewayType={gatewayType}
          managementMode={managementMode}
        />
      )}
    </div>
  );
}
