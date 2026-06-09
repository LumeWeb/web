import {
  useFeatureFlag,
  useRegisterUrl,
  withTheme,
} from "@lumeweb/portal-framework-ui";
import React from "react";
import { useSearchParams } from "react-router";

import { useBrand } from "@lumeweb/portal-framework-core";
import { useRedirectIfAuthenticated } from "@/hooks/useRedirectIfAuthenticated";
import { AuthPage } from "@/ui/components/common/AuthPage";
import { AuthPageTitle } from "@/ui/components/common/AuthPageTitle";

import { LoginForm } from "./LoginForm";
import { SocialLogin } from "./SocialLogin";

function LoginIndex() {
  const socialLoginEnabled = useFeatureFlag("social_login");
  const registerUrl = useRegisterUrl();
  const [searchParams] = useSearchParams();
  const brand = useBrand();

  const to = searchParams.get("to");
  const registerUrlWithTo = to
    ? `${registerUrl}?to=${encodeURIComponent(to)}`
    : registerUrl;

  useRedirectIfAuthenticated("/dashboard", to);

  return (
    <AuthPage
      beforeLink={<AuthPageTitle>Welcome back!</AuthPageTitle>}
      brand={brand}
      linkLabel="New user?"
      linkText="Create an account →"
      linkUrl={registerUrlWithTo}
      variant="login">
      {socialLoginEnabled && <SocialLogin />}
      <LoginForm />
    </AuthPage>
  );
}

export default withTheme(LoginIndex);
