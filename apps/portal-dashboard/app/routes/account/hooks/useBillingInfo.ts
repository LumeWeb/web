import useSubscription from "apps/portal-dashboard/app/hooks/useSubscription.js";

export default function useBillingInfo() {
  const { subscriptionData, subscriptionIsLoading } = useSubscription();

  return {
    billingInfo: subscriptionData?.billing,
    isLoading: subscriptionIsLoading || !subscriptionData,
  };
}
