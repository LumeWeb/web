import {
  useFeatureFlag,
  useRegisterUrl,
  withTheme,
} from "@lumeweb/portal-framework-ui";
import React from "react";

import { AuthPage } from "@/ui/components/common/AuthPage";

import { LoginForm } from "./LoginForm";
import { SocialLogin } from "./SocialLogin";

function LoginIndex() {
  const socialLoginEnabled = useFeatureFlag("social_login");
  const registerUrl = useRegisterUrl();

  return (
    <AuthPage
      beforeLink={
        <h2 className="text-4xl sm:text-3xl font-bold mb-5">Welcome back</h2>
      }
      linkLabel="New user?"
      linkText="Create an account →"
      linkUrl={registerUrl}
      variant="login">
      {socialLoginEnabled && <SocialLogin />}
      <LoginForm />
    </AuthPage>
  );
}

export default withTheme(LoginIndex);
