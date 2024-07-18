import { GeneralLayout } from "~/components/layout/GeneralLayout";
import { Authenticated } from "@refinedev/core";

export default function Dashboard() {
  return (
    <Authenticated key="dashboard" v3LegacyAuthProviderCompatible={false}>
      <GeneralLayout></GeneralLayout>
    </Authenticated>
  );
}
