import { useLoginUrl, withTheme } from "@lumeweb/portal-framework-ui";
import React from "react";
import { Outlet } from "react-router";

import { AuthPage } from "../common/AuthPage";

function ResetPasswordLayout() {
  const loginUrl = useLoginUrl();
  return (
    <AuthPage
      linkLabel="Remember your login?"
      linkText="Login here →"
      linkUrl={loginUrl}
      variant="reset-password">
      <Outlet />
    </AuthPage>
  );
}

export default withTheme(ResetPasswordLayout);
