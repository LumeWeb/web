import { useSubscriptionStatus } from "@lumeweb/portal-plugin-billing";

interface UseIsSubscribedReturn {
  isSubscribed: boolean;
  isBusy: boolean;
  hasError: boolean;
}

export function useIsSubscribed(enabled = true): UseIsSubscribedReturn {
  const { data, isBusy, hasError } = useSubscriptionStatus({
    queryOptions: { enabled },
  });

  return {
    isSubscribed: data?.is_subscribed === true,
    isBusy,
    hasError,
  };
}
