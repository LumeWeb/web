import {
  useFeatureFlag,
  useRegisterUrl,
  withTheme,
} from "@lumeweb/portal-framework-ui";
import React from "react";

import { useBrand } from "@lumeweb/portal-framework-core";
import { useRedirectIfAuthenticated } from "@/hooks/useRedirectIfAuthenticated";
import { useSafeRedirectTo } from "@/hooks/useSafeRedirectTo";
import { AuthPage } from "@/ui/components/common/AuthPage";
import { AuthPageTitle } from "@/ui/components/common/AuthPageTitle";

import { LoginForm } from "./LoginForm";
import { SocialLogin } from "./SocialLogin";

function LoginIndex() {
  const socialLoginEnabled = useFeatureFlag("social_login");
  const registerUrl = useRegisterUrl();
  const brand = useBrand();

  const redirectTo = useSafeRedirectTo();
  const registerUrlWithTo = redirectTo
    ? `${registerUrl}?to=${encodeURIComponent(redirectTo)}`
    : registerUrl;

  useRedirectIfAuthenticated("/dashboard", redirectTo);

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
