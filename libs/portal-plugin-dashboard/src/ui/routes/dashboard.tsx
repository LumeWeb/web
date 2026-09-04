import {
  createNamespacedId,
  GridWidgetArea,
} from "@lumeweb/portal-framework-core";
import { GeneralLayout } from "@lumeweb/portal-framework-ui";
import { SafeAuthenticated } from "@lumeweb/portal-framework-auth";
import React from "react";

const DASHBOARD_HEADER_AREA = createNamespacedId("dashboard", "header");

function Dashboard() {
  return (
    <SafeAuthenticated key="dashboard">
      <GeneralLayout>
        <GridWidgetArea id={DASHBOARD_HEADER_AREA} />
      </GeneralLayout>
    </SafeAuthenticated>
  );
}

export default Dashboard;