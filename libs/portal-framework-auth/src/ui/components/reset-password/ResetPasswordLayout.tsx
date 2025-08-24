import { useLoginUrl, withTheme } from "@lumeweb/portal-framework-ui";
import React from "react";
import { Outlet, useLocation, useMatches } from "react-router";

import { AuthPage } from "@/ui/components/common/AuthPage";
import { AuthPageTitle } from "@/ui/components/common/AuthPageTitle";

const PAGE_CONFIG = {
  "/reset-password": {
    linkLabel: "Already have an account?",
    linkText: "Login here →",
    title: "Reset your Password",
  },
  "/reset-password/confirm": {
    linkLabel: "Remember your password?",
    linkText: "Back to login →",
    title: "Confirm your password",
  },
};

function ResetPasswordLayout() {
  const loginUrl = useLoginUrl();
  const location = useLocation();
  const matches = useMatches().filter(
    (item) => item.pathname === location.pathname,
  );

  const currentPath = matches[0]?.pathname || "/reset-password";
  const { linkLabel, linkText, title } =
    PAGE_CONFIG[currentPath] || PAGE_CONFIG["/reset-password"];

  return (
    <AuthPage
      beforeLink={<AuthPageTitle>{title}</AuthPageTitle>}
      linkLabel={linkLabel}
      linkText={linkText}
      linkUrl={loginUrl}
      variant="reset-password">
      <Outlet />
    </AuthPage>
  );
}

export default withTheme(ResetPasswordLayout);
