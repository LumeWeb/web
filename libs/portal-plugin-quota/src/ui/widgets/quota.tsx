import { useQuota } from "../../hooks/useQuota";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@lumeweb/portal-framework-ui-core";
import { Progress } from "@lumeweb/portal-framework-ui-core";
import { Skeleton } from "@lumeweb/portal-framework-ui-core";
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

interface QuotaBarProps {
  label: string;
  quota: QuotaTypeStatus;
}

function QuotaBar({ label, quota }: QuotaBarProps) {
  const isUnlimited = quota.limit === undefined;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        {isUnlimited ? (
          <span className="text-muted-foreground">Unlimited</span>
        ) : (
          <span className="text-muted-foreground">
            {quota.percentage.toFixed(1)}%
          </span>
        )}
      </div>
      {isUnlimited ? (
        <div className="text-xs text-muted-foreground">
          {formatBytes(quota.used)} used
        </div>
      ) : (
        <>
          <Progress
            className="h-2"
            indicatorClassName={getBarColor(quota.percentage)}
            max={quota.limit ?? 0}
            value={quota.used}
          />
          <div className="text-xs text-muted-foreground">
            {formatBytes(quota.used)} / {formatBytes(quota.limit ?? 0)}
          </div>
        </>
      )}
    </div>
  );
}

export default function QuotaWidget() {
  const { data, isReady, isBusy, hasError } = useQuota();

  if (isBusy) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quota Usage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-2 w-full" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-2 w-full" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-2 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (hasError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quota Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">Failed to load quota data</p>
        </CardContent>
      </Card>
    );
  }

  if (!isReady || !data) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quota Usage</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <QuotaBar label="Storage" quota={data.storage} />
        <QuotaBar label="Upload" quota={data.upload} />
        <QuotaBar label="Download" quota={data.download} />
      </CardContent>
    </Card>
  );
}
