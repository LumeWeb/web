import { useQuota } from "@lumeweb/portal-plugin-quota";
import { Progress, Skeleton } from "@lumeweb/portal-framework-ui-core";
import type { QuotaTypeStatus } from "@lumeweb/portal-sdk";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function getBarColor(percentage: number): string {
  if (percentage > 90) return "bg-destructive";
  if (percentage >= 70) return "bg-yellow-500";
  return "bg-foreground";
}

interface QuotaRowProps {
  label: string;
  quota: QuotaTypeStatus;
}

function QuotaRow({ label, quota }: QuotaRowProps) {
  const isUnlimited = quota.limit === undefined;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        {isUnlimited ? (
          <span className="text-muted-foreground">
            {formatBytes(quota.used)} used
          </span>
        ) : (
          <span className="font-medium">
            {formatBytes(quota.used)} / {formatBytes(quota.limit ?? 0)}
          </span>
        )}
      </div>
      {!isUnlimited && (
        <Progress
          className="h-1.5"
          indicatorClassName={getBarColor(quota.percentage)}
          max={quota.limit ?? 0}
          value={quota.used}
        />
      )}
    </div>
  );
}

export function QuotaSummary() {
  const { data, isReady, isBusy, hasError } = useQuota();

  if (isBusy) {
    return (
      <div className="mt-4 space-y-3">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-1.5 w-full" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-1.5 w-full" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-1.5 w-full" />
      </div>
    );
  }

  if (hasError || !isReady || !data) {
    return null;
  }

  return (
    <div className="mt-4 space-y-3 border-t border-border/30 pt-4">
      <span className="text-muted-foreground text-sm font-medium">Quota Usage</span>
      <QuotaRow label="Storage" quota={data.storage} />
      <QuotaRow label="Upload" quota={data.upload} />
      <QuotaRow label="Download" quota={data.download} />
    </div>
  );
}
