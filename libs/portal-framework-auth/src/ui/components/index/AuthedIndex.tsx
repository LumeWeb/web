import { withTheme } from "@lumeweb/portal-framework-ui";
import { Authenticated } from "@refinedev/core";
import React from "react";
import "@lumeweb/portal-framework-ui-core/tailwind.css";
import { Navigate } from "react-router";

function AuthedIndex() {
  return (
    <Authenticated
      key={"index"}
      loading={<>Checking Login Status</>}
      v3LegacyAuthProviderCompatible>
      <Navigate replace to="/dashboard" />
    </Authenticated>
  );
}

export default withTheme(AuthedIndex);
