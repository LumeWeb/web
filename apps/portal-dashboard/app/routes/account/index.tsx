import { Authenticated } from "@refinedev/core";
import { GeneralLayout } from "~/components/layout/GeneralLayout.js";
import { Outlet } from "@remix-run/react";

export default function Index() {
  return (
    <Authenticated key="account" v3LegacyAuthProviderCompatible>
      <GeneralLayout>
        <Outlet />
      </GeneralLayout>
    </Authenticated>
  );
}
