import SubscribePayment from "@/routes/account/components/SubscribePayment";
import { useSubscriptionContext } from "@/routes/account/contexts/SubscriptionContext.js";
import { CloudIcon, CloudUploadIcon, DownloadIcon } from "portal-shared/components/icons";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "portal-shared/components/ui/alert-dialog";
import { Button } from "portal-shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "portal-shared/components/ui/card";
import { Progress } from "portal-shared/components/ui/progress";
import { Skeleton } from "portal-shared/components/ui/skeleton";
import type { SubscriptionPlan, SubscriptionResponse } from "portal-shared/dataProviders/accountProvider";
import useOnFreePlan from "portal-shared/hooks/useOnFreePlan";
import { cn } from "portal-shared/util/cn.js";
import filesize from "portal-shared/util/filesize.js";
import { useEffect, useState } from "react";



// TODO(@pcfreak30): Changing plan is buggy when PAID_BILLING is disabled. It is requesting that the billing information is complete when it is not needed.
export default function PricingPlans() {
  const {
    subscription,
    plans,
    selectedPlan,
    handlePlanSelection,
    isPlanChanging,
    submitPlanChange,
    isLoading,
  } = useSubscriptionContext();

  const [showBillingDialog, setShowBillingDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  const paymentExpired =
    new Date(subscription?.payment_info?.payment_expires ?? "") <= new Date();
  const planPending = subscription?.plan?.status === "PENDING";
  const showPayment =
    !!subscription?.payment_info?.payment_id &&
    !!subscription?.payment_info?.client_secret &&
    planPending &&
    !paymentExpired &&
    !!subscription?.plan?.is_free;

  const isBillingComplete =
    subscription?.billing_info?.name &&
    subscription?.billing_info?.address &&
    subscription?.billing_info?.city &&
    subscription?.billing_info?.state &&
    subscription?.billing_info?.zip &&
    subscription?.billing_info?.country;

  const onFreePlan = useOnFreePlan();

  const handleChoosePlan = (plan: SubscriptionPlan) => {
    handlePlanSelection(plan);
    if (!isBillingComplete) {
      setShowBillingDialog(true);
    } else {
      setShowConfirmDialog(true);
    }
  };

  const handleConfirmPlanChange = async () => {
    setShowConfirmDialog(false);
    if (selectedPlan) {
      await submitPlanChange(selectedPlan);
    }
  };

  useEffect(() => {
    if (showPayment) {
      setShowPaymentDialog(true);
    }
  }, [showPayment]);

  useEffect(() => {
    if (paymentExpired && planPending) {
      submitPlanChange(subscription?.plan);
    }
  }, [paymentExpired, planPending, submitPlanChange, subscription?.plan]);

  if (isLoading || isPlanChanging) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-[200px] w-full" />
        <div className="grid md:grid-cols-2 gap-8">
          <Skeleton className="h-[400px]" />
          <Skeleton className="h-[400px]" />
        </div>
      </div>
    );
  }
  const plan = subscription?.plan;
  // TODO(@pcfreak30): Get actual storage used
  const storageUsed = 1000000000; // This is in bytes
  const storagePercent = plan ? (storageUsed / (plan?.storage ?? 0)) * 100 : 0;

  return (
    <>
      {plan && (
        <Card className="mb-8 bg-transparent border">
        <CardHeader>
          <CardTitle>Current Plan: {plan.name}</CardTitle>
          <div className="text-4xl font-medium">
            ${plan?.price}/{plan?.period === "MONTH" ? "mo" : "yr"}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span>Storage Used</span>
                <span>{formatStorage(storageUsed)} / {formatStorage(plan.storage)}</span>
              </div>
              <Progress value={storagePercent} />
              {storagePercent > 80 && (
                <p className="text-red-500 text-sm mt-1">
                  Running low on storage! Consider upgrading.
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      )}
      {!subscription ? (
        <div className="grid md:grid-cols-3 gap-8">
          <Skeleton className="h-[400px]" />
          <Skeleton className="h-[400px]" />
          <Skeleton className="h-[400px]" />
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div
              key={plan.identifier}
              className={cn(
                "md:col-span-1",
                {
                  "ring-2 ring-primary rounded-xl": [
                    subscription?.plan?.identifier,
                    selectedPlan?.identifier,
                  ].includes(plan.identifier),
                },
                {
                  "md:col-span-3": index === plans.length - 1 && plans.length % 3 === 1,
                  "md:col-span-2": index === plans.length - 1 && plans.length % 3 === 2,
                }
              )}>
              <PlanCard 
                plan={plan}
                subscription={subscription}
                selectedPlan={selectedPlan}
                onChoosePlan={handleChoosePlan}
                onFreePlan={onFreePlan}
              />
            </div>
          ))}
        </div>
      )}
      <AlertDialog open={showBillingDialog} onOpenChange={setShowBillingDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Complete Billing Information</AlertDialogTitle>
            <AlertDialogDescription>
              {subscription?.plan
                ? "Please complete your billing information before changing your plan."
                : "Please complete your billing information before subscribing."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Ok</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {subscription?.plan
                ? "Confirm Plan Change"
                : "Confirm Subscription"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {subscription?.plan && selectedPlan
                ? `Are you sure you want to ${onFreePlan ? "Subscribe" : selectedPlan.price > subscription.plan.price ? "Upgrade" : "Downgrade"} to the ${selectedPlan?.name} plan?`
                : `Are you sure you want to subscribe to the ${selectedPlan?.name} plan?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmPlanChange}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {showPaymentDialog && <SubscribePayment />}
    </>
  );
}

const formatStorage = (storage: number) => filesize(storage, 0).toUpperCase();
const formatBandwidth = (bandwidth: number) => filesize(bandwidth, 0).toUpperCase();

function PlanCard(props: {
  plan: SubscriptionPlan;
  subscription: SubscriptionResponse;
  selectedPlan: SubscriptionPlan | null;
  onChoosePlan: (plan: SubscriptionPlan) => void;
  onFreePlan: boolean;
}) {
  const { plan, subscription, onChoosePlan, onFreePlan } = props;
  const getChangeType = (currentPlan: SubscriptionPlan, newPlan: SubscriptionPlan) => {
    if (onFreePlan) {
      return "Subscribe";
    }

    return newPlan.price > currentPlan.price ? "Upgrade" : "Downgrade";
  };

  const planPending = subscription?.plan?.status === "PENDING";

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-4xl font-bold">
          {plan.name}
        </CardTitle>
        <div className="text-5xl">
          ${plan.price}
          <span className="text-lg font-normal text-muted-foreground">
            /{plan.period === "MONTH" ? "month" : "year"}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <CloudIcon className="size-5 text-primary" />
            <span><b>Storage:</b> {formatStorage(plan.storage)}</span>
          </div>
          <div className="flex items-center gap-2">
            <CloudUploadIcon className="size-5 text-primary" />
            <span><b>Upload:</b> {formatBandwidth(plan.upload)}/month</span>
          </div>
          <div className="flex items-center gap-2">
            <DownloadIcon className="size-5 text-primary" />
            <span><b>Download:</b> {formatBandwidth(plan.download)}/month</span>
          </div>
        </div>
        
        {!subscription?.plan && (
          <Button className="w-full" onClick={() => onChoosePlan(plan)}>
            Subscribe
          </Button>
        )}
        {subscription?.plan &&
          plan.identifier !== subscription.plan.identifier && (
            <Button className="w-full bg-muted-foreground text-black hover:bg-muted-foreground/80" onClick={() => onChoosePlan(plan)}>
              {getChangeType(subscription.plan, plan)}
            </Button>
          )}
        {plan.identifier === subscription?.plan?.identifier && (
          <div className="text-primary font-semibold text-center">
            {planPending ? "Pending Plan" : "Current Plan"}
          </div>
        )}
      </CardContent>
    </Card>
  );
}