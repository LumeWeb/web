import { createBridgeComponent } from "@lumeweb/portal-framework-core";
import { GeneralLayout } from "@lumeweb/portal-framework-ui";
import { Authenticated } from "@refinedev/core";
import React from "react";

function Dashboard() {
  return (
    <Authenticated key="dashboard" v3LegacyAuthProviderCompatible={false}>
      <GeneralLayout></GeneralLayout>
    </Authenticated>
  );
}

export default Dashboard;
