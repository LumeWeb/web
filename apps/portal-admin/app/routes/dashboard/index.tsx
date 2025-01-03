import { Authenticated } from "@refinedev/core";
import GeneralLayout from "@/components/layout/GeneralLayout";

export default function Dashboard() {
  return (
    <Authenticated key="dashboard" v3LegacyAuthProviderCompatible={false}>
      <GeneralLayout></GeneralLayout>
    </Authenticated>
  );
}
