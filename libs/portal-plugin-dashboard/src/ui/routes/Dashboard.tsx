import { WidgetArea } from "@lumeweb/portal-framework-core";
import { GeneralLayout } from "@lumeweb/portal-framework-ui";
import { Authenticated } from "@refinedev/core";
import React from "react";
import "@lumeweb/portal-framework-ui-core/tailwind.css";

function Dashboard() {
  return (
    <Authenticated key="dashboard" v3LegacyAuthProviderCompatible={false}>
      <GeneralLayout>
        <WidgetArea widgetAreaId={"core:dashboard"} />
      </GeneralLayout>
    </Authenticated>
  );
}

export default Dashboard;
