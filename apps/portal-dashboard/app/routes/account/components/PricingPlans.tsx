// src/components/PricingPlans.tsx
import React, { useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/util/cn.js";
import filesize from "@/util/filesize.js";
import HyperPayment from "./HyperPayment";
import { SubscriptionPlan } from "@/dataProviders/accountProvider";
import useSubmitSubscriptionConnect from "../hooks/useSubmitSubscriptionConnect";
import { useSubscriptionContext } from "@/routes/account/contexts/SubscriptionContext.js";
import useOnFreePlan from "@/hooks/useOnFreePlan";

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
    new Date(subscription?.payment_info?.payment_expires!) <= new Date();
  const planPending = subscription?.plan?.status === "PENDING";
  const showPayment =
    !!subscription?.payment_info?.payment_id &&
    !!subscription?.payment_info?.client_secret &&
    planPending &&
    !paymentExpired;

  const isBillingComplete =
    subscription?.billing_info?.name &&
    subscription?.billing_info?.address &&
    subscription?.billing_info?.city &&
    subscription?.billing_info?.state &&
    subscription?.billing_info?.zip &&
    subscription?.billing_info?.country;

  const onFreePlan = useOnFreePlan();

  const formatStorage = (storage: number) => filesize(storage, 0).toUpperCase();
  const formatBandwidth = (bandwidth: number) =>
    filesize(bandwidth, 0).toUpperCase();

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

  const getChangeType = (
    currentPlan: SubscriptionPlan,
    newPlan: SubscriptionPlan,
  ) => {
    if (onFreePlan) {
      return "Subscribe";
    }

    const currentIndex = plans.findIndex(
      (p: { identifier: string }) => p.identifier === currentPlan.identifier,
    );
    const newIndex = plans.findIndex(
      (p: { identifier: string }) => p.identifier === newPlan.identifier,
    );
    return newIndex > currentIndex ? "Upgrade" : "Downgrade";
  };

  const renderPlanCard = (plan: SubscriptionPlan) => (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-2xl md:text-3xl lg:text-4xl font-bold">
          {plan.name}
        </CardTitle>
        <div className="text-4xl md:text-5xl lg:text-6xl font-bold">
          ${plan.price}
          <span className="text-lg md:text-xl lg:text-2xl font-normal text-muted-foreground">
            /{plan.period === "MONTH" ? "month" : "year"}
          </span>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 md:gap-6 lg:gap-8">
        <ul className="space-y-2">
          <li>Storage: {formatStorage(plan.storage)}</li>
          <li>Upload: {formatBandwidth(plan.upload)}/month</li>
          <li>Download: {formatBandwidth(plan.download)}/month</li>
        </ul>
        {!subscription?.plan && (
          <Button onClick={() => handleChoosePlan(plan)}>Subscribe</Button>
        )}
        {subscription?.plan &&
          plan.identifier !== subscription.plan.identifier && (
            <Button onClick={() => handleChoosePlan(plan)}>
              {getChangeType(subscription.plan, plan)}
            </Button>
          )}
        {plan.identifier === subscription?.plan?.identifier && (
          <div className="text-primary font-semibold text-center">
            Current Plan
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (isLoading || isPlanChanging) {
    return (
      <Carousel className="w-full">
        <CarouselContent>
          {[...Array(3)].map((_, index) => (
            <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
              <Skeleton className="h-[400px] w-full rounded-lg" />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    );
  }

  return (
    <>
      <Carousel className="w-full">
        <CarouselContent>
          {plans.map(
            (plan: SubscriptionPlan, index: React.Key | null | undefined) => (
              <CarouselItem
                key={index}
                className={cn("md:basis-1/2", "lg:basis-1/3", {
                  "ring-1 ring-primary": [
                    subscription?.plan?.identifier,
                    selectedPlan?.identifier,
                  ].includes(plan.identifier),
                })}>
                <div className="p-4 md:p-6 lg:p-8">{renderPlanCard(plan)}</div>
              </CarouselItem>
            ),
          )}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>

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
                ? `Are you sure you want to ${getChangeType(subscription.plan, selectedPlan)} to the ${selectedPlan?.name} plan?`
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
    </>
  );
}
