import SectionTitle from "@/components/SectionTitle.js";
import {
  CloudDownloadIcon,
  CloudIcon,
  CloudUploadSolidIcon,
  CurrentUsageIcon,
} from "@/components/icons.js";
import { UsageCard } from "@/components/UsageCard.js";
import useIsBillingEnabled from "@/hooks/useIsBillingEnabled.js";
import { Skeleton } from "@/components/ui/skeleton.js";
import { useCurrentUsage } from "@/hooks/useCurrentUsage.js";
import useSubscription from "@/hooks/useSubscription.js";

export default function DashboardCurrentUsage() {
  const billingEnabled = useIsBillingEnabled();

  let currentUsage = useCurrentUsage();
  let subscription = useSubscription();

  let downloadLimit = -1;
  let uploadLimit = -1;
  let storageLimit = -1;

  let currentDownloadUsage = -1;
  let currentUploadUsage = -1;
  let currentStorageUsage = -1;

  if (billingEnabled) {
    if (currentUsage?.isLoading || subscription?.subscriptionIsLoading) {
      return <SkeletonLoader />;
    }

    if (!currentUsage?.isError && !subscription?.subscriptionIsError) {
      currentDownloadUsage = currentUsage?.download ?? -1;
      currentUploadUsage = currentUsage?.upload ?? -1;
      currentStorageUsage = currentUsage?.storage ?? -1;

      downloadLimit = subscription?.subscriptionData?.plan?.download ?? -1;
      uploadLimit = subscription?.subscriptionData?.plan?.upload ?? -1;
      storageLimit = subscription?.subscriptionData?.plan?.storage ?? -1;
    }
  }

  return (
    <>
      <SectionTitle
        icon={<CurrentUsageIcon className="text-foreground w-8 h-8" />}
        title="Current Usage"
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <UsageCard
          label="Storage"
          currentUsage={currentStorageUsage}
          maxUsage={storageLimit}
          icon={<CloudIcon className="text-foreground" />}
        />
        {billingEnabled && (
          <UsageCard
            label="Download"
            currentUsage={currentDownloadUsage}
            maxUsage={downloadLimit}
            icon={<CloudDownloadIcon className="text-foreground" />}
          />
        )}
        {billingEnabled && (
          <UsageCard
            label="Upload"
            currentUsage={currentUploadUsage}
            maxUsage={uploadLimit}
            icon={<CloudUploadSolidIcon className="text-foreground" />}
          />
        )}
      </div>
    </>
  );
}

const SkeletonBox = () => (
  <div className="p-4 space-y-4">
    <div className="flex items-center space-x-2">
      <Skeleton className="h-6 w-6 rounded-full" />
      <Skeleton className="h-4 w-24" />
    </div>
    <Skeleton className="h-2 w-full" />
    <Skeleton className="h-4 w-16" />
  </div>
);

const SkeletonLoader = () => {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Current Usage</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <SkeletonBox />
          <SkeletonBox />
        </div>
        <div>
          <SkeletonBox />
        </div>
      </div>
    </div>
  );
};
