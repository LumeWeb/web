import { withTheme } from "@lumeweb/portal-framework-ui";
import React from "react";
import { Outlet } from "react-router";

import { AuthPage } from "../common/AuthPage";

function ResetPasswordLayout() {
  return (
    <AuthPage variant="reset-password">
      <Outlet />
    </AuthPage>
  );
}

export default withTheme(ResetPasswordLayout);
