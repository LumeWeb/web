import React from 'react';
import { useSubscriptionContext } from '../../contexts/SubscriptionContext';
import { formatBytes } from '../../utils/formatBytes';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from 'portal-shared/components/ui/card';
import { Progress } from 'portal-shared/components/ui/progress';
import { Button } from 'portal-shared/components/ui/button';
import { AlertCircle, CheckCircle2, Clock, XCircle } from 'portal-shared/components/icons';

export function SubscriptionStatus() {
  const {
    subscription,
    isLoading,
    error,
    showPaymentDialog,
    setShowPaymentDialog
  } = useSubscriptionContext();

  if (isLoading) {
    return (
      <Card className="bg-secondary/20">
        <CardHeader>
          <CardTitle>Subscription Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-secondary rounded w-3/4"></div>
            <div className="h-4 bg-secondary rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-destructive/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Error Loading Subscription
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">{error.message}</p>
        </CardContent>
      </Card>
    );
  }

  if (!subscription) {
    return (
      <Card className="bg-secondary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5" />
            No Active Subscription
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Choose a plan to get started with our services.</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = () => {
    switch (subscription.status) {
      case 'ACTIVE':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'PENDING':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'SUSPENDED':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'CANCELLED':
        return <XCircle className="h-5 w-5 text-gray-500" />;
      default:
        return null;
    }
  };

  const getStatusMessage = () => {
    switch (subscription.status) {
      case 'ACTIVE':
        return 'Your subscription is active and in good standing.';
      case 'PENDING':
        return 'Your subscription is pending payment confirmation.';
      case 'SUSPENDED':
        return 'Your subscription has been suspended due to a payment issue.';
      case 'CANCELLED':
        return 'Your subscription has been cancelled.';
      default:
        return 'Unknown subscription status';
    }
  };

  // Calculate resource usage
  const storageUsed = 0; // TODO: Get actual storage used
  const storageLimit = subscription.plan.resources.storage;
  const storagePercent = (storageUsed / storageLimit) * 100;

  const uploadUsed = 0; // TODO: Get actual upload used
  const uploadLimit = subscription.plan.resources.upload;
  const uploadPercent = (uploadUsed / uploadLimit) * 100;

  const downloadUsed = 0; // TODO: Get actual download used
  const downloadLimit = subscription.plan.resources.download;
  const downloadPercent = (downloadUsed / downloadLimit) * 100;

  return (
    <Card className="bg-secondary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          Subscription Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <p className="font-medium">{subscription.plan.name} Plan</p>
          <p className="text-sm text-muted-foreground">{getStatusMessage()}</p>
          {subscription.current_period_end && (
            <p className="text-sm text-muted-foreground">
              Current period ends: {new Date(subscription.current_period_end).toLocaleDateString()}
            </p>
          )}
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Storage</span>
              <span>{formatBytes(storageUsed)} / {formatBytes(storageLimit)}</span>
            </div>
            <Progress value={storagePercent} />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Upload</span>
              <span>{formatBytes(uploadUsed)} / {formatBytes(uploadLimit)}</span>
            </div>
            <Progress value={uploadPercent} />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Download</span>
              <span>{formatBytes(downloadUsed)} / {formatBytes(downloadLimit)}</span>
            </div>
            <Progress value={downloadPercent} />
          </div>
        </div>

        {subscription.status === 'PENDING' && !subscription.plan.is_free && (
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => setShowPaymentDialog(true)}
          >
            Complete Payment
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
