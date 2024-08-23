import useSubscription from "./useSubscription.js";

export default function useBillingInfo() {
  const { subscriptionData, subscriptionIsLoading } = useSubscription();

  return {
    billingInfo: subscriptionData?.billing_info,
    isLoading: subscriptionIsLoading,
  };
}
