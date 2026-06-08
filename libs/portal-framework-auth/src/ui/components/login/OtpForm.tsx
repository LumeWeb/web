import {
  SchemaForm,
  useResetPasswordUrl,
  withTheme,
} from "@lumeweb/portal-framework-ui";
import { useLogin, useParsed } from "@refinedev/core";
import React from "react";

import { useRedirectIfAuthenticated } from "@/hooks/useRedirectIfAuthenticated";
import { AuthPage } from "@/ui/components/common/AuthPage";
import { AuthPageTitle } from "@/ui/components/common/AuthPageTitle";

import { getOtpForm } from "../../forms/otp";

export interface OtpParams {
  to?: string;
}

function OtpForm(): JSX.Element {
  const parsed = useParsed<OtpParams>();
  const login = useLogin();
  const resetPasswordUrl = useResetPasswordUrl();

  useRedirectIfAuthenticated("/dashboard", parsed.params?.to, "push");

  const otpFormConfig = getOtpForm(
    (values) => login.mutate({ ...values, redirectTo: parsed.params?.to }),
    parsed.params?.to,
  );

  return (
    <AuthPage
      beforeLink={<AuthPageTitle>Two-Factor Authentication</AuthPageTitle>}
      linkLabel="Forgot your password?"
      linkText="Reset password →"
      linkUrl={resetPasswordUrl}
      variant="login">
      <SchemaForm config={otpFormConfig} />
    </AuthPage>
  );
}

export default withTheme(OtpForm);
