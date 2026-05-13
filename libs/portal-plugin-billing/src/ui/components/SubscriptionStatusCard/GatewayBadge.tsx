import { Badge } from "@lumeweb/portal-framework-ui-core";

interface GatewayBadgeProps {
  gatewayType?: string;
  managementMode?: string;
}

export function GatewayBadge({ gatewayType, managementMode }: GatewayBadgeProps) {
  if (!gatewayType) return null;

  const modeLabel = managementMode === "portal" ? "External" : "Managed";

  return (
    <div className="flex items-center gap-2">
      <Badge variant="secondary" className="uppercase">
        {gatewayType}
      </Badge>
      <Badge variant="outline" className="text-xs">
        {modeLabel}
      </Badge>
    </div>
  );
}
