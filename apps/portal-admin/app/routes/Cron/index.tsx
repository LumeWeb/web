import { GeneralLayout } from "~/components/layout/GeneralLayout";
import { Authenticated } from "@refinedev/core";
import CronTable from "./components/CronTable";

export default function Dashboard() {
  return (
    <Authenticated key="dashboard" v3LegacyAuthProviderCompatible={false}>
      <GeneralLayout>
        <CronTable />
      </GeneralLayout>
    </Authenticated>
  );
}
