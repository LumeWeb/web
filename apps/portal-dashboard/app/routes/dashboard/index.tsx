import { Authenticated } from "@refinedev/core";
import { GeneralLayout } from "@/components/layout/GeneralLayout";
import DashboardCurrentUsage from "./components/DashboardCurrentUsage.js";
import DashboardHistoricalUsage from "./components/DashboardHistoricalUsage.js";

export default function Dashboard() {
  return (
    <Authenticated key="dashboard" v3LegacyAuthProviderCompatible={false}>
      <GeneralLayout>
        {/*<UpgradeAccountBanner />*/}
        <DashboardCurrentUsage />
        <DashboardHistoricalUsage />
      </GeneralLayout>
    </Authenticated>
  );
}
