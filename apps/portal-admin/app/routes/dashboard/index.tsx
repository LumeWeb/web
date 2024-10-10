import { Authenticated } from "@refinedev/core";
import { GeneralLayout } from "portal-shared/components/layout/GeneralLayout";

export default function Dashboard() {
  return (
    <Authenticated key="dashboard" v3LegacyAuthProviderCompatible={false}>
      <GeneralLayout showUploadForm={false}></GeneralLayout>
    </Authenticated>
  );
}
