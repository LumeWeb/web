import usePluginMeta from "@/hooks/usePluginMeta";
import useIsPaidBillingEnabled from "@/hooks/useIsPaidBillingEnabled";
import useSubscription from "apps/portal-dashboard/app/hooks/useSubscription";

export default function useOnFreePlan() {
  const { subscriptionData } = useSubscription();

  const freePlanName = usePluginMeta("billing", "free_plan_name");

  const paidBillingEnabled = useIsPaidBillingEnabled();

  return (
    paidBillingEnabled &&
    freePlanName &&
    subscriptionData?.plan.name === freePlanName
  );
}
