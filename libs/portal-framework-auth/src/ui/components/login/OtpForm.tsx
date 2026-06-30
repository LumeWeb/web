import {
  SchemaForm,
  useResetPasswordUrl,
  withTheme,
} from "@lumeweb/portal-framework-ui";
import { useLogin, useParsed } from "@refinedev/core";
import React from "react";

import { useBrand } from "@lumeweb/portal-framework-core";
import { useRedirectIfAuthenticated } from "@/hooks/useRedirectIfAuthenticated";
import { isExternalRedirect, sanitizeRedirectUrl } from "@/dataProviders/auth";
import { AuthPage } from "@/ui/components/common/AuthPage";
import { AuthPageTitle } from "@/ui/components/common/AuthPageTitle";

import { getOtpForm } from "../../forms/otp";

export interface OtpParams {
  to?: string;
}

function OtpForm(): React.JSX.Element {
  const parsed = useParsed<OtpParams>();
  const login = useLogin();
  const resetPasswordUrl = useResetPasswordUrl();
  const brand = useBrand();

  const redirectTo = sanitizeRedirectUrl(parsed.params?.to);

  useRedirectIfAuthenticated("/dashboard", redirectTo, "push");

  const otpFormConfig = getOtpForm(
    (values) =>
      login.mutate(
        { ...values, redirectTo },
        {
          onSuccess: (result) => {
            if (result.success && isExternalRedirect(redirectTo)) {
              window.location.href = redirectTo;
            }
          },
        },
      ),
    redirectTo,
  );

  return (
    <AuthPage
      beforeLink={<AuthPageTitle>Two-Factor Authentication</AuthPageTitle>}
      brand={brand}
      linkLabel="Forgot your password?"
      linkText="Reset password →"
      linkUrl={resetPasswordUrl}
      variant="login">
      <SchemaForm config={otpFormConfig} />
    </AuthPage>
  );
}

export default withTheme(OtpForm);
