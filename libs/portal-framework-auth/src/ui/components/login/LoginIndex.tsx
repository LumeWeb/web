import {
  InlineAuthLinkBanner,
  useFeatureFlag,
  useRegisterUrl,
  withTheme,
} from "@lumeweb/portal-framework-ui";
import React from "react";

import { AuthPage } from "@/ui/components/common/AuthPage";
import { LoginForm } from "./LoginForm";
import { SocialLogin } from "./SocialLogin";

function LoginIndex() {
  const showRegister = true;
  const socialLoginEnabled = useFeatureFlag("social_login");
  const registerUrl = useRegisterUrl();

  return (
    <AuthPage variant="login">
      <div className="absolute inset-0 flex sm:hidden flex-col items-start justify-center gap-2 text-left p-4 mt-60 sm:mt-10">
        <h2 className="text-4xl sm:text-3xl font-bold">Welcome back</h2>
        {showRegister && (
          <InlineAuthLinkBanner
            label="New user?"
            linkLabel="Create an account →"
            to={registerUrl}
          />
        )}
      </div>
      {socialLoginEnabled && <SocialLogin />}
      <div className="hidden sm:flex flex-col items-start justify-center gap-2 text-left mb-10">
        <h2 className="text-4xl mb-2">Welcome back</h2>
        {showRegister && (
          <InlineAuthLinkBanner
            label="New user?"
            linkLabel="Create an account →"
            to={registerUrl}
          />
        )}
      </div>
      <LoginForm />
    </AuthPage>
  );
}

export default withTheme(LoginIndex);
