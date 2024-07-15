import { GeneralLayout } from "~/components/layout/GeneralLayout";
import {
  CloudDownloadIcon,
  CloudIcon,
  CloudUploadSolidIcon,
  CurrentUsageIcon,
} from "~/components/icons";
import { UpgradeAccountBanner } from "~/components/UpgradeAccountBanner";
import { UsageCard } from "~/components/UsageCard";
import { UsageChart } from "~/components/UsageChart";
import { Authenticated } from "@refinedev/core";
import SectionTitle from "~/components/SectionTitle";

export default function Dashboard() {
  return (
    <Authenticated key="dashboard" v3LegacyAuthProviderCompatible={false}>
      <GeneralLayout>
        <UpgradeAccountBanner />
        <SectionTitle
          icon={<CurrentUsageIcon className="text-foreground w-8 h-8" />}
          title="Current Usage"
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <UsageCard
            label="Storage"
            currentUsage={120}
            monthlyUsage={130}
            icon={<CloudIcon className="text-ring" />}
          />
          <UsageCard
            label="Download"
            currentUsage={2}
            monthlyUsage={10}
            icon={<CloudDownloadIcon className="text-ring" />}
          />
          <UsageCard
            label="Upload"
            currentUsage={5}
            monthlyUsage={15}
            icon={<CloudUploadSolidIcon className="text-ring" />}
          />
        </div>
        <SectionTitle
          icon={<CurrentUsageIcon className="text-foreground w-8 h-8" />}
          title="Historical Usage"
        />
        <div className="grid gap-8 grid-cols-1 lg:grid-cols-2 ">
          <UsageChart
            dataset={[
              { x: "3/2", y: "50" },
              { x: "3/3", y: "10" },
              { x: "3/4", y: "20" },
            ]}
            label="Storage"
          />
          <UsageChart
            dataset={[
              { x: "3/2", y: "50" },
              { x: "3/3", y: "10" },
              { x: "3/4", y: "20" },
            ]}
            label="Download"
          />
          <UsageChart
            dataset={[
              { x: "3/2", y: "50" },
              { x: "3/3", y: "10" },
              { x: "3/4", y: "20" },
            ]}
            label="Upload"
          />
        </div>
      </GeneralLayout>
    </Authenticated>
  );
}
