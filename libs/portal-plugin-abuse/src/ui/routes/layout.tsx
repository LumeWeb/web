import { Layout as BaseLayout } from "@/ui/components/layout/Layout";
import { GeneralLayout } from "@lumeweb/portal-framework-ui";
import { Authenticated } from "@refinedev/core";
import React from "react";
import { Outlet } from "react-router";

function Layout() {
  return (
    <Authenticated key="dashboard" v3LegacyAuthProviderCompatible={false}>
      <GeneralLayout>
        <BaseLayout>
          <Outlet />
        </BaseLayout>
      </GeneralLayout>
    </Authenticated>
  );
}

//export default AbuseLayout;
export default Layout;
