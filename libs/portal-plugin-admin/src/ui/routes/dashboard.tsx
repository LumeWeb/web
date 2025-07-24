import { GeneralLayout } from "@lumeweb/portal-framework-ui";
import { Authenticated } from "@refinedev/core";
import "@lumeweb/portal-framework-ui-core/tailwind-plugin.css";
import React from "react";

function Dashboard() {
  return (
    <Authenticated key="dashboard" v3LegacyAuthProviderCompatible={false}>
      <GeneralLayout></GeneralLayout>
    </Authenticated>
  );
}

export default Dashboard;
