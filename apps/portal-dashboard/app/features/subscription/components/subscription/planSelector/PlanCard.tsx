import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "portal-shared/components/ui/card";
import {
  CloudIcon,
  CloudUploadIcon,
  DownloadIcon,
} from "portal-shared/components/icons";
import { formatBytes } from "../../../utils/formatters";
import { SubscriptionPlan } from "../../../types/subscription.types";
import { usePlanActions } from "../../../hooks/ui/usePlanActions";
import { SubscriptionActions } from "./SubscriptionActions";

interface PlanCardProps {
  plan: SubscriptionPlan;
  onSelect: (plan: SubscriptionPlan) => void;
}

export function PlanCard({ plan, onSelect }: PlanCardProps) {
  const { isSelected, buttonProps } = usePlanActions(plan);

  return (
    <Card className={isSelected ? "ring-2 ring-primary" : ""}>
      <CardHeader>
        <CardTitle>{plan.name}</CardTitle>
        <div className="text-4xl font-medium">
          ${plan.price}
          <span className="text-lg font-normal text-muted-foreground">
            /{plan.period.toLowerCase()}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <CloudIcon className="h-5 w-5 text-primary" />
            <span>
              <b>Storage:</b> {formatBytes(plan.resources.storage)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CloudUploadIcon className="h-5 w-5 text-primary" />
            <span>
              <b>Upload:</b> {formatBytes(plan.resources.upload)}/month
            </span>
          </div>
          <div className="flex items-center gap-2">
            <DownloadIcon className="h-5 w-5 text-primary" />
            <span>
              <b>Download:</b> {formatBytes(plan.resources.download)}/month
            </span>
          </div>
        </div>

        <SubscriptionActions
          plan={plan}
          onSelect={onSelect}
          buttonProps={buttonProps}
        />
      </CardContent>
    </Card>
  );
}
