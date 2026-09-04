import { GeneralLayout, withTheme } from "@lumeweb/portal-framework-ui";
import { SafeAuthenticated } from "@lumeweb/portal-framework-auth";
import React from "react";
import { Outlet } from "react-router";
import "@lumeweb/portal-framework-ui-core/tailwind-plugin.css";

function AccountLayout() {
  return (
    <SafeAuthenticated key="account">
      <GeneralLayout>
        <Outlet />
      </GeneralLayout>
    </SafeAuthenticated>
  );
}
export default withTheme(AccountLayout);
