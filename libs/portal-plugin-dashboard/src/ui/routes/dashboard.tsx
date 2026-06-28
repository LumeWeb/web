import {
  createNamespacedId,
  GridWidgetArea,
} from "@lumeweb/portal-framework-core";
import { GeneralLayout } from "@lumeweb/portal-framework-ui";
import { Authenticated } from "@refinedev/core";
import React from "react";

const DASHBOARD_HEADER_AREA = createNamespacedId("dashboard", "header");

function Dashboard() {
  return (
    <Authenticated key="dashboard" v3LegacyAuthProviderCompatible={false}>
      <GeneralLayout>
        <GridWidgetArea id={DASHBOARD_HEADER_AREA} />
      </GeneralLayout>
    </Authenticated>
  );
}

export default Dashboard;