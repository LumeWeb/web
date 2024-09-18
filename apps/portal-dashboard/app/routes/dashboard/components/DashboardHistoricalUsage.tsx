import SectionTitle from "@/components/SectionTitle.js";
import { CurrentUsageIcon } from "@/components/icons.js";
import { UsageChart } from "@/components/UsageChart.js";
import { UsageData, useUsageHistory } from "@/hooks/useUsageHistory.js";
import { Skeleton } from "@/components/ui/skeleton.js";
import filesize from "@/util/filesize.js";

export default function DashboardHistoricalUsage() {
  const { usageHistory: storageData, isLoading: isStorageLoading } =
    useUsageHistory("storage");
  const { usageHistory: downloadData, isLoading: isDownloadLoading } =
    useUsageHistory("download");
  const { usageHistory: uploadData, isLoading: isUploadLoading } =
    useUsageHistory("upload");

  const processedStorageData = processUsageData(storageData);
  const processedDownloadData = processUsageData(downloadData);
  const processedUploadData = processUsageData(uploadData);

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
          <UsageChart dataset={processedStorageData} label="Storage" />
        )}
        {isDownloadLoading ? (
          <Skeleton className="w-full h-full" />
        ) : (
          <UsageChart dataset={processedDownloadData} label="Download" />
        )}
        {isUploadLoading ? (
          <Skeleton className="w-full h-full" />
        ) : (
          <UsageChart dataset={processedUploadData} label="Upload" />
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
