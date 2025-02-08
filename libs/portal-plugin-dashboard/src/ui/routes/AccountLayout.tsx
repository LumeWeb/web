import { createBridgeComponent } from "@lumeweb/portal-framework-core";
import { GeneralLayout, withTheme } from "@lumeweb/portal-framework-ui";
import { Authenticated } from "@refinedev/core";
import React from "react";
import { Outlet } from "react-router";
import "@lumeweb/portal-framework-ui-core/tailwind.css";

function AccountLayout() {
  return (
    <Authenticated key="account" v3LegacyAuthProviderCompatible>
      <GeneralLayout>
        <Outlet />
      </GeneralLayout>
    </Authenticated>
  );
}
export default createBridgeComponent(withTheme(AccountLayout));
