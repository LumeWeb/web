import { UsageCard } from "@/components/UsageCard.js";
import { AddIcon, CloudIcon } from "@/components/icons.js";
import { Link } from "@remix-run/react";
import { Button } from "@/components/ui/button.js";
import useSubscription from "@/hooks/useSubscription.js";
import useIsBillingEnabled from "@/hooks/useIsBillingEnabled.js";
import { useCurrentUsage } from "@/hooks/useCurrentUsage.js";

export default function AccountUsage() {
  const subscription = useSubscription();
  const billingEnabled = useIsBillingEnabled();
  const usage = useCurrentUsage();

  return (
    <UsageCard
      label="Usage"
      currentUsage={usage?.storage}
      maxUsage={subscription.subscriptionData?.plan?.storage! ?? 999}
      icon={<CloudIcon className="text-foreground" />}
      button={
        billingEnabled && (
          <Link to="/account/subscription">
            <Button variant="accent" className="gap-x-2 h-12 text-foreground">
              <AddIcon />
              Upgrade Plan
            </Button>
          </Link>
        )
      }
    />
  );
}
