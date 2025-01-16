import React from 'react';
import { useSubscriptionContext } from '../../contexts/SubscriptionContext';
import { SubscriptionPlan } from '../../types/subscription.types';
import { Button } from 'portal-shared/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from 'portal-shared/components/ui/card';
import { CloudIcon, CloudUploadIcon, DownloadIcon, Loader2 } from "portal-shared/components/icons";
import { formatBytes } from '../../utils/formatBytes';

interface PlanSelectorProps {
  onPlanSelect: (plan: SubscriptionPlan) => void;
}

export function PlanSelector({ onPlanSelect }: PlanSelectorProps) {
  const {
    subscription,
    plans,
    selectedPlan,
    isProcessing,
  } = useSubscriptionContext();

  const getButtonLabel = (plan: SubscriptionPlan) => {
    if (isProcessing) {
      return (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      );
    }

    if (subscription?.plan.id === plan.id) {
      return 'Current Plan';
    }

    if (!subscription) {
      return 'Select Plan';
    }

    return plan.price > subscription.plan.price ? 'Upgrade' : 'Downgrade';
  };

  const getButtonVariant = (plan: SubscriptionPlan) => {
    return subscription?.plan.id === plan.id ? 'outline' : 'default';
  };

  return (
    <div className="grid md:grid-cols-3 gap-8">
      {plans.map((plan) => (
        <Card key={plan.id} className={subscription?.plan.id === plan.id ? 'ring-2 ring-primary' : ''}>
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

            <Button
              className="w-full"
              variant={getButtonVariant(plan)}
              onClick={() => onPlanSelect(plan)}
              disabled={isProcessing || subscription?.plan.id === plan.id}
            >
              {getButtonLabel(plan)}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
