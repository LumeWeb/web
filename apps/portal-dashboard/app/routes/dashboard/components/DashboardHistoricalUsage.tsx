import SectionTitle from "portal-shared/components/SectionTitle";
import { CurrentUsageIcon } from "portal-shared/components/icons";
import { UsageChart } from "portal-shared/components/UsageChart";
import { UsageData, useUsageHistory } from "@/hooks/useUsageHistory.js";
import { Skeleton } from "portal-shared/components/ui/skeleton.js";
import filesize from "portal-shared/util/filesize.js";
import useSubscription from "@/hooks/useSubscription";
import useIsBillingEnabled from "portal-shared/hooks/useIsBillingEnabled";
import { fileProvider } from "@/dataProviders/old/file-provider";
import { padFileSizeDefault } from "libs/libs5-crypto";

export default function DashboardHistoricalUsage() {
  const { usageHistory: storageData, isLoading: isStorageLoading } =
    useUsageHistory("storage");
  const { usageHistory: downloadData, isLoading: isDownloadLoading } =
    useUsageHistory("download");
  const { usageHistory: uploadData, isLoading: isUploadLoading } =
    useUsageHistory("upload");

  const billingEnabled = useIsBillingEnabled();
  let subscription = useSubscription();

  const processedStorageData = processUsageData(storageData);
  const processedDownloadData = processUsageData(downloadData);
  const processedUploadData = processUsageData(uploadData);

  let downloadLimit = -1;
  let uploadLimit = -1;
  let storageLimit = -1;

  if (billingEnabled) {
    if (
      !subscription?.subscriptionIsLoading &&
      !subscription?.subscriptionIsError
    ) {
      downloadLimit = subscription?.subscriptionData?.plan?.download ?? -1;
      uploadLimit = subscription?.subscriptionData?.plan?.upload ?? -1;
      storageLimit = subscription?.subscriptionData?.plan?.storage ?? -1;
    }
  }

  return (
    <>
      <SectionTitle
        icon={<CurrentUsageIcon className="text-foreground w-8 h-8" />}
        title="Historical Usage"
      />
      <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
        {isStorageLoading ? (
          <Skeleton className="w-full h-full" />
        ) : (
          <UsageChart
            dataset={processedStorageData}
            label="Storage"
            tooltip={
              <>
                <p>Total storage used over time.</p>
                <p>Includes all files, folders, and backups.</p>
                <p>Current storage limit: {filesize(storageLimit)}</p>
                <p>Tip: Delete unused files to free up space.</p>
              </>
            }
          />
        )}
        {isDownloadLoading ? (
          <Skeleton className="w-full h-full" />
        ) : (
          <UsageChart
            dataset={processedDownloadData}
            label="Download"
            tooltip={
              <>
                <p>Total data downloaded over time.</p>
                <p>Includes all file downloads and streaming.</p>
                <p>Download limit: {filesize(downloadLimit)}</p>
                <p>Tip: Use compression to reduce download sizes.</p>
              </>
            }
          />
        )}
        {isUploadLoading ? (
          <Skeleton className="w-full h-full" />
        ) : (
          <UsageChart
            dataset={processedUploadData}
            label="Upload"
            tooltip={
              <>
                <p>Total data uploaded over time.</p>
                <p>Includes all file uploads and backups.</p>
                <p>Upload limit: {filesize(uploadLimit)}</p>
                <p>Tip: Compress large files before uploading.</p>
              </>
            }
          />
        )}
      </div>
    </>
  );
}

interface ProcessedUsageData {
  x: string; // Formatted date string (M/D)
  y: string; // Usage as string
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

const processUsageData = (data: UsageData[]): ProcessedUsageData[] => {
  return data.map((item) => ({
    x: item.date,
    y: filesize(item.usage),
  }));
};
