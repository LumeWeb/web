import { GeneralLayout } from "~/components/general-layout";
import {
  CloudIcon,
  CloudDownloadIcon,
  CloudUploadSolidIcon,
} from "~/components/icons";
import { UpgradeAccountBanner } from "~/components/upgrade-account-banner";
import { UsageCard } from "~/components/usage-card";
import { UsageChart } from "~/components/usage-chart";
import { Authenticated } from "@refinedev/core";

export default function Dashboard() {
  return (
    <Authenticated key="dashboard">
      <GeneralLayout>
        <h1 className="font-bold mb-4 text-3xl">Dashboard</h1>
        <UpgradeAccountBanner />
        <h2 className="font-bold mb-8 mt-10 text-2xl">Current Usage</h2>
        <div className="grid grid-cols-2 gap-8">
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
        <h2 className="font-bold mb-8 mt-10 text-2xl">Historical Usage</h2>
        <div className="grid gap-8 grid-cols-2">
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
