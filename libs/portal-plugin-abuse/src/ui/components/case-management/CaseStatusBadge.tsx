import { CaseStatus } from "@/types/case";
import { ThemedBadge } from "@lumeweb/portal-framework-ui";
import { STATUS_BADGE_CONFIG } from "@/types/badge-configs";

interface CaseStatusBadgeProps {
  status: CaseStatus;
  className?: string;
}

export function CaseStatusBadge({ status, className }: CaseStatusBadgeProps) {
  return (
    <ThemedBadge<CaseStatus>
      className={className}
      config={STATUS_BADGE_CONFIG}
      value={status}
    />
  );
}
