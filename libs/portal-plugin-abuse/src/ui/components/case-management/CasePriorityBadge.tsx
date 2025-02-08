import { CasePriority } from "abuse-management/types/case";
import { ThemedBadge } from "@lumeweb/portal-framework-ui";
import { PRIORITY_BADGE_CONFIG } from "@/types/badge-configs";

interface CasePriorityBadgeProps {
  priority: CasePriority;
  className?: string;
}

export function CasePriorityBadge({
  priority,
  className,
}: CasePriorityBadgeProps) {
  return (
    <ThemedBadge<CasePriority>
      className={className}
      config={PRIORITY_BADGE_CONFIG}
      value={priority}
    />
  );
}
