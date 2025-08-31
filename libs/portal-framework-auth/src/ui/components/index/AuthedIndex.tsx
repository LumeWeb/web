import { Loading, withTheme } from "@lumeweb/portal-framework-ui";
import { Authenticated } from "@refinedev/core";
import React from "react";
import { Navigate } from "react-router";

function AuthedIndex() {
  return (
    <Authenticated
      key={"index"}
      loading={<Loading aria-label="Checking login status" />}
      v3LegacyAuthProviderCompatible>
      <Navigate replace to="/dashboard" />
    </Authenticated>
  );
}

export default withTheme(AuthedIndex);
