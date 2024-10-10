import GeneralLayout from "@/components/layout/GeneralLayout";
import { Authenticated } from "@refinedev/core";
import CronTable from "./components/CronTable";

export default function Cron() {
  return (
    <Authenticated key="cron" v3LegacyAuthProviderCompatible={false}>
      <GeneralLayout>
        <CronTable />
      </GeneralLayout>
    </Authenticated>
  );
}
