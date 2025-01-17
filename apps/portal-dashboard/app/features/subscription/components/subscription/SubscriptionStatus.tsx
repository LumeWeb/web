import React from "react";
import { useSubscriptionContext } from "../../contexts/SubscriptionContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "portal-shared/components/ui/card";
import { formatBytes, formatDate } from "../../utils/formatters";
import { Progress } from "portal-shared/components/ui/progress";

export function SubscriptionStatus() {
  const { subscription } = useSubscriptionContext();

  if (!subscription) {
    return null;
  }

  const { plan, current_period_start, current_period_end } = subscription;

  // TODO: Get actual storage used from backend
  const storageUsed = 1000000000; // 1GB for example
  const storagePercent = (storageUsed / plan.resources.storage) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Current Plan</div>
            <div className="font-medium">{plan.name}</div>
          </div>
          {current_period_start && current_period_end && (
            <div>
              <div className="text-sm text-muted-foreground">
                Billing Period
              </div>
              <div className="font-medium">
                {formatDate(current_period_start)} -{" "}
                {formatDate(current_period_end)}
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm text-muted-foreground">Storage Used</span>
            <span className="text-sm">
              {formatBytes(storageUsed)} / {formatBytes(plan.resources.storage)}
            </span>
          </div>
          <Progress value={storagePercent} />
          {storagePercent > 80 && (
            <p className="text-red-500 text-sm mt-1">
              Running low on storage! Consider upgrading.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
