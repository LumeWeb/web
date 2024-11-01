import { u as useFeatureFlag } from "./useFeatureFlag-D-GCpHdz.js";
import { s as si, a as ii } from "./index-C-G3KncW.js";
function useIsPaidBillingEnabled() {
  return useFeatureFlag("paid_billing");
}
function useApiUrl() {
  return si().replace(/\/+$/, "");
}
function useSubscription() {
  const apiUrl = useApiUrl();
  const {
    data: subscriptionData,
    isLoading: subscriptionIsLoading,
    isError: subscriptionIsError,
    refetch: refetchSubscription
  } = ii({
    url: `${apiUrl}/api/account/subscription`,
    method: "get",
    queryOptions: {
      retry: (failureCount, error) => {
        if ((error == null ? void 0 : error.statusCode) === 404) {
          return false;
        }
        return failureCount < 3;
      }
    }
  });
  return {
    subscriptionData: subscriptionData == null ? void 0 : subscriptionData.data,
    subscriptionIsLoading,
    refetchSubscription,
    subscriptionIsError
  };
}
export {
  useApiUrl as a,
  useIsPaidBillingEnabled as b,
  useSubscription as u
};
