import { Authenticated } from "@refinedev/core";
import { GeneralLayout } from "portal-shared/components/layout/GeneralLayout.js";
import { Outlet } from "@remix-run/react";

export default function Layout() {
  return (
    <Authenticated key="account" v3LegacyAuthProviderCompatible>
      <GeneralLayout>
        <Outlet />
      </GeneralLayout>
    </Authenticated>
  );
}
