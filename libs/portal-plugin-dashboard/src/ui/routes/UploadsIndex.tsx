import { createBridgeComponent } from "@lumeweb/portal-framework-core";
import { GeneralLayout, withTheme } from "@lumeweb/portal-framework-ui";
import { Authenticated } from "@refinedev/core";
import React from "react";
import "@lumeweb/portal-framework-ui-core/tailwind.css";

import Manager from "../components/uploads/Manager";

function Uploads() {
  return (
    <Authenticated key="uploads" v3LegacyAuthProviderCompatible={false}>
      <GeneralLayout>
        <Manager />
      </GeneralLayout>
    </Authenticated>
  );
}
export default createBridgeComponent(withTheme(Uploads));
